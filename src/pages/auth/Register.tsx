import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowLeft, User, Building2, Upload } from 'lucide-react';

type RegistrationStep = 'role' | 'details';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { showToast } = useToast();
  const [step, setStep] = useState<RegistrationStep>('role');
  const [role, setRole] = useState<'candidate' | 'employer' | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    contactPerson: '',
    uploadNow: false,
  });

  const handleRoleSelect = (selectedRole: 'candidate' | 'employer') => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'employer' && (!formData.companyName || !formData.contactPerson)) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      showToast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        role: role!,
        phone: formData.phone,
        companyName: formData.companyName
      });

      showToast({
        title: 'Account Created!',
        description: 'Logging you in...',
      });

      // After successful signup, log the user in
      await login(formData.email, formData.password);

      // Redirect to the appropriate dashboard based on the selected role
      const dashboardPath = role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(dashboardPath);
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error?.message?.includes('already registered') || error?.message?.includes('already exists')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error?.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.message?.includes('weak password') || error?.message?.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tertiary flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => step === 'role' ? navigate('/') : setStep('role')}
          className="mb-6 bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back
        </Button>

        <Card className="p-8 border border-border bg-card">
          {step === 'role' && (
            <div>
              <div className="text-center mb-8">
                <img
                  src="/src/assets/logo.png"
                  alt="TalentoSpot"
                  className="h-12 w-auto mx-auto mb-6"
                />
                <h1 className="text-h2 font-heading text-foreground mb-2">Join TalentoSpot</h1>
                <p className="text-body text-muted-foreground">Choose your account type</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleRoleSelect('candidate')}
                  className="p-8 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-h3 font-heading text-foreground mb-2">I'm a Candidate</h3>
                  <p className="text-body-sm text-muted-foreground">
                    Looking for job opportunities
                  </p>
                </button>

                <button
                  onClick={() => handleRoleSelect('employer')}
                  className="p-8 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Building2 className="w-8 h-8 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-h3 font-heading text-foreground mb-2">I'm an Employer</h3>
                  <p className="text-body-sm text-muted-foreground">
                    Looking to hire talent
                  </p>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-h2 font-heading text-foreground mb-2">
                  {role === 'candidate' ? 'Create Your Profile' : 'Company Information'}
                </h1>
                <p className="text-body text-muted-foreground">
                  {role === 'candidate' ? 'Tell us about yourself' : 'Tell us about your company'}
                </p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {role === 'employer' && (
                  <>
                    <div>
                      <Label htmlFor="companyName" className="text-body-sm font-medium text-foreground mb-2 block">
                        Company Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="TechCorp Inc."
                        value={formData.companyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-background text-foreground border-border"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPerson" className="text-body-sm font-medium text-foreground mb-2 block">
                        Contact Person <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="contactPerson"
                        type="text"
                        placeholder="John Doe"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="bg-background text-foreground border-border"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="name" className="text-body-sm font-medium text-foreground mb-2 block">
                    {role === 'employer' ? 'Your Name' : 'Full Name'} <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background text-foreground border-border"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                    Email Address <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background text-foreground border-border"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-body-sm font-medium text-foreground mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-body-sm font-medium text-foreground mb-2 block">
                    Password <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-background text-foreground border-border"
                    required
                  />
                </div>

                {role === 'candidate' && (
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.uploadNow}
                        onChange={(e) => setFormData({ ...formData, uploadNow: e.target.checked })}
                        className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="text-body-sm font-medium text-foreground">Upload CV/Photo now</p>
                        <p className="text-caption text-muted-foreground">You can also do this later from your profile</p>
                      </div>
                    </label>

                    {formData.uploadNow && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label className="text-body-sm font-medium text-foreground mb-2 block">
                            Profile Photo
                          </Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                            <p className="text-body-sm text-foreground">Click to upload photo</p>
                            <p className="text-caption text-muted-foreground">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-body-sm font-medium text-foreground mb-2 block">
                            CV/Resume
                          </Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                            <p className="text-body-sm text-foreground">Click to upload CV</p>
                            <p className="text-caption text-muted-foreground">PDF, DOC up to 10MB</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-11"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
