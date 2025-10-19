import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Helper function for slug generation
const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure slug is generated/normalized before submission if it's empty
      const finalFormData = {
          ...formData,
          slug: formData.slug || generateSlug(formData.name),
      };
      if (editingId) {
        const { error } = await supabase
          .from('gallery_categories')
          .update(finalFormData)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        const { error } = await supabase
          .from('gallery_categories')
          .insert(finalFormData);
        if (error) throw error;
        toast({ title: 'Success', description: 'Category added successfully' });
      }

      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the category from all artworks.')) return;
    try {
      const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '' });
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
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  const newSlug = generateSlug(newName);
                  setFormData({ 
                    ...formData, 
                    name: newName,
                    slug: editingId ? formData.slug : newSlug 
                  });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'} Category</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories ({categories.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchCategories}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{category.name}</h4>
                <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
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
