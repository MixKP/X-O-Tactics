import { useState, useEffect } from 'react';
import type { Profile, EloRating, Match } from '../../lib/supabase';
import { profileHelpers, eloHelpers, authHelpers } from '../../lib/supabase';

interface ProfileDashboardProps {
  userId: string;
  onLogout: () => void;
  onBackToMenu: () => void;
  onFindMatch: () => void;
}

export function ProfileDashboard({ userId, onLogout, onBackToMenu, onFindMatch }: ProfileDashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [eloRating, setEloRating] = useState<EloRating | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load profile
      const { data: profileData, error: profileError } = await profileHelpers.getProfile(userId);
      if (profileError) throw profileError;
      setProfile(profileData);

      // Load ELO rating
      const { data: eloData, error: eloError } = await eloHelpers.getUserRating(userId, 'ranked');
      if (eloError) throw eloError;
      setEloRating(eloData);

      // Load match history
      const { data: matchData, error: matchError } = await eloHelpers.getMatchHistory(userId, 10);
      if (matchError) throw matchError;
      setMatchHistory(matchData || []);

    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    onLogout();
  };

  const getWinRate = (): string => {
    if (!profile || profile.games_played === 0) return '0%';
    const winRate = (profile.games_won / profile.games_played) * 100;
    return winRate.toFixed(1) + '%';
  };

  const getRankColor = (rating: number): string => {
    if (rating >= 2000) return 'from-yellow-600 to-amber-500';
    if (rating >= 1800) return 'from-purple-600 to-pink-500';
    if (rating >= 1600) return 'from-cyan-600 to-blue-500';
    if (rating >= 1400) return 'from-green-600 to-emerald-500';
    if (rating >= 1200) return 'from-orange-600 to-yellow-500';
    return 'from-gray-600 to-gray-500';
  };

  const getRankTitle = (rating: number): string => {
    if (rating >= 2000) return 'Grandmaster';
    if (rating >= 1800) return 'Diamond';
    if (rating >= 1600) return 'Platinum';
    if (rating >= 1400) return 'Gold';
    if (rating >= 1200) return 'Silver';
    return 'Bronze';
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile || !eloRating) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const rankColor = getRankColor(eloRating.rating);
  const rankTitle = getRankTitle(eloRating.rating);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={onBackToMenu}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              ← Menu
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 mb-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {profile.username[0].toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{profile.username}</h2>
              <p className="text-gray-400 mb-4">Member since {new Date(profile.created_at).toLocaleDateString()}</p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Games</p>
                  <p className="text-white text-xl font-bold">{profile.games_played}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Win Rate</p>
                  <p className="text-green-400 text-xl font-bold">{getWinRate()}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Streak</p>
                  <p className={`text-xl font-bold ${profile.current_streak > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {profile.current_streak > 0 ? `+${profile.current_streak}` : profile.current_streak}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Best Streak</p>
                  <p className="text-yellow-400 text-xl font-bold">{profile.best_streak}</p>
                </div>
              </div>
            </div>

            {/* Find Match Button */}
            <button
              onClick={onFindMatch}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg animate-glow"
            >
              🎮 Find Match
            </button>
          </div>
        </div>

        {/* ELO Rating Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 mb-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Ranked ELO Rating</h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Rating Display */}
            <div className={`relative w-40 h-40 bg-gradient-to-br ${rankColor} rounded-full flex items-center justify-center shadow-2xl`}>
              <div className="text-center">
                <p className="text-5xl font-bold text-white">{eloRating.rating}</p>
                <p className="text-white/80 text-sm mt-1">{rankTitle}</p>
              </div>
            </div>

            {/* Rating Stats */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Peak</p>
                  <p className="text-yellow-400 text-lg font-bold">{eloRating.peak_rating}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Wins</p>
                  <p className="text-green-400 text-lg font-bold">{eloRating.wins}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Losses</p>
                  <p className="text-red-400 text-lg font-bold">{eloRating.losses}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Draws</p>
                  <p className="text-gray-400 text-lg font-bold">{eloRating.draws}</p>
                </div>
              </div>

              {/* Progress Bar to Next Rank */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Progress to {getRankTitle(eloRating.rating + 200)}</p>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-500"
                    style={{ width: `${((eloRating.rating % 200) / 200) * 100}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {eloRating.rating % 200} / 200 to next rank
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Recent Matches</h3>

          {matchHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No matches played yet. Start your first match!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchHistory.map((match) => {
                const isPlayer1 = match.player1_id === userId;
                const playerRatingChange = isPlayer1 ? match.player1_rating_change : match.player2_rating_change;
                const won = match.winner_id === userId;
                const drew = match.is_draw;

                return (
                  <div
                    key={match.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Result Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          drew ? 'bg-gray-600' : won ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {drew ? '🤝' : won ? '🏆' : '💔'}
                        </div>

                        {/* Match Info */}
                        <div>
                          <p className="text-white font-semibold">
                            {drew ? 'Draw' : won ? 'Victory' : 'Defeat'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {match.game_mode === 'ranked' ? '⭐ Ranked' : '🎮 Casual'} • {
                              new Date(match.played_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                      </div>

                      {/* Rating Change */}
                      <div className={`px-4 py-2 rounded-lg ${
                        playerRatingChange > 0 ? 'bg-green-600/20 text-green-400' :
                        playerRatingChange < 0 ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        <p className="text-lg font-bold">
                          {playerRatingChange > 0 ? '+' : ''}{playerRatingChange}
                        </p>
                        <p className="text-xs">ELO</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
