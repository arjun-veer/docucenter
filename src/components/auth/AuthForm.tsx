
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/store';
import { AuthMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AuthForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultMode = (searchParams.get('mode') as AuthMode) || 'signin';
  
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (mode === 'signup' && !name) {
      toast.error('Please enter your name');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (mode === 'signin') {
        const success = await login(email, password);
        if (success) {
          toast.success('Logged in successfully');
          navigate('/dashboard');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        const success = await signup(email, password, name);
        if (success) {
          toast.success('Account created successfully');
          navigate('/dashboard');
        } else {
          toast.error('Failed to create account');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // For demo purposes, we'll add a quick login function
  const handleQuickLogin = async () => {
    try {
      setIsLoading(true);
      const success = await login('student@example.com', 'password123');
      if (success) {
        toast.success('Logged in as demo user');
        navigate('/dashboard');
      } else {
        toast.error('Demo login failed');
      }
    } catch (error) {
      toast.error('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-xl shadow-sm border animate-fade-in">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'signin' 
            ? 'Enter your email to sign in to your account' 
            : 'Enter your details to create a new account'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === 'signin' && (
              <Button variant="link" size="sm" className="px-0 h-auto font-normal">
                Forgot password?
              </Button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder={mode === 'signin' ? 'Enter password' : 'Create password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            <>{mode === 'signin' ? 'Sign in' : 'Create account'}</>
          )}
        </Button>
      </form>
      
      {/* Quick demo login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Demo
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleQuickLogin}
        disabled={isLoading}
      >
        Quick Login (Demo)
      </Button>
      
      <div className="text-center text-sm">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal"
              onClick={() => setMode('signup')}
              disabled={isLoading}
            >
              Sign up
            </Button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal"
              onClick={() => setMode('signin')}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};
