import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  medium: string | null;
  size: string | null;
  year: number | null;
  category_id: string | null;
  is_partner_preview: boolean;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export function GalleryManagement() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    medium: '',
    size: '',
    year: '',
    category_id: '',
    is_partner_preview: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artworksRes, categoriesRes] = await Promise.all([
        supabase.from('gallery_artworks').select('*, category:gallery_categories(name)').order('created_at', { ascending: false }),
        supabase.from('gallery_categories').select('*')
      ]);

      if (artworksRes.error) throw artworksRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setArtworks(artworksRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        image_url: formData.image_url,
        medium: formData.medium || null,
        size: formData.size || null,
        year: formData.year ? parseInt(formData.year) : null,
        category_id: formData.category_id || null,
        is_partner_preview: formData.is_partner_preview,
      };

      if (editingId) {
        const { error } = await supabase.from('gallery_artworks').update(data).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Artwork updated successfully' });
      } else {
        const { error } = await supabase.from('gallery_artworks').insert(data);
        if (error) throw error;
        toast({ title: 'Success', description: 'Artwork added successfully' });
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setFormData({
      title: artwork.title,
      image_url: artwork.image_url,
      medium: artwork.medium || '',
      size: artwork.size || '',
      year: artwork.year?.toString() || '',
      category_id: artwork.category_id || '',
      is_partner_preview: artwork.is_partner_preview,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;
    try {
      const { error } = await supabase.from('gallery_artworks').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Artwork deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', image_url: '', medium: '', size: '', year: '', category_id: '', is_partner_preview: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Artwork' : 'Add New Artwork'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL *</Label>
              <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="medium">Medium</Label>
              <Input id="medium" value={formData.medium} onChange={(e) => setFormData({ ...formData, medium: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="size">Size</Label>
              <Input id="size" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.is_partner_preview} onCheckedChange={(checked) => setFormData({ ...formData, is_partner_preview: checked })} />
            <Label>Partner Preview</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'} Artwork</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Artworks ({artworks.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="p-4">
            <div className="flex items-start gap-4">
              <img src={artwork.image_url} alt={artwork.title} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-semibold">{artwork.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {artwork.medium && `${artwork.medium} • `}
                  {artwork.size && `${artwork.size} • `}
                  {artwork.year && `${artwork.year} • `}
                  {artwork.category?.name || 'No category'}
                </p>
                {artwork.is_partner_preview && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">Partner Preview</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(artwork)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(artwork.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
