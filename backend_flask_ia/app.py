from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
# Activation des CORS restreinte à l'API Gateway Laravel
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8000"}})

# Mock data pour simuler les produits recommandés par l'IA
MOCK_PRODUCTS = [
    {
        "id": 101,
        "nom": "Sérum Anti-Imperfections Niacinamide 10%",
        "prix": 25.50,
        "description": "Un sérum puissant qui régule le sébum et réduit visiblement les pores et les imperfections.",
        "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": 102,
        "nom": "Crème Hydratante Légère Acide Hyaluronique",
        "prix": 18.90,
        "description": "Hydratation intense sans fini gras. Parfaite pour repulper la peau au quotidien.",
        "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": 103,
        "nom": "Gel Nettoyant Purifiant à l'Acide Salicylique",
        "prix": 14.50,
        "description": "Nettoie en profondeur, désobstrue les pores et élimine l'excès de sébum tout en douceur.",
        "image": "https://images.unsplash.com/photo-1556228720-192b60618f7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": 104,
        "nom": "Masque Détoxifiant à l'Argile Rose",
        "prix": 22.00,
        "description": "Purifie et affine le grain de peau pour un teint éclatant et sans brillance.",
        "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": 105,
        "nom": "Huile Visage Régénérante Nuit",
        "prix": 34.00,
        "description": "Un concentré botanique qui nourrit et répare la barrière cutanée pendant le sommeil.",
        "image": "https://images.unsplash.com/photo-1601049541289-9b1b7ce83bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
]

@app.route('/api/routine', methods=['POST']) 
def recommend_routine():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Format JSON invalide ou données manquantes."
            }), 400
            
        # Extraction des données envoyées par Laravel
        type_peau = data.get('type_peau', '')
        budget = float(data.get('budget', 0))
        problematiques = data.get('problematiques', [])
        preferences = data.get('preferences', [])
        
        # En situation réelle, on chargerait le modèle ML ainsi :
        # import joblib
        # model = joblib.load('modeles_ia/recommender.joblib')
        # recommendations = model.predict([type_peau, budget, problematiques, preferences])
        
        # Pour le MOCK: on retourne exactement 3 produits filtrés aléatoirement
        selected_products = random.sample(MOCK_PRODUCTS, 3)
        
        return jsonify({
            "success": True,
            "message": "Recommandations générées avec succès par l'IA.",
            "recommendations": selected_products,
            "count": len(selected_products)
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur interne du microservice IA : {str(e)}"
        }), 500

if __name__ == '__main__':
    # Le microservice Flask tourne sur le port 5001 pour ne pas interférer avec Laravel (8000)
    app.run(host='0.0.0.0', port=5001, debug=True)
