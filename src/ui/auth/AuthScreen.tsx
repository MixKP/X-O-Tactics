import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthView, LoginCredentials, RegisterCredentials } from '../../types/auth';
import { authHelpers, profileHelpers } from '../../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (userId: string) => void;
  initialMode?: AuthView;
}

export function AuthScreen({ onAuthSuccess, initialMode = 'login' }: AuthScreenProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>(initialMode);

  useEffect(() => {
    setView(initialMode);
  }, [initialMode]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateUsername(loginData.username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only)');
      setLoading(false);
      return;
    }

    if (!validatePassword(loginData.password)) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error } = await authHelpers.signIn(loginData.username, loginData.password);

    if (error) {
      setError(error.message || 'Failed to sign in');
      setLoading(false);
      return;
    }

    if (data.user) {
      onAuthSuccess(data.user.id);
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateUsername(registerData.username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only)');
      setLoading(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validatePassword(registerData.password)) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { data, error } = await authHelpers.signUp(
      registerData.email,
      registerData.username,
      registerData.password
    );

    if (error) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
      return;
    }

    if (data.user) {
      // Manually create profile if trigger doesn't exist
      try {
        await profileHelpers.createProfile(data.user.id, registerData.username, registerData.email);
      } catch (profileError) {
        console.error('Failed to create profile:', profileError);
        // Continue anyway - trigger might have created it
      }

      onAuthSuccess(data.user.id);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold mb-2">
            <span className="text-cyan-400">X</span>/{' '}
            <span className="gradient-shimmer">Tactics</span>
          </h1>
          <p className="text-gray-400 text-lg">Competitive Multiplayer</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8 animate-slide-left">
          {/* Tab Toggle */}
          <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
            <button
              onClick={() => {
                navigate('/login');
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                view === 'login'
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/register');
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                view === 'register'
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-pop-in">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="Player123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">3-20 characters, letters/numbers/underscores</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="Player123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">3-20 characters, letters/numbers/underscores</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400 text-center">
              🎮 New to X/O Tactics? Create an account to track your ELO rating and compete against players worldwide!
            </p>
          </div>
        </div>

        {/* Version Info */}
        <p className="text-center text-gray-600 text-xs mt-6">
          v1.2 - Competitive Multiplayer
        </p>
      </div>
    </div>
  );
}
