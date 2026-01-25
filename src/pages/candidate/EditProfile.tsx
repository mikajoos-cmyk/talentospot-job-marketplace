import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { mockCandidates } from '@/data/mockCandidates';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();

  const candidateData = mockCandidates[0];

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '+49 123 456 7890',
    location: 'Berlin, Germany',
    title: 'Senior Frontend Developer',
    salaryMin: candidateData.conditions.salaryExpectation.min,
    salaryMax: candidateData.conditions.salaryExpectation.max,
    entryBonus: candidateData.conditions.entryBonus || 0,
    vacationDays: candidateData.conditions.vacationDays,
    workRadius: candidateData.conditions.workRadius,
  });

  const [skills, setSkills] = useState<string[]>(candidateData.skills.map(s => s.name));
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = () => {
    showToast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully',
    });
    navigate('/candidate/profile');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/candidate/profile')}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Edit Profile</h1>
            <p className="text-body text-muted-foreground">Update your professional information.</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Personal Information</h3>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-h2 font-heading text-primary">
                {user.name.charAt(0)}
              </div>
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Profile Picture
                </Label>
                <Button 
                  variant="outline"
                  className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Upload Photo
                </Button>
                <p className="text-caption text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-body-sm font-medium text-foreground mb-2 block">
                  Full Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                  Email Address <span className="text-error">*</span>
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

              <div>
                <Label htmlFor="location" className="text-body-sm font-medium text-foreground mb-2 block">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Professional Information</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-body-sm font-medium text-foreground mb-2 block">
                Job Title <span className="text-error">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Skills
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button 
                  size="icon" 
                  onClick={handleAddSkill}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-hover"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Salary & Conditions</h3>
          
          <div className="space-y-6">
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Salary Expectation: ${formData.salaryMin.toLocaleString()} - ${formData.salaryMax.toLocaleString()}
              </Label>
              <div className="space-y-4">
                <div>
                  <Label className="text-caption text-muted-foreground mb-2 block">Minimum</Label>
                  <Slider
                    value={[formData.salaryMin]}
                    onValueChange={(value) => setFormData({ ...formData, salaryMin: value[0] })}
                    min={30000}
                    max={200000}
                    step={5000}
                  />
                </div>
                <div>
                  <Label className="text-caption text-muted-foreground mb-2 block">Maximum</Label>
                  <Slider
                    value={[formData.salaryMax]}
                    onValueChange={(value) => setFormData({ ...formData, salaryMax: value[0] })}
                    min={30000}
                    max={200000}
                    step={5000}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Entry Bonus: €{formData.entryBonus.toLocaleString()}
              </Label>
              <Slider
                value={[formData.entryBonus]}
                onValueChange={(value) => setFormData({ ...formData, entryBonus: value[0] })}
                min={0}
                max={50000}
                step={1000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Vacation Days: {formData.vacationDays}
                </Label>
                <Slider
                  value={[formData.vacationDays]}
                  onValueChange={(value) => setFormData({ ...formData, vacationDays: value[0] })}
                  min={20}
                  max={40}
                  step={1}
                />
              </div>

              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Work Radius: {formData.workRadius} km
                </Label>
                <Slider
                  value={[formData.workRadius]}
                  onValueChange={(value) => setFormData({ ...formData, workRadius: value[0] })}
                  min={10}
                  max={200}
                  step={5}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Media</h3>
          
          <div className="space-y-6">
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Video Introduction (YouTube URL)
              </Label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Portfolio Images
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body-sm text-foreground">Click to upload images</p>
                <p className="text-caption text-muted-foreground">PNG, JPG up to 5MB each</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/candidate/profile')}
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

export default EditProfile;
