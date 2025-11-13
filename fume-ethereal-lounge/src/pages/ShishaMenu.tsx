import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Flame, Sparkles, Crown } from "lucide-react";
import { PublicTheme } from "@/components/ThemeSurface";

const ShishaMenu = () => {
  const signatureFlavors = [
    { name: "Ladykiller", description: "Sweet melon, juicy mango, forest berries & mint" },
    { name: "Fruit O' Mania", description: "Vibrant array of 18 exotic fruit flavours with a citrus finish" },
    { name: "Blue-Kiwi Bliss", description: "Classic blueberry taste mixed with Kiwi & notes of menthol" },
    { name: "Hawaiian Punch", description: "Rich, exotic taste of ripe Mangoes & pineapples" },
    { name: "Midnight Melon", description: "Juicy melon notes, bright blueberries, and cool menthol" },
    { name: "Passion Fruit & Chill", description: "Passion fruit, honeydew melon, watermelon and mint" },
    { name: "The Commissioner", description: "A captivating fusion of menthol's refreshing chill, earthy depth, and a hint of zesty citric fruit" },
    { name: "The Empress", description: "A regal blend of juicy berries, tropical mango, and ripe melons with refreshing mint undernotes" },
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

  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              Shisha Menu
            </h1>
            <p className="text-lg text-muted-foreground">
              Premium exotic flavors crafted for an elevated experience
            </p>
          </div>

          {/* Signature Shishas */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-secondary" />
              <h2 className="font-playfair text-4xl font-bold text-center">Signature Shishas</h2>
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-center text-2xl font-bold text-primary mb-8">$42.99</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {signatureFlavors.map((flavor, idx) => (
                <Card key={idx} className="bg-card border-border p-6 hover:shadow-glow transition-shadow">
                  <h3 className="font-playfair text-xl font-bold mb-2 text-secondary">{flavor.name}</h3>
                  <p className="text-sm text-muted-foreground">{flavor.description}</p>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30 border-border p-4">
              <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                <span>Add Mint: <span className="text-primary font-semibold">$4</span></span>
                <span>Icepipe: <span className="text-primary font-semibold">$5.99</span></span>
              </div>
            </Card>
          </div>

          {/* Classic Shishas */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Flame className="w-8 h-8 text-accent" />
              <h2 className="font-playfair text-4xl font-bold text-center">Classic Shishas</h2>
              <Flame className="w-8 h-8 text-accent" />
            </div>
            <p className="text-center text-2xl font-bold text-primary mb-8">$37.99</p>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {classicFlavors.map((flavor, idx) => (
                <Card key={idx} className="bg-card border-border p-4 text-center hover:border-accent transition-colors">
                  <p className="font-semibold text-foreground">{flavor}</p>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30 border-border p-4">
              <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                <span>Add Mint: <span className="text-primary font-semibold">$4</span></span>
                <span>Mix Two Flavours: <span className="text-primary font-semibold">$3</span></span>
                <span>Icepipe: <span className="text-primary font-semibold">$5.99</span></span>
              </div>
            </Card>
          </div>

          {/* VIP Shishas */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Crown className="w-8 h-8 text-primary" />
              <h2 className="font-playfair text-4xl font-bold text-center bg-gradient-gold bg-clip-text text-transparent">
                VIP Shishas
              </h2>
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <p className="text-center text-2xl font-bold text-primary mb-4">$79.99</p>
            <p className="text-center text-muted-foreground mb-8">
              Elevated experience with the same premium signature flavors
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {signatureFlavors.map((flavor, idx) => (
                <Card key={idx} className="bg-gradient-mystical border-primary p-6 hover:shadow-glow transition-shadow">
                  <h3 className="font-playfair text-xl font-bold mb-2 text-primary">{flavor.name}</h3>
                  <p className="text-sm text-muted-foreground">{flavor.description}</p>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30 border-border p-4">
              <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                <span>Add Mint: <span className="text-primary font-semibold">$4</span></span>
                <span>Icepipe: <span className="text-primary font-semibold">$5.99</span></span>
              </div>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="bg-card border-border p-8">
            <h3 className="font-semibold text-center text-xl mb-6">Shisha Information</h3>
            <div className="space-y-3 text-muted-foreground max-w-2xl mx-auto">
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>All Shishas come with Coconut Charcoals & HMDs as standard</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>We levy 18% Auto-Gratuity on party size of 5 or more</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Taxes extra</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Premium quality hookah experience with exotic flavors</span>
              </p>
            </div>
          </Card>

          <div className="text-center mt-12">
            <p className="text-2xl font-playfair text-primary">#FeelTheFume</p>
          </div>
        </div>
      </main>

      <Footer />
    </PublicTheme>
  );
};

export default ShishaMenu;
