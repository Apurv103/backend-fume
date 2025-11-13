import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Sparkles, Wine, Flame, UtensilsCrossed } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PublicTheme } from "@/components/ThemeSurface";
import heroImage from "@/assets/hero-lounge.jpg";
import cocktailsImage from "@/assets/cocktails.jpg";
import shishaImage from "@/assets/shisha.jpg";

const Home = () => {
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Fume Lounge Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              FUME
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 max-w-2xl mx-auto">
            Where Elements Collide
          </p>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Experience the mystique and grandeur of the otherworld. A fusion of elevated mixology, exotic shisha, and unparalleled ambiance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/guest-list">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity">
                Join Guest List
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setIsMenuDialogOpen(true)}
            >
              View Menu
            </Button>
          </div>
          
          <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
            <DialogContent className="sm:max-w-md bg-background border-border">
              <DialogHeader>
                <DialogTitle className="font-playfair text-2xl md:text-3xl bg-gradient-gold bg-clip-text text-transparent">
                  Choose Your Experience
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Select a menu to explore our offerings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Link to="/drinks-menu" onClick={() => setIsMenuDialogOpen(false)}>
                  <Card className="bg-card/50 border-border p-6 hover:shadow-glow transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wine className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-bold mb-1">Drinks Menu</h3>
                        <p className="text-sm text-muted-foreground">Cocktails, Wine & Spirits</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link to="/food-menu" onClick={() => setIsMenuDialogOpen(false)}>
                  <Card className="bg-card/50 border-border p-6 hover:shadow-glow transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UtensilsCrossed className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-bold mb-1">Food Menu</h3>
                        <p className="text-sm text-muted-foreground">Shareables, Entrees & Desserts</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link to="/shisha-menu" onClick={() => setIsMenuDialogOpen(false)}>
                  <Card className="bg-card/50 border-border p-6 hover:shadow-glow transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Flame className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-bold mb-1">Shisha Menu</h3>
                        <p className="text-sm text-muted-foreground">Signature & Classic Flavors</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 bg-gradient-mystical">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              Creating A Story
            </h2>
            <div className="w-24 h-1 bg-gradient-gold mx-auto mb-8" />
          </div>
          
          <div className="space-y-6 text-foreground/80 text-lg leading-relaxed">
            <p>
              Fume Lounge embodies the mystique and grandeur of the "other world". The fusion of our world with the supernatural is set to elevate the senses, an experience which isn't for the ordinary.
            </p>
            <p>
              It's a playground for the extraordinary, where the only rule is that there are no rules. Word has it that whenever the earth and the otherworld meet, there is always an explosion.
            </p>
            <p>
              The result is an amalgam of elevated fusion, eccentric mixology, and an experience set to transport you to the land of the immortal. Angel or devil, get ready to discover what side of you Fume brings out!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-gold bg-clip-text text-transparent">
            Making You Indulge
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mb-4 animate-float">
                  <Wine className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4">Premium Cocktails</h3>
                <p className="text-muted-foreground">
                  Signature cocktails crafted by master mixologists. From classic favorites to supernatural concoctions.
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary"
                onClick={() => setIsMenuDialogOpen(true)}
              >
                View Menu →
              </Button>
            </Card>

            <Card className="bg-card border-border p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center mb-4 animate-float" style={{ animationDelay: "1s" }}>
                  <Flame className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4">Exotic Shisha</h3>
                <p className="text-muted-foreground">
                  Premium shisha with signature flavors. From classic blends to mystical creations that elevate your experience.
                </p>
              </div>
              <Link to="/shisha-menu">
                <Button variant="ghost" className="text-primary hover:text-primary">
                  Explore Flavors →
                </Button>
              </Link>
            </Card>

            <Card className="bg-card border-border p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center mb-4 animate-float" style={{ animationDelay: "2s" }}>
                  <Sparkles className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4">Unparalleled Ambiance</h3>
                <p className="text-muted-foreground">
                  Immerse yourself in an otherworldly atmosphere where mystique meets elegance in perfect harmony.
                </p>
              </div>
              <Link to="/about">
                <Button variant="ghost" className="text-primary hover:text-primary">
                  Learn More →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-gold bg-clip-text text-transparent">
            Inside Unparalleled Ambiance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-lg aspect-video">
              <img 
                src={cocktailsImage} 
                alt="Premium Cocktails" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link to="/drinks-menu">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Drinks Menu
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-lg aspect-video">
              <img 
                src={shishaImage} 
                alt="Exotic Shisha" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link to="/shisha-menu">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Shisha Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-mystical">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            #FeelTheFume
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Ready to discover what awaits in the otherworld? Join our guest list for exclusive access and VIP treatment.
          </p>
          <Link to="/guest-list">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity animate-glow">
              Reserve Your Spot
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </PublicTheme>
  );
};

export default Home;
