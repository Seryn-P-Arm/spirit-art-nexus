import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, Loader2 } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  medium: string | null;
  size: string | null;
  year: number | null;
  category_id: string | null;
  is_partner_preview: boolean;
  category?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // --- Data Fetching Logic ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [artworksRes, categoriesRes] = await Promise.all([
        // Fetch artworks, including category name via a join
        supabase.from('gallery_artworks')
          .select('*, category:gallery_categories(name)')
          .eq('is_partner_preview', false)
          .order('created_at', { ascending: false }),
        
        // FETCH CATEGORIES
        supabase.from('gallery_categories').select('*')
      ]);
      
      if (artworksRes.error) throw artworksRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setArtworks(artworksRes.data as Artwork[]);
      setCategories(categoriesRes.data as Category[]);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up real-time subscription for immediate public updates
    const subscription = supabase
      .channel('public:gallery_artworks_and_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_artworks' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_categories' }, () => {
        fetchData();
      })

      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- Filter Logic ---
  // The filters are now the list of categories plus 'All'.
  const filterArtworksByCategory = (category_id: string) => {
    setSelectedFilter(category_id);
  }

  const filteredArtworks = selectedFilter === 'All'
    ? artworks
    : artworks.filter(art => art.category_id === selectedFilter); // FILTER BY category_id

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          {/* Fixed the syntax error 'text=5xl' back to 'text-5xl' */}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Art Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A curated collection of mystical artworks exploring the depths of color and form
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {/* 'All' button */}
          <Button
            key="All"
            variant={selectedFilter === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('All')}
            className="rounded-full"
          >
            All
          </Button>
          {/* Category buttons */}
          {categories.map((category) => (
            <Button
              key={category.id}
              // Compare selectedFilter (ID) to category.id
              variant={selectedFilter === category.id ? 'default' : 'outline'} 
              // Pass category.id to the filter function
              onClick={() => filterArtworksByCategory(category.id)} 
              className="rounded-full"
            >
              {category.name}
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
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold mb-1">{artwork.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {artwork.category?.name || artwork.medium} • {artwork.year}
                  </p>
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
                    src={selectedArtwork.image_url}
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
                  <div className="text-sm text-muted-foreground space-y-1">
                    {selectedArtwork.size && <p>Size: {selectedArtwork.size}</p>}
                    {selectedArtwork.category?.name && <p>Category: {selectedArtwork.category.name}</p>}
                  </div>
                  {selectedArtwork.is_partner_preview && (
                     <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">Partner Preview</span>
                  )}
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
