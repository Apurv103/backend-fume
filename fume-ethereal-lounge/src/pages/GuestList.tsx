import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";
import { PublicTheme } from "@/components/ThemeSurface";

const GuestList = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    groupSize: "",
    date: "",
    specialRequests: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate group size
    const size = parseInt(formData.groupSize);
    if (size < 3) {
      toast({
        title: "Minimum Group Size",
        description: "We don't accept reservations of less than 3-4 person groups. Only walk-ins for smaller groups.",
        variant: "destructive",
      });
      return;
    }

    // Send via Web3Forms
    try {
      const formElement = e.currentTarget;
      const submission = new FormData(formElement);
      submission.append("access_key", "ce7ce988-e4e8-445e-a4ff-724c59eab314");
      submission.append("subject", `Reservation Request from ${formData.name}`);
      submission.append("from_name", formData.name);
      submission.append("from_email", formData.email);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submission,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reservation Sent!",
          description: "We'll contact you soon to confirm your reservation.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          groupSize: "",
          date: "",
          specialRequests: "",
        });
        formElement.reset();
      } else {
        toast({
          title: "Submission Failed",
          description: "Please try again or contact us directly.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Unable to send your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PublicTheme className="min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
              Guest List
            </h1>
            <p className="text-lg text-muted-foreground">
              Request your reservation for an extraordinary experience
            </p>
          </div>

          <Card className="bg-card border-border p-8 md:p-12 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="groupSize">Group Size *</Label>
                  <Input
                    id="groupSize"
                    name="groupSize"
                    type="number"
                    min="3"
                    required
                    value={formData.groupSize}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="bg-background border-border min-h-[100px]"
                  placeholder="Any special occasions or requirements..."
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Request Reservation
              </Button>
            </form>
          </Card>

          <Card className="bg-muted/30 border-border p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Alternative Contact Methods
            </h3>
            <p className="text-muted-foreground mb-2">
              You can also reach us via WhatsApp or fill out our online form.
            </p>
            <Button variant="outline" className="mt-2">
              WhatsApp Us
            </Button>
          </Card>

          <Card className="bg-card border-border p-8">
            <h3 className="font-semibold text-xl mb-4 text-center">Important Information</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>We don't accept reservations of less than 3-4 person groups. Only walk-ins for smaller parties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Guest List does not mean free entry. It grants you VIP treatment and priority access, but there may still be an entry fee.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Management reserves all rights to admission. Entry may be denied if guests are found intoxicated or misbehaving.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="font-semibold text-foreground">Golden Rule: Dress to Impress!</span>
              </li>
            </ul>
          </Card>

          <div className="text-center mt-8">
            <p className="text-2xl font-playfair text-primary">#FeelTheFume</p>
          </div>
        </div>
      </main>

      <Footer />
    </PublicTheme>
  );
};

export default GuestList;
