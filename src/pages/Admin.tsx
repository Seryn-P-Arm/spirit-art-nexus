import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { GalleryManagement } from '@/components/admin/GalleryManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { MerchManagement } from '@/components/admin/MerchManagement';
import { PartnerContentManagement } from '@/components/admin/PartnerContentManagement';

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your gallery, merch, users, and partner content
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="merch">Merch</TabsTrigger>
            <TabsTrigger value="partner">Partner Content</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="merch" className="space-y-4">
            <MerchManagement />
          </TabsContent>

          <TabsContent value="partner" className="space-y-4">
            <PartnerContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
