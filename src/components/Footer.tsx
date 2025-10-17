import { Link } from 'react-router-dom';
import { Mail, Palette, Gamepad2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">ArtisticSpirit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Where art meets mystery and engagement.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About the Artist
              </Link>
              <Link to="/commissions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Commission Info
              </Link>
              <a 
                href="mailto:contact@artisticspirit.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact
              </a>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Fun Stuff</h3>
            <Link 
              to="/color-compass" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <Gamepad2 className="w-4 h-4 group-hover:animate-pulse" />
              Play Color Compass
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ArtisticSpirit. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
