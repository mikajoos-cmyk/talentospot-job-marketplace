import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useToast } from '@/contexts/ToastContext';
import { Upload, Building2 } from 'lucide-react';

const CompanyProfile: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    companyName: 'TechCorp Inc.',
    website: 'https://techcorp.example.com',
    contactPerson: 'Jane Smith',
    phone: '+1 (555) 123-4567',
    email: 'contact@techcorp.com',
    description: 'Leading technology company building innovative solutions for the future.',
    videoUrl: '',
    openForRefugees: true,
  });

  const handleSave = () => {
    if (!formData.companyName || !formData.contactPerson) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    showToast({
      title: 'Profile Updated',
      description: 'Your company profile has been updated successfully',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Company Profile</h1>
          <p className="text-body text-muted-foreground">Manage your company information and branding.</p>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Company Logo
                </Label>
                <Button 
                  variant="outline"
                  className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Upload Logo
                </Button>
                <p className="text-caption text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div>
              <Label htmlFor="companyName" className="text-body-sm font-medium text-foreground mb-2 block">
                Company Name <span className="text-error">*</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-body-sm font-medium text-foreground mb-2 block">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-body-sm font-medium text-foreground mb-2 block">
                Company Description
              </Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Tell us about your company..."
                minHeight="150px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactPerson" className="text-body-sm font-medium text-foreground mb-2 block">
                  Contact Person <span className="text-error">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-body-sm font-medium text-foreground mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl" className="text-body-sm font-medium text-foreground mb-2 block">
                Company Video (YouTube URL)
              </Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="openForRefugees" className="text-body-sm font-medium text-foreground block mb-1">
                    Open for Refugees/Immigrants
                  </Label>
                  <p className="text-caption text-muted-foreground">
                    Display a badge showing your company welcomes refugee candidates
                  </p>
                </div>
                <Switch
                  id="openForRefugees"
                  checked={formData.openForRefugees}
                  onCheckedChange={(checked) => setFormData({ ...formData, openForRefugees: checked })}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;
