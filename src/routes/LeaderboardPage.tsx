import { useNavigate } from 'react-router-dom';
import { Leaderboard } from '../ui/leaderboard/Leaderboard';

export function LeaderboardPage() {
  const navigate = useNavigate();

  return <Leaderboard onBack={() => navigate('/')} />;
}
