# 📊 Guide d'Installation de Metabase pour l'Équipe

> Chaque développeur installe Metabase **localement** sur son propre PC.  
> L'instance Metabase est indépendante du projet Git.

---

## Étape 1 — Mettre à jour le projet

```bash
git pull
```

Puis, dans le dossier `BACKENDECOMERCE`, installez les dépendances PHP :

```bash
cd BACKENDECOMERCE
composer install
```

---

## Étape 2 — Installer Metabase via Docker

> **Prérequis :** [Docker Desktop](https://www.docker.com/products/docker-desktop/) doit être installé.

Ouvrez PowerShell ou CMD et lancez :

```bash
docker run -d -p 3000:3000 --name metabase metabase/metabase:latest
```

Attendez quelques minutes, puis ouvrez : **http://localhost:3000**

---

## Étape 3 — Configurer votre Metabase local

1. Allez sur **http://localhost:3000** et créez votre compte admin local.
2. Connectez Metabase à votre base de données **PostgreSQL** (la même que Laravel, ex: `cosmetic_db`).

---

## Étape 4 — Recréer le Tableau de Bord

Comme chaque Metabase est local, vous devez recréer le dashboard :

1. Créez quelques **Questions / Graphiques** (ex : *Ventes par mois*, *Nombre de commandes*).
2. Ajoutez-les à un **Nouveau Tableau de Bord** nommé : **`DAWSM GLOBAL INSIGHTS`**
3. Notez l'**ID du dashboard** depuis l'URL :  
   `http://localhost:3000/dashboard/`**`1`**`-nom` → l'ID est `1`

---

## Étape 5 — Activer l'Embedding et récupérer la Secret Key

1. Cliquez sur ⚙️ **Paramètres** (en haut à droite) → **Admin Settings** → **Embedding**
2. Copiez la **Secret Key** (chaîne de 64 caractères).
3. Revenez sur votre dashboard → icône de partage ↗️ → **"Embed this dashboard in an application"** → **"Publish"**

---

## Étape 6 — Configurer le fichier `.env` de Laravel

Dans `BACKENDECOMERCE/.env`, ajoutez / mettez à jour ces variables :

```env
METABASE_SITE_URL=http://localhost:3000
METABASE_SECRET_KEY=collez_ici_la_cle_secrete_que_vous_venez_de_copier
METABASE_DASHBOARD_ID=1
```

> ⚠️ Remplacez `1` par l'ID réel de votre dashboard.

---

## Étape 7 — Lancer l'application

**Backend :**
```bash
php artisan config:clear
php artisan serve
```

**Frontend :**
```bash
npm run dev
```

---

## ✅ Résultat

Le menu **Tableau de bord** dans l'interface admin React affichera le Metabase de **votre PC**.

---

> 💡 **Remarque :** Le fichier `.env` est dans `.gitignore`. Ne committez jamais vos clés secrètes.
