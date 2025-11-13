import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicTheme } from "@/components/ThemeSurface";

const DoorPolicy = () => {
  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              Door Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Please review our policies before your visit
            </p>
          </div>

          <Alert className="mb-8 bg-card border-primary">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="text-lg">Important Notice</AlertTitle>
            <AlertDescription>
              Any person attending Fume Bar & Lounge must ensure they are appropriately dressed for the occasion. Entry is always subject to the door's discretion.
            </AlertDescription>
          </Alert>

          <Card className="bg-card border-border p-8 md:p-12 mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-6 text-center">
              Bar Hours (6PM to 10PM)
            </h2>
            <p className="text-foreground/80 text-center mb-4">
              The Fume Bar & Lounge operates a more relaxed dress code during bar hours, however:
            </p>
            <ul className="space-y-2 text-muted-foreground max-w-2xl mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>No hats are allowed to be worn inside the venue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Please avoid sportswear and tracksuits</span>
              </li>
            </ul>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card border-border p-8">
              <h3 className="font-playfair text-2xl font-bold mb-6 text-secondary text-center">
                Ladies - After Hours
              </h3>
              <p className="text-foreground/80 mb-4 text-center font-semibold">
                Dress to Impress!
              </p>
              <p className="text-muted-foreground mb-6">
                Elegant and classy is the requirement, but leave something to the imagination.
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Not Allowed:</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Over-revealing outfits</li>
                    <li>• Trainers or casual sneakers</li>
                    <li>• Sweatpants or sweatshirts</li>
                    <li>• Flip-flops, sandals, or sliders</li>
                    <li>• Casual trousers</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-8">
              <h3 className="font-playfair text-2xl font-bold mb-6 text-accent text-center">
                Gents - After Hours
              </h3>
              <p className="text-foreground/80 mb-4 text-center font-semibold">
                Make an Effort!
              </p>
              <p className="text-muted-foreground mb-6">
                Smart, stylish, and unique is what's expected.
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Guidelines:</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Designer hoodies may be accepted at door's discretion</li>
                    <li>• No hoodies up inside the venue</li>
                    <li>• No casual/sportswear branded trainers</li>
                    <li>• No flip-flops, sweatpants, or sweatshirts</li>
                    <li>• No beachwear, fleeces, or hats</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-card border-border p-8 md:p-12 mb-8">
            <h3 className="font-playfair text-2xl font-bold mb-4 text-center">
              After Hours Policy (10PM – Late)
            </h3>
            <p className="text-center text-muted-foreground mb-6">Friday to Sunday</p>
            
            <div className="max-w-2xl mx-auto space-y-4 text-foreground/80">
              <p>
                Entry on any occasion is always subject to the door's discretion. We fully reserve the right to refuse entry to guests for any reason, including but not limited to:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Underage patrons</li>
                <li>• Visible intoxication</li>
                <li>• Presenting a danger to oneself or others</li>
                <li>• Failure to adhere to the dress code</li>
              </ul>
              <p className="font-semibold text-center pt-4">
                All guests must present a physical government-issued ID at entry.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                It is recommended that guests arrive early and with their entire group.
              </p>
            </div>
          </Card>

          <Alert className="bg-destructive/10 border-destructive">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-lg text-destructive">Zero-Tolerance Physical Violence Policy</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Fume Bar & Lounge operates a strict zero-tolerance policy against physical violence.
              </p>
              <p className="font-semibold">
                Any person who commits any act of physical violence on our premises must immediately pay a $5,000 fine to the Business. This amount may increase if the operation or reputation of the Business is further disrupted or damaged.
              </p>
              <p>
                Violent individuals will have their personal information shared on an ID scan database linked to thousands of venues across Canada, likely resulting in a ban from all participating venues for a minimum of 6 years.
              </p>
              <p className="text-sm pt-2">
                By entering our venue, you automatically accept this policy in full. It is a condition of entry.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </main>

      <Footer />
    </PublicTheme>
  );
};

export default DoorPolicy;
