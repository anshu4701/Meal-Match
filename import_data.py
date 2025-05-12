import pandas as pd
from app import db, Restaurant, MenuItem, app

def clean_column_names(df):
    """Normalize column names by stripping spaces and converting to lowercase."""
    return df.rename(columns=lambda x: x.strip().lower().replace(' (inr)', '').replace(' ', '_'))

def import_data(file_path, platform):
    """Import restaurant and menu data from CSV file into the database."""
    print(f"Importing data from {file_path} for platform {platform}...")
    df = pd.read_csv(file_path)
    df = clean_column_names(df)  # Standardize column names
    print(f"Columns after cleaning: {df.columns.tolist()}")

    with app.app_context():
        for _, row in df.iterrows():
            if pd.isna(row['restaurant']) or pd.isna(row['food_item']) or pd.isna(row['price']):
                print(f"Skipping row due to missing data: {row.to_dict()}")
                continue  # Skip rows with missing data

            # Check if the restaurant already exists
            restaurant = Restaurant.query.filter_by(name=row['restaurant'], platform=platform).first()
            if not restaurant:
                restaurant = Restaurant(name=row['restaurant'], location="Unknown", platform=platform)
                db.session.add(restaurant)
                db.session.commit()
                print(f"Added restaurant: {restaurant.name} ({platform})")

            # Get the rating, default to None if missing or invalid
            rating = row.get('rating', None)
            if pd.isna(rating) or rating == '':
                rating = None
                print(f"No rating for {row['food_item']} at {row['restaurant']} ({platform})")
            else:
                try:
                    rating = float(rating)  # Ensure rating is a float
                    if rating < 0 or rating > 5:  # Validate rating (assuming 0-5 scale)
                        print(f"Invalid rating {rating} for {row['food_item']} at {row['restaurant']} ({platform}), setting to None")
                        rating = None
                except (ValueError, TypeError):
                    print(f"Invalid rating format {rating} for {row['food_item']} at {row['restaurant']} ({platform}), setting to None")
                    rating = None

            # Add menu item linked to the restaurant
            menu_item = MenuItem(
                restaurant_id=restaurant.id, 
                name=row['food_item'], 
                price=row['price'], 
                platform=platform,
                rating=rating  # Add the rating field
            )
            db.session.add(menu_item)
            print(f"Added menu item: {menu_item.name} at {restaurant.name} ({platform}) - Price: {menu_item.price}, Rating: {menu_item.rating}")

        # Commit changes after processing all rows
        db.session.commit()
        print(f"Finished importing data from {file_path}")

# Import Swiggy and Zomato data
import_data('swiggy_data.csv', 'Swiggy')
import_data('zomato_data.csv', 'Zomato')

print("✅ Data import complete!")
