import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[0-9]{8}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "Enter 8 digits.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      toast({ title: "Logged in", description: `Role: ${data.user.role}` });
      if (data.user?.role === "server") {
        navigate("/server");
      } else if (data.user?.role === "manager") {
        navigate("/manager");
      } else if (data.user?.role === "owner") {
        navigate("/owner");
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-playfair text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent">Login</h1>
            <p className="text-muted-foreground mt-2">Staff access via 8‑digit PIN</p>
          </div>
          <Card className="bg-card border-border p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="bg-background border-border tracking-widest text-center font-medium"
                  placeholder="********"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;


