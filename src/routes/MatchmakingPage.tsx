import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchmakingLobby } from '../ui/matchmaking/MatchmakingLobby';
import { authHelpers, profileHelpers } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export function MatchmakingPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const session = await authHelpers.getCurrentSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      setUserId(session.user.id);

      const { data } = await profileHelpers.getProfile(session.user.id);
      if (data) {
        setProfile(data);
      }

      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const handleMatchFound = (sessionId: string, _playerNumber: 1 | 2, _opponentUsername: string, _playerClass: any) => {
    // Navigate to the match page with the session ID as the match code
    navigate(`/match/${sessionId}`);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userId || !profile) {
    return null; // Will redirect to login
  }

  return (
    <MatchmakingLobby
      userId={userId}
      profile={profile}
      onMatchFound={handleMatchFound}
      onCancel={handleCancel}
    />
  );
}
