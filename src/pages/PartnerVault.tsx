import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';

export default function PartnerVault() {
  const { isPartner, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isPartner) {
      navigate('/');
    }
  }, [isPartner, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isPartner) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Partnership Vault
            </h1>
          </div>
          <p className="text-muted-foreground">
            Exclusive content and benefits for partners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Digital Goodies</h3>
            <p className="text-muted-foreground">Wallpapers and exclusive downloads</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Preview Gallery</h3>
            <p className="text-muted-foreground">See new artworks before public release</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Early Access</h3>
            <p className="text-muted-foreground">First access to new merchandise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
