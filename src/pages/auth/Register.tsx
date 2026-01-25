import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, User, Building2, Upload } from 'lucide-react';

type RegistrationStep = 'role' | 'details' | 'verification';

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

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleRoleSelect = (selectedRole: 'candidate' | 'employer') => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
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

    setStep('verification');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerification = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast({
        title: 'Error',
        description: 'Please enter the complete OTP code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password, role!);
      showToast({
        title: 'Account Created!',
        description: 'Welcome to TalentoSpot',
      });

      if (role === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Verification failed',
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
          onClick={() => step === 'role' ? navigate('/') : setStep(step === 'verification' ? 'details' : 'role')}
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
                  src="https://c.animaapp.com/mktjfn7fdsCv0P/img/uploaded-asset-1769361458695-0.png" 
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
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-11"
                >
                  Continue
                </Button>
              </form>
            </div>
          )}

          {step === 'verification' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h1 className="text-h2 font-heading text-foreground mb-2">Verify Your Email</h1>
                <p className="text-body text-muted-foreground">
                  We've sent a 6-digit code to<br />
                  <span className="font-medium text-foreground">{formData.email}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-h4 font-heading bg-background text-foreground border-border"
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerification}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-11"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <div className="text-center">
                  <p className="text-body-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button className="text-primary hover:text-primary-hover font-medium">
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
