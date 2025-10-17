import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ZoomIn } from 'lucide-react';

const artworks = [
  { id: 1, title: 'Mystic Depths', medium: 'Digital', year: '2024', image: '/placeholder.svg' },
  { id: 2, title: 'Cyan Dreams', medium: 'Mixed Media', year: '2024', image: '/placeholder.svg' },
  { id: 3, title: 'Ethereal Flow', medium: 'Digital', year: '2023', image: '/placeholder.svg' },
  { id: 4, title: 'Teal Whispers', medium: 'Oil on Canvas', year: '2023', image: '/placeholder.svg' },
  { id: 5, title: 'Azure Awakening', medium: 'Digital', year: '2024', image: '/placeholder.svg' },
  { id: 6, title: 'Midnight Reverie', medium: 'Watercolor', year: '2023', image: '/placeholder.svg' },
];

const filters = ['All', 'Digital', 'Mixed Media', 'Oil on Canvas', 'Watercolor'];

export default function Gallery() {
  const [selectedArtwork, setSelectedArtwork] = useState<typeof artworks[0] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredArtworks = selectedFilter === 'All' 
    ? artworks 
    : artworks.filter(art => art.medium === selectedFilter);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Art Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A curated collection of mystical artworks exploring the depths of color and form
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              onClick={() => setSelectedFilter(filter)}
              className="rounded-full"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => setSelectedArtwork(artwork)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-card border border-border hover:border-primary transition-all"
            >
              <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold mb-1">{artwork.title}</h3>
                  <p className="text-sm text-muted-foreground">{artwork.medium} • {artwork.year}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <ZoomIn className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
          <DialogContent className="max-w-4xl p-0 border-border">
            {selectedArtwork && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="relative group aspect-square rounded-lg overflow-hidden">
                  <img
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover transition-transform hover:scale-125 cursor-zoom-in"
                  />
                </div>
                <div className="flex flex-col justify-center gap-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedArtwork.title}</h2>
                    <div className="flex gap-4 text-muted-foreground">
                      <span>{selectedArtwork.medium}</span>
                      <span>•</span>
                      <span>{selectedArtwork.year}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedArtwork(null)}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
