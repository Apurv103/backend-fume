export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  flavors?: string[];
}

// Food
export const foodMenu: MenuItem[] = [
  // Shareables
  { id: "food-share-calamari-satays", name: "Calamari Satays", price: 21, category: "Shareables", description: "Calamari on satay sticks served with lemon tahini & charred Asian chilli sauce" },
  { id: "food-share-mac-cheese-balls", name: "Mac & Cheese Balls", price: 17, category: "Shareables", description: "Four breaded mac & cheese rolled into a ball stuffed with cheese and flash fried to golden brown" },
  { id: "food-share-nachos", name: "Nachos", price: 22, category: "Shareables", description: "Crispy corn chips, beans, pico, jalapenos, cheese. Sides: sour cream, salsa & cheese sauce" },
  { id: "food-share-thai-chicken-satays", name: "Thai Chicken Satays", price: 17, category: "Shareables", description: "Thai marinated chicken wrapped around sugarcane stick, served with Thai mayo & sweet chilli" },
  { id: "food-share-wings", name: "Wings (1 lb)", price: 20, category: "Shareables", description: "Marinated & slow roasted, flash fried, tossed in Fume's signature sauce" },

  // Featured
  { id: "food-feat-24k-wings", name: "24K Wings", price: 42, category: "Featured", description: "Hennessy wings finished with BBQ sauce and sprinkled with edible gold flakes" },
  { id: "food-feat-poutine", name: "Poutine", price: 14, category: "Featured", description: "Fries, vegetarian gravy, cheese curds" },
  { id: "food-feat-pepper-shrimp", name: "Caribbean Pepper Shrimp", price: 21, category: "Featured", description: "Shrimp cocktail snack seasoned with Caribbean pepper, grilled pineapple" },
  { id: "food-feat-smash-burger", name: "Smash Burger", price: 20, category: "Featured", description: "Beef patty on brioche, fried onions & roast garlic mayo" },
  { id: "food-feat-bruschetta-flatbread", name: "Bruschetta Flatbread", price: 19, category: "Featured", description: "Charcoal pizza crust with marinated tomatoes, basil, bocconcini" },
  { id: "food-feat-fried-chicken-sandwich", name: "Southern Fried Chicken Sandwich", price: 18, category: "Featured", description: "Spiced fried chicken, coleslaw, pickles, brioche buns" },
  { id: "food-feat-jerk-platter", name: "The Jerk Platter", price: 24, category: "Featured", description: "Jamaican jerk chicken with rice & peas and creamy coleslaw" },

  // Make Your Own
  { id: "food-custom-tacos", name: "Tacos (2)", price: 17, category: "Make Your Own", description: "Soft corn tacos with fried onions, shredded lettuce, pico & cilantro" },
  { id: "food-custom-flatbread", name: "Flatbread 12\"", price: 14, category: "Make Your Own", description: "Charcoal-infused flatbread with pizza sauce & fresh mozzarella" },
  { id: "food-custom-pasta", name: "Pasta", price: 19, category: "Make Your Own", description: "Penne tossed in seasonal veggies. Choose your sauce." },
  { id: "food-custom-wraps", name: "Wraps", price: 17, category: "Make Your Own", description: "Lettuce, tomato, fried onions, chipotle mayo, mix-cheese; choose meat/veggies" },

  // Desserts
  { id: "food-dessert-sticky-toffee", name: "Sticky Toffee Pudding", price: 15, category: "Desserts", description: "Moist sponge cake with finely chopped dates, covered in toffee sauce" },
  { id: "food-dessert-vanilla-shake", name: "Vanilla Shake", price: 14, category: "Desserts", description: "Classic vanilla shake" },
  { id: "food-dessert-espresso-shake", name: "Espresso Shake", price: 14, category: "Desserts", description: "Rich espresso shake" },
  { id: "food-dessert-amarena-shake", name: "Amarena Cherry Shake", price: 14, category: "Desserts", description: "Sweet cherry shake" },

  // Add Ons
  { id: "food-addon-rice-beans", name: "Rice & Beans", price: 9, category: "Add Ons" },
  { id: "food-addon-fries", name: "Fries", price: 9, category: "Add Ons" },
  { id: "food-addon-onion-rings", name: "Onion Rings", price: 9, category: "Add Ons" },
  { id: "food-addon-hot-sauce", name: "Hot Sauce", price: 3, category: "Add Ons" },
  { id: "food-addon-salsa", name: "Salsa", price: 3, category: "Add Ons" },
  { id: "food-addon-coleslaw", name: "Coleslaw", price: 3, category: "Add Ons" },
];

// Drinks
export const drinksMenu: MenuItem[] = [
  // Signature Cocktails
  { id: "drink-sig-bloody-sky", name: "Bloody Sky", price: 17, category: "Signature", description: "Absolut Vodka, Aperitivo, Blood Orange, Passion Fruit, Blood Peach" },
  { id: "drink-sig-mean-old-fashioned", name: "Mean Old Fashioned", price: 18, category: "Signature", description: "Masala & Ancho Spice Wiser's Whisky, Passion Fruit, Cacao Bitters" },
  { id: "drink-sig-tropical-mojito", name: "Tropical Mojito", price: 17, category: "Signature", description: "Captain Morgan White Rum, Mango Syrup, Pineapple Juice, Mint" },
  { id: "drink-sig-between-the-sheets", name: "Between The Sheets With Hennessy", price: 21, category: "Signature", description: "Hennessy, Galliano, Passion Fruit, Pineapple, Lemon, Chocolate Bitters" },
  { id: "drink-sig-pink-cloud", name: "The Pink Cloud", price: 17, category: "Signature", description: "Baileys, Mango Rum, Grenadine, Pineapple" },
  { id: "drink-sig-blue-lagoon", name: "Blue Lagoon", price: 17, category: "Signature", description: "Tequila, Lime, Pineapple, Blue Curacao, Sprite/Soda" },

  // Classic Cocktails
  { id: "drink-classic-mojito", name: "Mojito", price: 16, category: "Classic", description: "Vodka, Club Soda, Lime, Mint" },
  { id: "drink-classic-lychee-martini", name: "Lychee Martini", price: 17, category: "Classic", description: "Vodka, Elderflower, Lime, Lychee" },
  { id: "drink-classic-espresso-martini", name: "Espresso Martini", price: 17, category: "Classic", description: "Vodka, Kahlua, Espresso, Simple Syrup" },
  { id: "drink-classic-old-fashioned", name: "Old Fashioned", price: 17, category: "Classic", description: "Bourbon, Bitters, Simple Syrup" },
  { id: "drink-classic-margarita", name: "Margarita", price: 17, category: "Classic", description: "Tequila, Cointreau, Simple Syrup, Lime" },
  { id: "drink-classic-cosmopolitan", name: "Cosmopolitan", price: 17, category: "Classic", description: "Vodka, Cointreau, Lime, Cranberry" },
  { id: "drink-classic-negroni", name: "Negroni", price: 16, category: "Classic", description: "Gin, Vermouth, Campari" },
  { id: "drink-classic-martini", name: "Martini", price: 16, category: "Classic", description: "Beefeater or Absolut, Dry Vermouth, Olive" },

  // Beer
  { id: "beer-molson", name: "Molson Canadian", price: 11, category: "Beer" },
  { id: "beer-coors", name: "Coors Light", price: 11, category: "Beer" },
  { id: "beer-heineken", name: "Heineken", price: 11, category: "Beer" },
  { id: "beer-stella", name: "Stella Artois", price: 11, category: "Beer" },
  { id: "beer-modelo", name: "Modelo Especial", price: 11, category: "Beer" },
  { id: "beer-bud", name: "Budweiser", price: 11, category: "Beer" },
  { id: "beer-corona", name: "Corona", price: 11, category: "Beer" },

  // Wine (prices normalized to glass price)
  { id: "wine-pinot-grigio", name: "Seasons Pinot Grigio (White)", price: 13.99, category: "Wine" },
  { id: "wine-sauv-blanc", name: "Brancott Estate Sauvignon Blanc", price: 13.99, category: "Wine" },
  { id: "wine-chardonnay", name: "Toasted Head Chardonnay", price: 13.99, category: "Wine" },
  { id: "wine-rosso", name: "Commisso Rosso (Red)", price: 13.99, category: "Wine" },
  { id: "wine-cab-sauv", name: "Robert Mondavi Cabernet Sauvignon", price: 13.99, category: "Wine" },
  { id: "wine-prosecco", name: "Prosecco DOC Ruffino", price: 13.99, category: "Wine" },

  // Mocktails
  { id: "mock-virgin-bloody-sky", name: "Virgin Bloody Sky", price: 13, category: "Mocktails", description: "Blood Orange, Passion Fruit, Blood Peach, Soda" },
  { id: "mock-virgin-blue-lagoon", name: "Virgin Blue Lagoon", price: 13, category: "Mocktails", description: "Bergamot, Blue Orange Blossoms, Sprite" },
  { id: "mock-virgin-mojito", name: "Virgin Mojito", price: 13, category: "Mocktails", description: "Club Soda, Lime, Mint" },
  { id: "mock-virgin-tropical-mojito", name: "Virgin Tropical Mojito", price: 13, category: "Mocktails", description: "Mango Syrup, Pineapple Juice, Mint" },
];

// Shisha
const signatureFlavors = [
  "Ladykiller",
  "Fruit O' Mania",
  "Blue-Kiwi Bliss",
  "Hawaiian Punch",
  "Midnight Melon",
  "Passion Fruit & Chill",
  "The Commissioner",
  "The Empress",
];

const classicFlavors = [
  "Grape Mint",
  "Gum Mint",
  "Ice Watermelon Peach",
  "Lemon Lime Mint",
  "Blueberry Mint",
  "Double Apple",
  "Mango",
  "Orange Mint",
];

export const shishaMenu: MenuItem[] = [
  { id: "shisha-signature", name: "Signature Shisha", price: 42.99, category: "Shisha", flavors: signatureFlavors, description: "Premium exotic signatures" },
  { id: "shisha-classic", name: "Classic Shisha", price: 37.99, category: "Shisha", flavors: classicFlavors, description: "Timeless classics" },
];


