import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDashboard } from '../ui/profile/ProfileDashboard';
import { authHelpers } from '../lib/supabase';

export function DashboardPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const session = await authHelpers.getCurrentSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleFindMatch = () => {
    navigate('/matchmaking');
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userId) {
    return null; // Will redirect
  }

  return (
    <ProfileDashboard
      userId={userId}
      onBackToMenu={handleBackToMenu}
      onFindMatch={handleFindMatch}
      onLogout={handleLogout}
    />
  );
}
