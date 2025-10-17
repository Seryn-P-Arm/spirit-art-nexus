import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Palette, ShoppingBag, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import heroArt1 from '@/assets/hero-artwork-1.jpg';
import heroArt2 from '@/assets/hero-artwork-2.jpg';
import heroArt3 from '@/assets/hero-artwork-3.jpg';

const featuredArtworks = [
  { id: 1, title: 'Mystic Depths', image: heroArt1 },
  { id: 2, title: 'Cyan Dreams', image: heroArt2 },
  { id: 3, title: 'Ethereal Flow', image: heroArt3 },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        {/* Carousel */}
        <div className="relative h-full container mx-auto px-6 flex items-center justify-center">
          <div className="max-w-5xl w-full">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              {featuredArtworks.map((artwork, index) => (
                <div
                  key={artwork.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-3xl font-bold text-white mb-2">{artwork.title}</h3>
                    <div className="flex gap-2">
                      {featuredArtworks.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentSlide ? 'bg-primary w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            to="/gallery"
            className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">View Full Gallery</h3>
              <p className="text-muted-foreground">
                Explore the complete collection of artworks
              </p>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          <Link
            to="/shop"
            className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Shop Merch</h3>
              <p className="text-muted-foreground">
                Own a piece of the art on premium products
              </p>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          <Link
            to="/commissions"
            className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pencil className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Order a Commission</h3>
              <p className="text-muted-foreground">
                Request custom artwork tailored to your vision
              </p>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
