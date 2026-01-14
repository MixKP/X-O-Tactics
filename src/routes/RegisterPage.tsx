import { useNavigate } from 'react-router-dom';
import { AuthScreen } from '../ui/auth/AuthScreen';
import { profileHelpers } from '../lib/supabase';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = async (userId: string) => {
    // Load user profile and navigate to profile
    await profileHelpers.getProfile(userId);
    navigate('/profile');
  };

  return <AuthScreen onAuthSuccess={handleAuthSuccess} initialMode="register" />;
}
