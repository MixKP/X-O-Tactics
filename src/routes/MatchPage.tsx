import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OnlineGame } from '../ui/online';
import { getGameSession } from '../services/game-session-service';
import { authHelpers, profileHelpers } from '../lib/supabase';
import type { PlayerClass } from '../types';

export function MatchPage() {
  const { matchCode } = useParams<{ matchCode: string }>();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session info will be loaded from the match code
  const [sessionInfo, setSessionInfo] = useState<{
    playerNumber: 1 | 2;
    opponentUsername: string;
    playerClass: PlayerClass;
  } | null>(null);

  useEffect(() => {
    const loadMatch = async () => {
      if (!matchCode) {
        setError('Invalid match code');
        setLoading(false);
        return;
      }

      try {
        // Check authentication
        const session = await authHelpers.getCurrentSession();
        if (!session?.user) {
          // Redirect to login if not authenticated
          navigate(`/login?redirect=/match/${matchCode}`);
          return;
        }

        setUserId(session.user.id);

        // Load game session
        const gameSession = await getGameSession(matchCode);

        if (!gameSession) {
          setError('Game session not found');
          setLoading(false);
          return;
        }

        // Determine player number
        const playerNumber = gameSession.player1_id === session.user.id ? 1 : 2;
        const opponentId = playerNumber === 1 ? gameSession.player2_id : gameSession.player1_id;
        const playerClass = playerNumber === 1 ? gameSession.player1_class : gameSession.player2_class;

        // Load opponent profile
        const { data: opponentProfile } = await profileHelpers.getProfile(opponentId);

        setSessionInfo({
          playerNumber,
          opponentUsername: opponentProfile?.username || 'Opponent',
          playerClass,
        });

        setLoading(false);

      } catch (err) {
        console.error('Failed to load match:', err);
        setError('Failed to load game session');
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchCode, navigate]);

  const handleReturnToMenu = () => {
    navigate('/profile');
  };

  const handlePlayAgain = () => {
    navigate('/matchmaking');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionInfo || !userId) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Failed to load match'}</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnlineGame
      sessionId={matchCode!}
      userId={userId}
      playerNumber={sessionInfo.playerNumber}
      opponentUsername={sessionInfo.opponentUsername}
      playerClass={sessionInfo.playerClass}
      onReturnToMenu={handleReturnToMenu}
      onPlayAgain={handlePlayAgain}
    />
  );
}
