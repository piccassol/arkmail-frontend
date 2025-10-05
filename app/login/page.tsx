'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Check for token from ARK Technologies dashboard redirect
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      router.push('/');
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({
          username,
          password,
          grant_type: 'password'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="bg-image-container">
        <Image
          src="/logo.png"
          alt="Arkmail Branding"
          fill
          className="object-contain transform scale-80"
          priority
          sizes="100vw"
          quality={100}
        />
      </div>

      {/* Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div 
          className={`w-full max-w-md opacity-0 ${isLoaded ? 'animate-fade-in' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold dripping-text tracking-wide relative inline-block text-white mb-2">
                Arkmail
                <span className="drip drip-1"></span>
                <span className="drip drip-2"></span>
                <span className="drip drip-3"></span>
              </h1>
              <p className="text-white/70 text-sm mt-2">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full burgundy-gradient hover:bg-opacity-80 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-white/50">Or continue with</span>
              </div>
            </div>

            {/* ARK Technologies Sign In */}
            
              href={`https://arktechnologies.ai/dashboard/login?redirect=${encodeURIComponent('https://mail.arktechnologies.ai')}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white font-medium"
            >
              <Sparkles className="h-5 w-5" />
              Sign in with ARK Technologies
            </a>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-white/70 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-white font-medium hover:text-burgundy-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
