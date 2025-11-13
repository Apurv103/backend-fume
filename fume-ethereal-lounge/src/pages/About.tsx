import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { PublicTheme } from "@/components/ThemeSurface";

const About = () => {
  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              FUME
            </h1>
            <p className="text-xl text-muted-foreground">Where Elements Collide</p>
          </div>

          <Card className="bg-card border-border p-8 md:p-12 mb-12">
            <h2 className="font-playfair text-3xl font-bold mb-8 text-center">Creating A Story</h2>
            
            <div className="space-y-6 text-foreground/80 text-lg leading-relaxed">
              <p>
                Fume Lounge embodies the mystique and grandeur of the "other world". The fusion of our world with the supernatural is set to elevate the senses, an experience which isn't for the ordinary. It's limitless, boundless and full of illusions!
              </p>
              
              <p>
                It's a playground for the extraordinary, where the only rule is that there are no rules. Word has it that whenever the earth and the otherworld meet, there is always an explosion.
              </p>
              
              <p>
                The result is an amalgam of elevated fusion, eccentric mixology, and an experience set to transport you to the land of the immortal.
              </p>
              
              <p className="text-center font-semibold text-xl pt-4">
                Angel or devil, get ready to discover what side of you Fume brings out!
              </p>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-playfair text-2xl font-bold mb-4 text-primary">Elevated Fusion</h3>
              <p className="text-muted-foreground">
                A unique blend of worldly and supernatural elements creating an unmatched atmosphere
              </p>
            </Card>

            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-playfair text-2xl font-bold mb-4 text-secondary">Eccentric Mixology</h3>
              <p className="text-muted-foreground">
                Crafted cocktails that push boundaries and elevate your sensory experience
              </p>
            </Card>

            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-playfair text-2xl font-bold mb-4 text-accent">Mystical Experience</h3>
              <p className="text-muted-foreground">
                Transport yourself to the land of the immortal through our otherworldly ambiance
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </PublicTheme>
  );
};

export default About;
