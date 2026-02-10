import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import logoImg from '@/assets/logo.png';
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout } = useUser();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser.status === 'banned') {
        showToast({
          title: 'Account gesperrt',
          description: 'Dein Account wurde gesperrt. Bitte kontaktiere den Support.',
          variant: 'destructive',
        });
        await logout();
        return;
      }

      showToast({
        title: 'Welcome back!',
        description: 'You have successfully signed in',
      });

      const dashboardPath = loggedInUser.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(dashboardPath);
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tertiary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back to Home
        </Button>

        <Card className="p-8 border border-border bg-card">
          <div className="text-center mb-8">
            <img
              src={logoImg}
              alt="TalentoSpot"
              className="h-12 w-auto mx-auto mb-6"
            />
            <h1 className="text-h2 font-heading text-foreground mb-2">Welcome Back</h1>
            <p className="text-body text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background text-foreground border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-body-sm font-medium text-foreground mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-foreground border-border pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-body-sm text-foreground">Remember me</span>
              </label>
              <a href="#" className="text-body-sm text-primary hover:text-primary-hover">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-11"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
