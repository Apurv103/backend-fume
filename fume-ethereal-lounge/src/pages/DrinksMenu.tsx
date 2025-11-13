import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wine, Sparkles, Beer, GlassWater } from "lucide-react";
import { PublicTheme } from "@/components/ThemeSurface";

const DrinksMenu = () => {
  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              Drinks Menu
            </h1>
            <p className="text-lg text-muted-foreground">
              Elevated mixology and premium selections
            </p>
          </div>

          <Tabs defaultValue="bottles" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto bg-card p-2 mb-8">
              <TabsTrigger value="bottles" className="text-xs md:text-sm py-2 md:py-3">Bottle Service</TabsTrigger>
              <TabsTrigger value="signature" className="text-xs md:text-sm py-2 md:py-3">Signature</TabsTrigger>
              <TabsTrigger value="classic" className="text-xs md:text-sm py-2 md:py-3">Classic</TabsTrigger>
              <TabsTrigger value="beer" className="text-xs md:text-sm py-2 md:py-3">Beer & Wine</TabsTrigger>
              <TabsTrigger value="mocktails" className="text-xs md:text-sm py-2 md:py-3">Mocktails</TabsTrigger>
            </TabsList>

            <TabsContent value="bottles">
              <div className="grid md:grid-cols-2 gap-6">
                <MenuSection 
                  title="Whiskey" 
                  icon={<Wine className="w-6 h-6" />}
                  items={[
                    { name: "Johnnie Walker Blue Label", price: "$750" },
                    { name: "The Dalmore 15 Year", price: "$550" },
                    { name: "The Macallan 12 Year", price: "$380" },
                    { name: "Glenmorangie", price: "$300" },
                    { name: "Glenfiddich 12 Year", price: "$300" },
                    { name: "Glenlivet Founder's Reserve", price: "$280" },
                    { name: "Suntory Toki", price: "$290" },
                    { name: "Chivas Regal 12 Year", price: "$280" },
                    { name: "Johnnie Walker Black Label", price: "$280" },
                    { name: "Jameson", price: "$250" },
                    { name: "Crown Royal", price: "$240" },
                  ]}
                />

                <MenuSection 
                  title="Vodka" 
                  icon={<Wine className="w-6 h-6" />}
                  items={[
                    { name: "Crystal Head", price: "$260" },
                    { name: "Grey Goose", price: "$280" },
                    { name: "Ciroc (Multiple Flavors)", price: "$260" },
                    { name: "Belvedere", price: "$260" },
                    { name: "Kástra Elión", price: "$300" },
                  ]}
                />

                <MenuSection 
                  title="Cognac" 
                  icon={<Wine className="w-6 h-6" />}
                  items={[
                    { name: "Hennessy XO", price: "$750" },
                    { name: "D'Ussé VSOP", price: "$380" },
                    { name: "Courvoisier VSOP", price: "$380" },
                    { name: "Hennessy VS", price: "$290" },
                  ]}
                />

                <MenuSection 
                  title="Tequila" 
                  icon={<Wine className="w-6 h-6" />}
                  items={[
                    { name: "Don Julio 1942 Añejo", price: "$750" },
                    { name: "Clase Azul Reposado", price: "$750" },
                    { name: "Don Julio Añejo", price: "$340" },
                    { name: "Don Julio Blanco", price: "$340" },
                    { name: "Casamigos (Silver/Reposado)", price: "$310" },
                    { name: "Patron Silver", price: "$300" },
                    { name: "818 (Silver/Reposado)", price: "$315" },
                    { name: "1800 (Silver/Reposado)", price: "$240" },
                  ]}
                />

                <MenuSection 
                  title="Champagne" 
                  icon={<Sparkles className="w-6 h-6" />}
                  items={[
                    { name: "Armand de Brignac Ace of Spades Brut Gold", price: "$900" },
                    { name: "Dom Pérignon Brut Vintage", price: "$750" },
                    { name: "Veuve Clicquot Brut", price: "$260" },
                    { name: "Moët & Chandon Brut", price: "$260" },
                  ]}
                />

                <Card className="bg-muted/30 border-border p-6">
                  <h4 className="font-semibold mb-3">Bottle Service Includes:</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose two complimentary pitchers:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coca Cola • Diet Coke • Sprite • Ginger Ale • Orange Juice • Cranberry Juice • Pineapple Juice
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="signature">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CocktailCard 
                  name="Bloody Sky"
                  price="$17"
                  description="Absolut Vodka, Aperitivo, Blood Orange, Passion Fruit, Blood Peach"
                />
                <CocktailCard 
                  name="Mean Old Fashioned"
                  price="$18"
                  description="Masala & Ancho Spice Wiser's Whisky, Passion Fruit, Cacao Bitters"
                />
                <CocktailCard 
                  name="Tropical Mojito"
                  price="$17"
                  description="Captain Morgan White Rum, Mango Syrup, Pineapple Juice, Mint"
                />
                <CocktailCard 
                  name="Between The Sheets With Hennessy"
                  price="$21"
                  description="Hennessy, Green Pepper Infused Galliano, Passion Fruit, Pineapple, Lemon Juice & Chocolate Bitters"
                />
                <CocktailCard 
                  name="The Pink Cloud"
                  price="$17"
                  description="Baileys, Mango Rum, Grenadine, Pineapple"
                />
                <CocktailCard 
                  name="Blue Lagoon"
                  price="$17"
                  description="Tequila, Lime Juice, Pineapple Juice, Blue Curacao, Sprite or Soda"
                />
              </div>
            </TabsContent>

            <TabsContent value="classic">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CocktailCard 
                  name="Mojito"
                  price="$16"
                  description="Vodka, Club Soda, Lime, Mint"
                />
                <CocktailCard 
                  name="Lychee Martini"
                  price="$17"
                  description="Vodka, Elderflower Liqueur, Lime Juice, Lychee Juice"
                />
                <CocktailCard 
                  name="Espresso Martini"
                  price="$17"
                  description="Vodka, Kahlua, Espresso, Simple Syrup"
                />
                <CocktailCard 
                  name="Old Fashioned"
                  price="$17"
                  description="Bourbon Whiskey, Angostura Bitters, Orange Bitters, Simple Syrup"
                />
                <CocktailCard 
                  name="Margarita"
                  price="$17"
                  description="Tequila, Cointreau, Simple Syrup, Lime Juice"
                  note="Available in: Passion Fruit, Mango, Strawberry"
                />
                <CocktailCard 
                  name="Cosmopolitan"
                  price="$17"
                  description="Vodka, Cointreau, Lime Juice, Cranberry Juice"
                />
                <CocktailCard 
                  name="Negroni"
                  price="$16"
                  description="Gin, Vermouth, Campari"
                />
                <CocktailCard 
                  name="Martini"
                  price="$16"
                  description="Beefeater Gin or Absolut Vodka, Dry Vermouth, Olive"
                />
              </div>
            </TabsContent>

            <TabsContent value="beer">
              <div className="grid md:grid-cols-2 gap-6">
                <MenuSection 
                  title="Bottles" 
                  icon={<Beer className="w-6 h-6" />}
                  items={[
                    { name: "Molson Canadian", price: "$11" },
                    { name: "Coors Light", price: "$11" },
                    { name: "Heineken", price: "$11" },
                    { name: "Stella Artois", price: "$11" },
                    { name: "Modelo Especial", price: "$11" },
                    { name: "Budweiser", price: "$11" },
                    { name: "Corona", price: "$11" },
                  ]}
                />

                <MenuSection 
                  title="Wine Selection" 
                  icon={<Wine className="w-6 h-6" />}
                  items={[
                    { name: "Seasons Pinot Grigio (White)", price: "$13.99 / $80" },
                    { name: "Brancott Estate Sauvignon Blanc", price: "$13.99 / $80" },
                    { name: "Toasted Head Chardonnay", price: "$13.99 / $80" },
                    { name: "Commisso Rosso (Red)", price: "$13.99 / $80" },
                    { name: "Robert Mondavi Cabernet Sauvignon", price: "$13.99 / $80" },
                    { name: "Prosecco DOC Ruffino", price: "$13.99 / $80" },
                  ]}
                />
              </div>
            </TabsContent>

            <TabsContent value="mocktails">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CocktailCard 
                  name="Virgin Bloody Sky"
                  price="$13"
                  description="Blood Orange, Passion Fruit, Blood Peach, Soda"
                />
                <CocktailCard 
                  name="Virgin Blue Lagoon"
                  price="$13"
                  description="Bergamot, Blue Orange Blossoms, Sprite"
                />
                <CocktailCard 
                  name="Virgin Mojito"
                  price="$13"
                  description="Club Soda, Lime, Mint"
                />
                <CocktailCard 
                  name="Virgin Tropical Mojito"
                  price="$13"
                  description="Mango Syrup, Pineapple Juice, Mint"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Card className="bg-card border-border p-6 mt-8">
            <h3 className="font-semibold text-center mb-4">Important Information</h3>
            <div className="text-sm text-muted-foreground space-y-2 max-w-2xl mx-auto">
              <p>• During peak service hours, guest cheques can only be split a maximum of 4 ways</p>
              <p>• We levy 18% Auto-Gratuity on party size of five or more</p>
              <p>• All bottles are subjected to 18% gratuity</p>
              <p>• Taxes extra</p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </PublicTheme>
  );
};

const MenuSection = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: { name: string; price: string }[] }) => (
  <Card className="bg-card border-border p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h3 className="font-playfair text-2xl font-bold">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-start gap-4">
          <span className="text-sm text-foreground/80">{item.name}</span>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">{item.price}</span>
        </div>
      ))}
    </div>
  </Card>
);

const CocktailCard = ({ name, price, description, note }: { name: string; price: string; description: string; note?: string }) => (
  <Card className="bg-card border-border p-6 hover:shadow-glow transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-lg">{name}</h3>
      <span className="text-primary font-semibold">{price}</span>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
    {note && <p className="text-xs text-accent mt-2 italic">{note}</p>}
  </Card>
);

export default DrinksMenu;
