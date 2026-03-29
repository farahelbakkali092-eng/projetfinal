# =============================================================================
#  setup-metabase.ps1
#  Automatise l'installation et la configuration de Metabase (local) pour
#  un projet Laravel + React sur Windows.
#
#  USAGE : Ouvrez PowerShell en tant qu'administrateur, puis lancez :
#          .\setup-metabase.ps1
# =============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Couleurs utilitaires ──────────────────────────────────────────────────────
function Write-Step   { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK     { param($msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn   { param($msg) Write-Host "    [!]  $msg" -ForegroundColor Yellow }
function Write-Fail   { param($msg) Write-Host "    [X]  $msg" -ForegroundColor Red; exit 1 }

# ── Configuration — adaptez ces valeurs si nécessaire ────────────────────────
$METABASE_URL        = "http://localhost:3000"
$METABASE_CONTAINER  = "metabase"
$METABASE_PORT       = 3000

$ADMIN_EMAIL         = "admin@cosmetic.local"
$ADMIN_PASSWORD      = "Admin@1234!"
$ADMIN_FIRSTNAME     = "Admin"
$ADMIN_LASTNAME      = "Local"
$ADMIN_SITE_NAME     = "DAWSM Cosmetics"

$DASHBOARD_NAME      = "DAWSM GLOBAL INSIGHTS"

$LARAVEL_DIR         = "$PSScriptRoot\BACKENDECOMERCE"
$FRONTEND_DIR        = "$PSScriptRoot\frontendd"
$ENV_FILE            = "$LARAVEL_DIR\.env"

# =============================================================================
# ÉTAPE 0 – Vérification des prérequis
# =============================================================================
Write-Step "Vérification des prérequis"

if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Fail "Docker n'est pas installé ou non accessible. Installez Docker Desktop : https://www.docker.com/products/docker-desktop"
}
Write-OK "Docker trouvé."

# =============================================================================
# ÉTAPE 1 – Lancement de Metabase via Docker
# =============================================================================
Write-Step "Lancement du conteneur Metabase"

$existing = docker ps -a --filter "name=^${METABASE_CONTAINER}$" --format "{{.Names}}" 2>&1
if ($existing -eq $METABASE_CONTAINER) {
    $running = docker ps --filter "name=^${METABASE_CONTAINER}$" --format "{{.Names}}" 2>&1
    if ($running -eq $METABASE_CONTAINER) {
        Write-Warn "Le conteneur '$METABASE_CONTAINER' est déjà en cours d'exécution. On continue."
    } else {
        Write-Warn "Le conteneur existe mais est arrêté. Redémarrage..."
        docker start $METABASE_CONTAINER | Out-Null
    }
} else {
    Write-OK "Démarrage d'un nouveau conteneur Metabase..."
    docker run -d -p "${METABASE_PORT}:3000" --name $METABASE_CONTAINER metabase/metabase:latest | Out-Null
    Write-OK "Conteneur lancé."
}

# =============================================================================
# ÉTAPE 2 – Attente que Metabase soit prêt (polling /api/health)
# =============================================================================
Write-Step "Attente que Metabase soit opérationnel (peut prendre 1-3 min)..."

$maxWait   = 180   # secondes max
$elapsed   = 0
$ready     = $false

while ($elapsed -lt $maxWait) {
    try {
        $health = Invoke-RestMethod -Uri "$METABASE_URL/api/health" -Method Get -ErrorAction Stop
        if ($health.status -eq "ok") { $ready = $true; break }
    } catch { <# pas encore prêt #> }
    Start-Sleep -Seconds 5
    $elapsed += 5
    Write-Host "    ... $elapsed s" -ForegroundColor DarkGray
}

if (-not $ready) { Write-Fail "Metabase ne répond pas après $maxWait s. Vérifiez Docker." }
Write-OK "Metabase est opérationnel sur $METABASE_URL"

# =============================================================================
# ÉTAPE 3 – Configuration initiale (setup) via API
# =============================================================================
Write-Step "Configuration initiale de Metabase (compte admin + base de données)"

# Récupération du setup-token obligatoire pour /api/setup
$properties  = Invoke-RestMethod -Uri "$METABASE_URL/api/session/properties" -Method Get
$setupToken  = $properties.'setup-token'

$needsSetup  = $false
if ($setupToken) {
    $needsSetup = $true
    Write-OK "Setup token obtenu : $($setupToken.Substring(0,8))..."
} else {
    Write-Warn "Metabase est déjà configuré (pas de setup-token). On passe au login."
}

if ($needsSetup) {
    $setupBody = @{
        token = $setupToken
        prefs = @{
            site_name     = $ADMIN_SITE_NAME
            site_locale   = "fr"
            allow_tracking = $false
        }
        user  = @{
            first_name = $ADMIN_FIRSTNAME
            last_name  = $ADMIN_LASTNAME
            email      = $ADMIN_EMAIL
            password   = $ADMIN_PASSWORD
            site_name  = $ADMIN_SITE_NAME
        }
        database = $null   # pas de DB externe à ce stade (ajoutée manuellement après)
    } | ConvertTo-Json -Depth 5

    try {
        $setupResult = Invoke-RestMethod `
            -Uri     "$METABASE_URL/api/setup" `
            -Method  Post `
            -Body    $setupBody `
            -ContentType "application/json"
        Write-OK "Compte admin créé."
    } catch {
        Write-Warn "Setup API a retourné une erreur (le compte existe peut-être déjà) : $_"
    }
}

# =============================================================================
# ÉTAPE 4 – Authentification (obtention du session token)
# =============================================================================
Write-Step "Authentification sur Metabase"

$loginBody = @{
    username = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $session = Invoke-RestMethod `
        -Uri         "$METABASE_URL/api/session" `
        -Method      Post `
        -Body        $loginBody `
        -ContentType "application/json"
    $sessionToken = $session.id
    Write-OK "Connecté. Session : $($sessionToken.Substring(0,8))..."
} catch {
    Write-Fail "Impossible de se connecter à Metabase. Vérifiez les identifiants (email: $ADMIN_EMAIL)."
}

$headers = @{ "X-Metabase-Session" = $sessionToken }

# =============================================================================
# ÉTAPE 5 – Activation de l'Embedding
# =============================================================================
Write-Step "Activation de l'intégration (Embedding)"

try {
    Invoke-RestMethod `
        -Uri         "$METABASE_URL/api/setting/enable-embedding" `
        -Method      Put `
        -Headers     $headers `
        -Body        '{"value": true}' `
        -ContentType "application/json" | Out-Null
    Write-OK "Embedding activé."
} catch {
    Write-Warn "Impossible d'activer l'embedding via API (déjà activé ou droits insuffisants) : $_"
}

# =============================================================================
# ÉTAPE 6 – Récupération de la Secret Key d'Embedding
# =============================================================================
Write-Step "Récupération de la clé secrète d'embedding"

try {
    $secretSetting = Invoke-RestMethod `
        -Uri     "$METABASE_URL/api/setting/embedding-secret-key" `
        -Method  Get `
        -Headers $headers
    $secretKey = $secretSetting.value
    Write-OK "Clé secrète récupérée : $($secretKey.Substring(0,8))..."
} catch {
    Write-Fail "Impossible de récupérer la clé secrète d'embedding. Activez-la manuellement dans Admin > Embedding."
}

# =============================================================================
# ÉTAPE 7 – Création d'un tableau de bord exemple
# =============================================================================
Write-Step "Création du tableau de bord '$DASHBOARD_NAME'"

$dashBody = @{
    name        = $DASHBOARD_NAME
    description = "Tableau de bord global généré automatiquement par setup-metabase.ps1"
} | ConvertTo-Json

try {
    $dashboard   = Invoke-RestMethod `
        -Uri         "$METABASE_URL/api/dashboard" `
        -Method      Post `
        -Headers     $headers `
        -Body        $dashBody `
        -ContentType "application/json"
    $dashboardId = $dashboard.id
    Write-OK "Tableau de bord créé avec l'ID : $dashboardId"
} catch {
    Write-Warn "Impossible de créer le dashboard via API : $_"
    Write-Warn "Vous devrez créer le dashboard manuellement et noter son ID."
    $dashboardId = Read-Host "    Entrez manuellement l'ID de votre dashboard Metabase"
}

# Activation du partage (embedding) sur ce dashboard
try {
    Invoke-RestMethod `
        -Uri         "$METABASE_URL/api/dashboard/$dashboardId/public_link" `
        -Method      Post `
        -Headers     $headers | Out-Null
    Write-OK "Partage public activé sur le dashboard."
} catch {
    Write-Warn "Note : activation du partage public ignorée (API v0.50+ a changé cet endpoint)."
}

# =============================================================================
# ÉTAPE 8 – Mise à jour du fichier .env Laravel
# =============================================================================
Write-Step "Mise à jour de $ENV_FILE"

if (-not (Test-Path $ENV_FILE)) {
    Write-Fail "Le fichier .env Laravel est introuvable : $ENV_FILE"
}

function Set-EnvVar {
    param($file, $key, $value)
    $content = Get-Content $file -Raw
    if ($content -match "(?m)^$key=") {
        $content = $content -replace "(?m)^$key=.*", "$key=$value"
    } else {
        $content += "`r`n$key=$value"
    }
    Set-Content -Path $file -Value $content -NoNewline
}

Set-EnvVar $ENV_FILE "METABASE_SITE_URL"      $METABASE_URL
Set-EnvVar $ENV_FILE "METABASE_SECRET_KEY"    $secretKey
Set-EnvVar $ENV_FILE "METABASE_DASHBOARD_ID"  $dashboardId

Write-OK ".env mis à jour avec :"
Write-OK "  METABASE_SITE_URL     = $METABASE_URL"
Write-OK "  METABASE_SECRET_KEY   = $($secretKey.Substring(0,8))...(masquée)"
Write-OK "  METABASE_DASHBOARD_ID = $dashboardId"

# =============================================================================
# ÉTAPE 9 – Nettoyage du cache Laravel
# =============================================================================
Write-Step "Nettoyage du cache Laravel"

if (-not (Test-Path "$LARAVEL_DIR\artisan")) {
    Write-Warn "artisan non trouvé dans $LARAVEL_DIR — vérifiez le chemin LARAVEL_DIR en haut du script."
} else {
    Push-Location $LARAVEL_DIR
    php artisan config:clear
    php artisan cache:clear
    Pop-Location
    Write-OK "Cache Laravel vidé."
}

# =============================================================================
# ÉTAPE 10 – Lancement du backend et du frontend
# =============================================================================
Write-Step "Lancement du Backend Laravel (nouvelle fenêtre)"

if (Test-Path "$LARAVEL_DIR\artisan") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$LARAVEL_DIR'; php artisan serve"
    Write-OK "Backend démarré dans une nouvelle fenêtre PowerShell."
} else {
    Write-Warn "Backend non lancé automatiquement (artisan introuvable)."
}

Write-Step "Lancement du Frontend React (nouvelle fenêtre)"

if (Test-Path "$FRONTEND_DIR\package.json") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FRONTEND_DIR'; npm run dev"
    Write-OK "Frontend démarré dans une nouvelle fenêtre PowerShell."
} else {
    Write-Warn "Frontend non lancé automatiquement (package.json introuvable dans $FRONTEND_DIR)."
}

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  INSTALLATION TERMINEE AVEC SUCCES !" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Metabase     : $METABASE_URL" -ForegroundColor White
Write-Host "  Dashboard ID : $dashboardId" -ForegroundColor White
Write-Host "  Secret Key   : $($secretKey.Substring(0,16))... (dans .env)" -ForegroundColor White
Write-Host ""
Write-Host "  Prochaines etapes manuelles :" -ForegroundColor Yellow
Write-Host "  1. Allez sur $METABASE_URL et connectez Metabase a votre DB PostgreSQL" -ForegroundColor Yellow
Write-Host "     (Parametres > Admin > Bases de donnees > Ajouter)" -ForegroundColor Yellow
Write-Host "  2. Ajoutez des questions/graphiques a votre dashboard '$DASHBOARD_NAME'" -ForegroundColor Yellow
Write-Host "  3. Le tableau de bord s'affichera dans l'interface admin React." -ForegroundColor Yellow
Write-Host ""
