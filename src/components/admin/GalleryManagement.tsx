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

// --- CONSTANTS ---
const ARTWORK_BUCKET = 'gallery-artworks';

// --- INTERFACES ---
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

// --- HELPER FUNCTION: SUPABASE STORAGE UPLOAD ---
const uploadArtworkImage = async (file: File) => {
    // 1. Generate a unique file path (e.g., artworks/timestamp_random.ext)
    const fileExt = file.name.split('.').pop();
    // Create a unique file name using timestamp + random string
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `artworks/${uniqueName}`; // Store inside an 'artworks' folder

    // 2. Upload the file to the bucket
    const { error: uploadError } = await supabase.storage
        .from(ARTWORK_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        throw uploadError;
    }

    // 3. Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
        .from(ARTWORK_BUCKET)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl; // Returns the full URL (e.g., https://xyz.supabase.co/storage/v1/object/public/gallery-artworks/artworks/file.jpg)
};


export function GalleryManagement() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // NEW STATE: To hold the file object for upload
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Updated formData structure
  const [formData, setFormData] = useState({
    title: '',
    // image_url is only used for editing existing artwork, new art uses imageFile
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

  // --- Data Fetching Logic (Same as before) ---
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

  // --- SUBMIT LOGIC (Updated to handle upload) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Re-use the loading state for form submission

    let finalImageUrl = formData.image_url;

    try {
      // 1. HANDLE IMAGE UPLOAD (Only for NEW Artwork)
      if (!editingId && imageFile) {
        finalImageUrl = await uploadArtworkImage(imageFile);
      } else if (!editingId && !imageFile) {
        // Prevent submission if it's a new artwork without a file
        throw new Error('Please select an image file for the new artwork.');
      }
      
      // 2. PREPARE DATABASE DATA
      const data = {
        title: formData.title,
        image_url: finalImageUrl, // Use the uploaded URL or existing URL
        medium: formData.medium || null,
        size: formData.size || null,
        year: formData.year ? parseInt(formData.year) : null,
        category_id: formData.category_id || null,
        is_partner_preview: formData.is_partner_preview,
      };

      // 3. INSERT or UPDATE
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
      fetchData(); // Refresh the list
    } catch (error: any) {
        console.error('Submission Error:', error);
        toast({ 
            title: 'Error', 
            description: error.message || 'Failed to process artwork.', 
            variant: 'destructive' 
        });
    } finally {
        setLoading(false);
    }
  };

  // --- EDIT LOGIC (Same as before, clears imageFile) ---
  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setImageFile(null); // Crucial: clear file state when editing
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

  // --- DELETE LOGIC (Same as before, you might want to add image deletion from storage here later) ---
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;
    // NOTE: For a complete solution, you would first fetch the image_url for this artwork,
    // and then use the supabase.storage.from('gallery-artworks').remove(['path/to/image.jpg']) method.
    try {
      const { error } = await supabase.from('gallery_artworks').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Artwork deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // --- RESET LOGIC (Clears file state) ---
  const resetForm = () => {
    setEditingId(null);
    setImageFile(null); // Crucial: reset the file
    setFormData({ title: '', image_url: '', medium: '', size: '', year: '', category_id: '', is_partner_preview: false });
  };

  // --- LOADING RENDER (Same as before) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- MAIN RENDER (Updated Form) ---
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
            
            {/* --- NEW FILE INPUT or OLD URL INPUT --- */}
            <div>
                {editingId ? (
                    // Display existing URL or image placeholder when editing
                    <>
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input 
                            id="image_url" 
                            value={formData.image_url} 
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                            // When editing, you can choose to allow changing the URL manually or force re-upload.
                            // For simplicity here, we allow manual editing of the URL.
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className="truncate block">{formData.image_url || 'No image URL saved.'}</span>
                        </p>
                        <p className="text-xs text-orange-500 mt-1">To change the image, you must manually edit the URL or delete and re-add the artwork.</p>
                    </>
                ) : (
                    // Require file input for NEW artwork
                    <>
                        <Label htmlFor="artwork-image">Artwork Image *</Label>
                        <Input
                            id="artwork-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            required={!editingId}
                        />
                         {imageFile && <p className="text-sm text-muted-foreground mt-1">Ready to upload: {imageFile.name}</p>}
                    </>
                )}
            </div>
            
            {/* --- REST OF THE FORM (Same as before) --- */}
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
            <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update' : 'Add') + ' Artwork'}
            </Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      {/* --- ARTWORK LIST (Same as before) --- */}
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