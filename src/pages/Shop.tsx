import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ExternalLink, Crown } from 'lucide-react';

const merchProducts = [
  { id: 1, name: 'Mystic Depths Poster', price: '$24.99', image: '/placeholder.svg', redbubbleUrl: '#' },
  { id: 2, name: 'Cyan Dreams T-Shirt', price: '$29.99', image: '/placeholder.svg', redbubbleUrl: '#' },
  { id: 3, name: 'Ethereal Flow Mug', price: '$16.99', image: '/placeholder.svg', redbubbleUrl: '#' },
  { id: 4, name: 'Teal Whispers Phone Case', price: '$19.99', image: '/placeholder.svg', redbubbleUrl: '#' },
  { id: 5, name: 'Azure Awakening Sticker Pack', price: '$8.99', image: '/placeholder.svg', redbubbleUrl: '#' },
  { id: 6, name: 'Midnight Reverie Notebook', price: '$14.99', image: '/placeholder.svg', redbubbleUrl: '#' },
];

export default function Shop() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Merch & Shop
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take home a piece of the art. All products available on Redbubble.
          </p>
        </div>

        {/* Partnership Badge Section */}
        <Card className="mb-16 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-3 flex items-center gap-2 justify-center md:justify-start">
                  <Crown className="w-6 h-6 text-primary" />
                  Partnership Badge
                </h2>
                <p className="text-muted-foreground mb-4">
                  Join the inner circle and get exclusive benefits:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    24-hour early access to new artworks and merchandise
                  </li>
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Exclusive digital goodies and high-res wallpapers
                  </li>
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Subscriber-only discount codes
                  </li>
                </ul>
                <Button className="gap-2">
                  <Crown className="w-4 h-4" />
                  Become a Partner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-border hover:border-primary transition-all">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary">{product.price}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full gap-2" 
                  asChild
                >
                  <a href={product.redbubbleUrl} target="_blank" rel="noopener noreferrer">
                    Buy on Redbubble
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
