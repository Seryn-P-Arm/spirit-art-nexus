import { Mail, Phone, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function About() {
  const [phoneButtonPos, setPhoneButtonPos] = useState({ x: 0, y: 0 });
  const [isPhoneHovered, setIsPhoneHovered] = useState(false);
  const [phoneClicked, setPhoneClicked] = useState(false);

  const handlePhoneHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (phoneClicked) return;
    
    if (!isPhoneHovered) {
      setIsPhoneHovered(true);
      return;
    }
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Move button away from cursor
    const moveX = mouseX < rect.width / 2 ? 100 : -100;
    const moveY = mouseY < rect.height / 2 ? 50 : -50;
    
    setPhoneButtonPos({ x: moveX, y: moveY });
    
    setTimeout(() => {
      setPhoneButtonPos({ x: 0, y: 0 });
    }, 2000);
  };

  const handlePhoneClick = () => {
    setPhoneClicked(true);
    toast.error("Nice try! 😏", {
      description: "I don't actually take phone calls. Use email instead! 📧",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            About the Artist
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img
              src="/placeholder.svg"
              alt="Artist workspace"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-6">
            <h2 className="text-3xl font-bold">The Journey</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Welcome to ArtisticSpirit, where the mysterious depths of imagination meet the vibrant energy of creative expression.
              </p>
              <p>
                My artistic journey began with a fascination for the interplay between darkness and light, mystery and clarity. Each piece I create explores the boundaries between the ethereal and the tangible.
              </p>
              <p>
                Working primarily with digital media, I craft worlds that exist in the space between dreams and reality, where deep teals meet electric cyans, creating atmospheres that invite viewers to lose themselves in contemplation.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Get in Touch</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="gap-2 relative group animate-pulse hover:animate-none"
              asChild
            >
              <a href="mailto:contact@artisticspirit.com" className="relative">
                <Mail className="w-5 h-5" />
                Email Me
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary animate-pulse">→</span>
                </span>
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 relative transition-all"
              style={{
                transform: `translate(${phoneButtonPos.x}px, ${phoneButtonPos.y}px)`,
              }}
              onMouseEnter={handlePhoneHover}
              onMouseMove={handlePhoneHover}
              onMouseLeave={() => !phoneClicked && setIsPhoneHovered(false)}
              onClick={handlePhoneClick}
              disabled={phoneClicked}
            >
              {phoneClicked ? (
                <>
                  <XCircle className="w-5 h-5 animate-spin" />
                  Gotcha! 😏
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Call Me
                </>
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {phoneClicked ? (
              <span className="animate-pulse text-primary font-medium">
                Now use the email button like a sensible person! 📧✨
              </span>
            ) : (
              "Try to catch the phone button if you dare... 👀"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
