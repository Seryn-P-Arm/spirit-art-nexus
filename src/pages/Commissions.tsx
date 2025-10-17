import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const pricingTiers = [
  {
    name: 'Sketch',
    price: '$15-$35',
    description: '1 Character Included. Quick turnaround, focused on composition and line art only. Each additional subject/character adds 50% to the base price.',
    features: ['1 Character Included', 'Clean line art only (no color/rendering)', 'Rough or simple background', '1 minor revision', 'High-res digital file'],
  },
  {
    name: 'Basic',
    price: '$29-$75',
    // Clarify: 1 character included. The fee applies to all additional characters.
    description: '1 Character Included in Base Price. Each additional subject/character adds 50% to the base price.',
    // Clarify: Features apply to the base package, not the final total.
    features: ['1 Character Included', 'Simple background (color/gradient)', '1 revision round', 'High-res digital file'],
  },
  {
    name: 'Standard',
    price: '$80-$129',
    // Clarify: 1 character included. The fee applies to all additional characters.
    description: '2 Characters Included in Base Price. Each additional subject/character adds 50% to the base price.',
    // Clarify: Now focuses on quality of service and background, not character count.
    features: ['2 Characters Included', 'Detailed background/scenery', '2 revision rounds', 'High-res + print files', 'Commercial usage rights'],
  },
  {
    name: 'Premium',
    price: '$149-$500',
    // Clarify: 1 character included. The fee applies to all additional characters.
    description: 'Final price is based on custom estimate after submission.',
    features: ['Multiple characters/subjects', 'Complex scene/full environment', 'Unlimited revisions', 'All file formats', 'Full commercial rights', 'Priority turnaround'],
  },
];

export default function Commissions() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Commission request submitted! I\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Commissions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bring your vision to life. Choose a tier and tell me about your dream artwork. <br/>
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={tier.name === 'Standard' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                  <p className="mt-2 text-sm text-muted-foreground/90">
                    {tier.description}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Commission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request a Commission</CardTitle>
            <CardDescription>
              Fill out the form below with as much detail as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Commission Tier</Label>
                <Select required>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* MAPPING OVER THE PRICING TIERS ARRAY */}
                    {pricingTiers.map((tier) => (
                      <SelectItem 
                      key={tier.name} // Use the name as the key
                      value={tier.name.toLowerCase()} // Use a lowercase name as the form value
                      >
                      {`${tier.name} - ${tier.price}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your vision in detail. Include subjects, mood, colors, style preferences, and any reference images you have."
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Preferred Deadline (Optional)</Label>
                <Input id="deadline" type="date" />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Submit Commission Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
