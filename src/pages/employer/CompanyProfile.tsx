import React, { useState, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { employerService } from '../../services/employer.service';
import { storageService } from '../../services/storage.service';
import { Upload, Building2, Loader2, X } from 'lucide-react';

const CompanyProfile: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const profile = await employerService.getEmployerById(user.id);
        if (profile) {
          setFormData({
            companyName: profile.company_name || '',
            website: profile.website || '',
            contactPerson: profile.contact_person || '',
            phone: profile.contact_phone || '',
            email: profile.contact_email || user.email || '',
            description: profile.description || '',
            videoUrl: profile.video_url || '',
            logoUrl: profile.logo_url || '',
            openForRefugees: profile.open_for_refugees || false,
            industry: profile.industry || '',
            companySize: profile.company_size || '',
            city: profile.headquarters_city || '',
            country: profile.headquarters_country || '',
            linkedinUrl: profile.linkedin_url || '',
            twitterUrl: profile.twitter_url || '',
            facebookUrl: profile.facebook_url || '',
          });
          if (profile.logo_url) {
            setLogoPreview(profile.logo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user.email]);

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    const file = files[0];

    // Show preview
    try {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } catch (err) {
      console.error('Failed to create preview:', err);
    }

    setUploading(true);
    try {
      const publicUrl = await storageService.uploadLogo(user.id, file);
      setFormData((prev: any) => ({ ...prev, logoUrl: publicUrl }));
      await refreshUser();
      showToast({
        title: 'Logo Uploaded',
        description: 'Your company logo has been uploaded successfully',
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      showToast({
        title: 'Upload Failed',
        description: 'Failed to upload logo. Please check your connection or storage permissions.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.contactPerson) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields (Company Name and Contact Person)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const updates = {
        company_name: formData.companyName,
        website: formData.website,
        contact_person: formData.contactPerson,
        contact_phone: formData.phone,
        contact_email: formData.email,
        description: formData.description,
        video_url: formData.videoUrl,
        logo_url: formData.logoUrl,
        open_for_refugees: formData.openForRefugees,
        industry: formData.industry,
        company_size: formData.companySize,
        headquarters_city: formData.city,
        headquarters_country: formData.country,
        linkedin_url: formData.linkedinUrl,
        twitter_url: formData.twitterUrl,
        facebook_url: formData.facebookUrl,
      };

      await employerService.updateEmployerProfile(user.id, updates);
      await refreshUser();

      showToast({
        title: 'Profile Updated',
        description: 'Your company profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!formData) return null;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Company Profile</h1>
          <p className="text-body text-muted-foreground">Manage your company information and branding.</p>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="space-y-6">
            <div className="flex items-center space-x-6 pb-6 border-b border-border/50">
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shadow-sm">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Company Logo
                </Label>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    )}
                    {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {formData.logoUrl && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setLogoPreview(null);
                        setFormData({ ...formData, logoUrl: '' });
                      }}
                      className="text-muted-foreground hover:text-error h-10 w-10 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-caption text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry" className="text-body-sm font-medium text-foreground mb-2 block">
                  Industry
                </Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans text-body-sm"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="companySize" className="text-body-sm font-medium text-foreground mb-2 block">
                  Company Size
                </Label>
                <select
                  id="companySize"
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans text-body-sm"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="501-1000">501-1000 Employees</option>
                  <option value="1000+">1000+ Employees</option>
                </select>
              </div>
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
                <Label htmlFor="city" className="text-body-sm font-medium text-foreground mb-2 block">
                  City (Headquarters)
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-body-sm font-medium text-foreground mb-2 block">
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
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

            <div className="space-y-4">
              <Label className="text-body-sm font-medium text-foreground">Social Presence</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Twitter URL"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Facebook URL"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>
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
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;

