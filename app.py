from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate  # Import Flask-Migrate
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///food_comparison.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Define Database Models
class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    platform = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f"<Restaurant {self.name} ({self.platform})>"

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    rating = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f"<MenuItem {self.name} ({self.platform}) - Price: {self.price}, Rating: {self.rating}>"

# Create database tables (only needed for initial creation)
with app.app_context():
    db.create_all()

# API Route to Compare Prices for a Specific Food Item
@app.route('/compare_prices', methods=['GET'])
def compare_prices():
    item_name = request.args.get('item_name')
    if not item_name:
        return jsonify({"error": "Please provide an item_name parameter"}), 400

    items = MenuItem.query.filter(MenuItem.name.ilike(f"%{item_name}%")).all()

    if not items:
        return jsonify({"message": "No matching items found"}), 404

    results = {}
    for item in items:
        key = f"{item.name} ({item.platform})"
        if key not in results or results[key]['price'] > item.price:
            results[key] = {
                'restaurant': Restaurant.query.get(item.restaurant_id).name,
                'price': item.price,
                'platform': item.platform,
                'rating': item.rating
            }

    return jsonify(results)

# API Route to Get All Food Prices
@app.route('/compare_all_prices', methods=['GET'])
def compare_all_prices():
    items = MenuItem.query.all()
    
    if not items:
        return jsonify({"message": "No data found"}), 404

    results = {}
    for item in items:
        key = item.name
        if key not in results:
            results[key] = []
        
        results[key].append({
            "restaurant": Restaurant.query.get(item.restaurant_id).name,
            "price": item.price,
            "platform": item.platform,
            "rating": item.rating
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)