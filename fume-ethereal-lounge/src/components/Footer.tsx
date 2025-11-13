import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/abc.webp";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Fume" className="h-8 w-auto md:h-9" />
            </div>
            <p className="text-muted-foreground text-sm">
              Where Elements Collide
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Experience the mystique and grandeur of the otherworld.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/guest-list" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Guest List
              </Link>
              <Link to="/door-policy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Door Policy
              </Link>
              <Link to="/drinks-menu" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Drinks Menu
              </Link>
              <Link to="/shisha-menu" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Shisha Menu
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex flex-col gap-3">
              <a href="https://www.facebook.com/fumelounge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </a>
              <a href="https://www.instagram.com/fumelounge?igsh=MW55ZWo2cnVndzJxaA==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a href="https://maps.app.goo.gl/R7RLXvE5tf1yEiyDA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                <MapPin className="w-4 h-4" />
                <span>Directions</span>
              </a>
              <a href="tel:+19057813796" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                <Phone className="w-4 h-4" />
                <span>+1 905 781 3796</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Fume Bar & Lounge. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            #FeelTheFume
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
