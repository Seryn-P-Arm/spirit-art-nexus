import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PartnerContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export function PartnerContentManagement() {
  const [content, setContent] = useState<PartnerContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    file_url: '',
    thumbnail_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
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
        description: formData.description || null,
        content_type: formData.content_type,
        file_url: formData.file_url,
        thumbnail_url: formData.thumbnail_url || null,
      };

      if (editingId) {
        const { error } = await supabase.from('partner_content').update(data).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Content updated successfully' });
      } else {
        const { error } = await supabase.from('partner_content').insert(data);
        if (error) throw error;
        toast({ title: 'Success', description: 'Content added successfully' });
      }

      resetForm();
      fetchContent();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: PartnerContent) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      content_type: item.content_type,
      file_url: item.file_url,
      thumbnail_url: item.thumbnail_url || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      const { error } = await supabase.from('partner_content').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Content deleted successfully' });
      fetchContent();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', content_type: '', file_url: '', thumbnail_url: '' });
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
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Content' : 'Add New Content'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="content_type">Content Type *</Label>
              <Input id="content_type" placeholder="e.g. video, image, pdf" value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="file_url">File URL *</Label>
              <Input id="file_url" value={formData.file_url} onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input id="thumbnail_url" value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'} Content</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Partner Content ({content.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchContent}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {content.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt={item.title} className="w-24 h-24 object-cover rounded" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">Type: {item.content_type}</p>
                {item.description && <p className="text-sm mt-1">{item.description}</p>}
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 inline-block">
                  View File
                </a>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
