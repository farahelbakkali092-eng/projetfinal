from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

app = Flask(__name__)

# Autoriser uniquement les appels depuis l'API Gateway Laravel
CORS(app, resources={r"/api/*": {"origins": os.getenv("LARAVEL_URL", "http://localhost:8000")}})

# ─────────────────────────────────────────────────────────────
# Dictionnaire de mots-clés : associe chaque type de peau et
# chaque problématique à des termes pertinents à rechercher
# dans le nom et la description des produits en base.
# ─────────────────────────────────────────────────────────────
KEYWORDS_MAP = {
    # Types de peau
    "Grasse":   ["sérum", "purifi", "matif", "sébum", "argile", "salicyli", "niacinamide", "pore", "légère", "gel"],
    "Sèche":    ["hydrat", "nourri", "beurre", "huile", "riche", "crème", "répar", "intense", "sèche", "doux"],
    "Mixte":    ["équili", "hydrat", "légère", "sérum", "gel", "toni", "purifi", "mixte"],
    "Normale":  ["hydrat", "éclat", "quotidien", "soin", "sérum", "nettoy", "doux"],
    # Problématiques
    "Acné & Imperfections": ["acné", "imperfect", "bouton", "salicyli", "niacinamide", "purifi", "zinc", "antibact"],
    "Rides & Âge":          ["ride", "anti-âge", "antiage", "rétinol", "retin", "collagène", "fermet", "lissant"],
    "Taches Pigmentaires":  ["tache", "éclair", "vitamine c", "niacinamide", "depigment", "unifiant", "teint"],
    "Déshydratation":       ["hydrat", "hyaluronique", "eau", "aqua", "repulp", "déshydrat", "sérum"],
    "Rougeurs":             ["rouge", "calman", "apaisant", "sensible", "aloe", "centella", "niacinamide"],
    "Pores Dilatés":        ["pore", "resserr", "argile", "salicyli", "niacinamide", "purifi", "toni"],
    # Préférences (bonus)
    "Bio / Naturel":        ["bio", "naturel", "organi", "botani", "plante"],
    "Vegan":                ["vegan", "végan", "cruelty"],
    "Made in France":       ["france", "français", "parisien"],
    "Sans Parfum":          ["sans parfum", "unscented", "fragrance free"],
    "Minimaliste":          ["essentiel", "soin", "quotidien", "simple", "minimals"],
}


def get_db_connection():
    """
    Établit et retourne une connexion PostgreSQL
    à partir des variables d'environnement.
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "cosmeticdb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


def build_image_url(image_path: str | None) -> str | None:
    """
    Construit l'URL publique d'une image stockée via Laravel Storage.
    Exemple : 'products/abc.jpg' → 'http://localhost:8000/storage/products/abc.jpg'
    """
    if not image_path:
        return None
    app_url = os.getenv("APP_URL", "http://localhost:8000").rstrip("/")
    return f"{app_url}/storage/{image_path}"


def score_product(product: dict, type_peau: str, problematiques: list, preferences: list) -> int:
    """
    Calcule un score de pertinence pour un produit donné.
    - +3 par mot-clé du type de peau trouvé dans nom ou description
    - +2 par mot-clé de problématique trouvé dans nom ou description
    - +1 par mot-clé de préférence trouvé dans nom ou description
    Retourne un entier >= 0. Plus le score est élevé, plus le produit est pertinent.
    """
    score = 0
    text = (
        (product.get("nom") or "").lower() + " " +
        (product.get("description") or "").lower()
    )

    # Mots-clés issus du type de peau
    for kw in KEYWORDS_MAP.get(type_peau, []):
        if kw.lower() in text:
            score += 3

    # Mots-clés issus des problématiques
    for probleme in problematiques:
        for kw in KEYWORDS_MAP.get(probleme, []):
            if kw.lower() in text:
                score += 2

    # Mots-clés issus des préférences (bonus léger)
    for pref in preferences:
        for kw in KEYWORDS_MAP.get(pref, []):
            if kw.lower() in text:
                score += 1

    return score


@app.route('/api/routine', methods=['POST'])
def recommend_routine():
    """
    Endpoint principal du microservice IA.
    Reçoit le profil client depuis Laravel, interroge PostgreSQL,
    calcule un score de pertinence, et retourne les meilleurs produits.

    Body JSON attendu :
    {
        "type_peau":      "Grasse",
        "budget":          200,
        "problematiques": ["Acné & Imperfections"],
        "preferences":    ["Bio / Naturel"]
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Format JSON invalide ou données manquantes."
            }), 400

        # ─── Extraction et normalisation des paramètres ───────────────
        type_peau      = str(data.get('type_peau', '')).strip()
        budget         = float(data.get('budget', 0))
        problematiques = data.get('problematiques', [])
        preferences    = data.get('preferences', [])

        if not type_peau or budget <= 0:
            return jsonify({
                "success": False,
                "message": "Le type de peau et le budget sont obligatoires."
            }), 400

        # ─── Connexion et requête PostgreSQL ──────────────────────────
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Récupérer tous les produits disponibles dans le budget.
        # La jointure LEFT JOIN récupère la première image principale.
        # Filtrage strict : uniquement les produits de la catégorie Skincare
        # Le JOIN sur categories avec slug='skincare' exclut makeup, haircare, fragrance, etc.
        cursor.execute("""
            SELECT
                p.id,
                p.name        AS nom,
                p.description,
                p.price       AS prix,
                p.stock,
                pi.image_path
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
                AND LOWER(c.slug) = 'skincare'
            LEFT JOIN LATERAL (
                SELECT image_path
                FROM product_images
                WHERE product_id = p.id
                ORDER BY is_main DESC, id ASC
                LIMIT 1
            ) pi ON TRUE
            WHERE p.stock > 0
              AND p.price <= %s
        """, (budget,))

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return jsonify({
                "success": False,
                "message": "Aucun produit skincare adapté à votre profil pour le moment."
            }), 200

        # ─── Construction des objets produit avec URL d'image ─────────
        products = []
        for row in rows:
            products.append({
                "id":          row["id"],
                "nom":         row["nom"],
                "description": row["description"],
                "prix":        float(row["prix"]),
                "image":       build_image_url(row["image_path"]),
            })

        # ─── Calcul du score de pertinence pour chaque produit ────────
        scored = sorted(
            products,
            key=lambda p: score_product(p, type_peau, problematiques, preferences),
            reverse=True  # Score le plus élevé en premier
        )

        # Retourner les 3 produits les plus pertinents
        # (jusqu'à 6 si les 3 premiers ont le même score nul)
        recommendations = []
        if scored:
            top_score = score_product(scored[0], type_peau, problematiques, preferences)
            if top_score == 0:
                # Pas de correspondance par mots-clés → retourner les 3 moins chers
                recommendations = sorted(products, key=lambda p: p["prix"])[:3]
            else:
                recommendations = scored[:3]

        if not recommendations:
            return jsonify({
                "success": False,
                "message": "Aucun produit skincare adapté à votre profil pour le moment."
            }), 200

        return jsonify({
            "success":         True,
            "message":         "Recommandations générées avec succès depuis la base de données.",
            "recommendations": recommendations,
            "count":           len(recommendations)
        }), 200

    except psycopg2.OperationalError as e:
        # Erreur de connexion à la base de données
        return jsonify({
            "success": False,
            "message": f"Impossible de se connecter à la base de données : {str(e)}"
        }), 503

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur interne du microservice IA : {str(e)}"
        }), 500


if __name__ == '__main__':
    # Le microservice Flask tourne sur le port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
