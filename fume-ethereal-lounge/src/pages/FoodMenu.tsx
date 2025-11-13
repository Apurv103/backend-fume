import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PublicTheme } from "@/components/ThemeSurface";

const FoodMenu = () => {
  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">
              Food Menu
            </h1>
            <div className="w-24 h-1 bg-gradient-gold mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Discover our exquisite culinary offerings crafted to elevate your senses
            </p>
          </div>

          <Tabs defaultValue="shareables" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 h-auto bg-card p-2 mb-8">
              <TabsTrigger value="shareables" className="text-xs md:text-sm py-2 md:py-3">Shareables</TabsTrigger>
              <TabsTrigger value="featured" className="text-xs md:text-sm py-2 md:py-3">Featured</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs md:text-sm py-2 md:py-3">Make Your Own</TabsTrigger>
              <TabsTrigger value="desserts" className="text-xs md:text-sm py-2 md:py-3">Shakes & Desserts</TabsTrigger>
              <TabsTrigger value="addons" className="text-xs md:text-sm py-2 md:py-3">Add Ons</TabsTrigger>
            </TabsList>

            <TabsContent value="shareables" className="animate-fade-in">
              <div className="grid gap-6">
                <MenuItem 
                  name="Calamari Satays"
                  price="$21"
                  description="Calamari on satay sticks served with lemon tahini & charred Asian chilli sauce"
                />
                <MenuItem 
                  name="Mac & Cheese Balls"
                  price="$17"
                  description="Four breaded mac & cheese rolled into a ball stuffed with cheese and flash fried to golden brown"
                  vegetarian
                />
                <MenuItem 
                  name="Nachos"
                  price="$22"
                  description="Crispy corn chips, green onions, Pico de Gallo, medley of beans, Monterey jack cheese and fresh jalapenos, served with a side of sour cream, homemade salsa & cheese sauce"
                  note="Add: Chicken / Spiced Beef / Pepper Shrimp for $6"
                  vegetarian
                />
                <MenuItem 
                  name="Thai Chicken Satays"
                  price="$17"
                  description="Thai marinated chicken wrapped around sugarcane stick, served with Thai Mayo & Sweet chilli"
                />
                <MenuItem 
                  name="Wings"
                  price="$20"
                  description="1 lb of marinated & slow roasted & flash fried wings tossed in choice of Fume's signature sauce"
                  note="Choose: Ancho Chilli Wild Honey / Tandoori Dry-Rub / Spicy Lemon Thyme Pepper Pot"
                />
              </div>
            </TabsContent>

            <TabsContent value="featured" className="animate-fade-in">
              <div className="grid gap-6">
                <MenuItem 
                  name="24K Wings"
                  price="$42"
                  description="Hennessy wings finished with a homemade barbecue sauce and sprinkled with real and edible gold flakes!"
                  featured
                />
                <MenuItem 
                  name="Poutine"
                  price="$14"
                  description="Fries, homemade vegetarian gravy, cheese curds"
                  note="Add: Chicken / Spiced Beef / Pepper Shrimp for $6"
                  vegetarian
                />
                <MenuItem 
                  name="Caribbean Pepper Shrimp"
                  price="$21"
                  description="Shrimp cocktail snack seasoned with Caribbean pepper and served with grilled pineapple"
                />
                <MenuItem 
                  name="Smash Burger"
                  price="$20"
                  description="Beef patty stuffed in brioche buns, topped with fried onions & roast garlic mayo, Tapatio spicy ketchup on the side"
                  note="Add: Fries for $4"
                />
                <MenuItem 
                  name="Bruschetta Flatbread"
                  price="$19"
                  description="Charcoal pizza crust, marinated tomatoes, red onions, garlic, basil tossed with virgin olive oil and sprinkled with Bocconcini cheese"
                />
                <MenuItem 
                  name="Southern Fried Chicken Sandwich"
                  price="$18"
                  description="Southern spiced fried chicken sandwich, served with sweet & creamy coleslaw, pickles sandwiched in brioche buns"
                  note="Add: Fries for $4"
                />
                <MenuItem 
                  name="The Jerk Platter"
                  price="$24"
                  description="Jamaican jerk chicken platter with rice and peas with creamy coleslaw"
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="animate-fade-in">
              <div className="grid gap-6">
                <MenuItem 
                  name="Tacos"
                  price="$17"
                  description="Two 6&quot; soft corn taco shells with fried onions and shredded lettuce, finished with Pico de Gallo and cilantro with your choice of meat or veggies. Make it spicy? Inform your server."
                  note="Choose: Chicken / Beef / Roasted Veggies • Substitute: Shrimp for $3"
                />
                <MenuItem 
                  name="Flatbread"
                  price="$14"
                  description="12&quot; charcoal-infused flatbread with homemade pizza sauce & fresh mozzarella"
                  note="Add for $2: Mushrooms / Tomatoes, Basil Oil / Red Onions • Add for $3: Mix Cheese / Bocconcini / Pepperoni / Roasted Veggies • Add for $6: Chicken / Ground Beef / Shrimps"
                />
                <MenuItem 
                  name="Pasta"
                  price="$19"
                  description="Penne tossed in seasonal veggies. Make it spicy? Inform your server."
                  note="Choose Sauce: Tomato / Cream Sauce / Olive Oil • Add: Chicken / Beef / Shrimp for $6"
                />
                <MenuItem 
                  name="Wraps"
                  price="$17"
                  description="Lettuce, tomato, fried onions, chipotle mayo, mix-cheese in your choice of meat or veggies. Make it spicy? Inform your server."
                  note="Choose: Chicken / Beef / Roasted Veggies • Substitute: Shrimp for $3"
                />
              </div>
            </TabsContent>

            <TabsContent value="desserts" className="animate-fade-in">
              <div className="grid gap-6">
                <MenuItem 
                  name="Sticky Toffee Pudding"
                  price="$15"
                  description="Moist sponge cake made with finely chopped dates, covered in toffee sauce"
                />
                <MenuItem 
                  name="Vanilla Shake"
                  price="$14"
                  description="Classic vanilla shake"
                  note="Spike with: Jaegermeister for $8"
                />
                <MenuItem 
                  name="Espresso Shake"
                  price="$14"
                  description="Rich espresso shake"
                  note="Spike with: Kahlua / Baileys for $8"
                />
                <MenuItem 
                  name="Amarena Cherry Shake"
                  price="$14"
                  description="Sweet cherry shake"
                  note="Spike with: Tequila Rosé for $8"
                />
              </div>
            </TabsContent>

            <TabsContent value="addons" className="animate-fade-in">
              <Card className="bg-card/50 border-border p-6 md:p-8">
                <p className="text-muted-foreground mb-6 text-sm">
                  (Pair Add Ons with dishes. Not sold separately)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AddOnItem name="Rice & Beans" price="$9" />
                  <AddOnItem name="Fries" price="$9" />
                  <AddOnItem name="Onion Rings" price="$9" />
                  <AddOnItem name="Hot Sauce" price="$3" />
                  <AddOnItem name="Salsa" price="$3" />
                  <AddOnItem name="Coleslaw" price="$3" />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-muted/30 border-border p-6 md:p-8 mt-12">
            <p className="text-xs md:text-sm text-muted-foreground space-y-2">
              <span className="block">• Dishes may contain allergens. If you have any dietary requirements, please speak to a member of staff. Vegetarian and vegan options are available.</span>
              <span className="block">• During peak service hours, guest cheques can only be split a maximum of 4 ways.</span>
              <span className="block">• We levy 18% Auto-Gratuity on party size of five or more.</span>
              <span className="block">• Taxes extra.</span>
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </PublicTheme>
  );
};

const MenuItem = ({ 
  name, 
  price, 
  description, 
  note, 
  vegetarian, 
  featured 
}: { 
  name: string; 
  price: string; 
  description: string; 
  note?: string; 
  vegetarian?: boolean;
  featured?: boolean;
}) => (
  <Card className={`bg-card/50 border-border p-4 md:p-6 hover:shadow-glow transition-all ${featured ? 'border-primary' : ''}`}>
    <div className="flex justify-between items-start gap-4 mb-3">
      <div className="flex items-center gap-2">
        <h3 className="font-playfair text-lg md:text-xl font-semibold">
          {name}
        </h3>
        {vegetarian && <span className="text-green-500">☘︎</span>}
        {featured && <span className="text-xs bg-gradient-gold text-primary-foreground px-2 py-1 rounded">SIGNATURE</span>}
      </div>
      <span className="font-bold text-primary text-lg md:text-xl whitespace-nowrap">{price}</span>
    </div>
    <p className="text-muted-foreground text-sm md:text-base mb-2">{description}</p>
    {note && (
      <p className="text-xs md:text-sm text-muted-foreground/80 italic mt-2 pt-2 border-t border-border/50">
        {note}
      </p>
    )}
  </Card>
);

const AddOnItem = ({ name, price }: { name: string; price: string }) => (
  <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
    <span className="text-sm md:text-base">{name}</span>
    <span className="font-semibold text-primary">{price}</span>
  </div>
);

export default FoodMenu;
