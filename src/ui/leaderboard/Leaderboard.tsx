import { useState, useEffect } from 'react';
import { profileHelpers } from '../../lib/supabase';
import type { EloRating } from '../../lib/supabase';

interface LeaderboardProps {
  onBack: () => void;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<(EloRating & { username: string; games_played: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await profileHelpers.getLeaderboard('ranked', 100);

      if (fetchError) throw fetchError;

      // Transform data to include username
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        username: item.profiles?.username || 'Unknown',
        games_played: item.profiles?.games_played || 0,
      }));

      setLeaderboard(transformedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'from-yellow-500 to-amber-400'; // Gold
    if (rank === 2) return 'from-gray-300 to-gray-200'; // Silver
    if (rank === 3) return 'from-orange-600 to-orange-500'; // Bronze
    return 'from-gray-700 to-gray-600'; // Others
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankTitle = (rating: number): string => {
    if (rating >= 2000) return 'Grandmaster';
    if (rating >= 1800) return 'Diamond';
    if (rating >= 1600) return 'Platinum';
    if (rating >= 1400) return 'Gold';
    if (rating >= 1200) return 'Silver';
    return 'Bronze';
  };

  const getWinRate = (wins: number, losses: number, draws: number): string => {
    const total = wins + losses + draws;
    if (total === 0) return '0%';
    return ((wins / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-400">Top players in Ranked mode</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading leaderboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
            <p className="text-red-300">⚠️ {error}</p>
            <button
              onClick={loadLeaderboard}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-gray-300 to-gray-200 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {leaderboard[1]?.username[0]?.toUpperCase()}
                  </div>
                  <div className="bg-gray-600 rounded-t-lg px-4 pt-2">
                    <p className="text-white font-bold">{leaderboard[1]?.username}</p>
                    <p className="text-gray-300 text-sm">{leaderboard[1]?.rating} ELO</p>
                  </div>
                  <div className="h-20 bg-gradient-to-t from-gray-700 to-gray-600 flex items-center justify-center">
                    <span className="text-4xl">🥈</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-2 bg-gradient-to-br from-yellow-500 to-amber-400 rounded-full flex items-center justify-center text-4xl shadow-lg ring-4 ring-yellow-300">
                    {leaderboard[0]?.username[0]?.toUpperCase()}
                  </div>
                  <div className="bg-yellow-600 rounded-t-lg px-4 pt-2">
                    <p className="text-white font-bold text-lg">{leaderboard[0]?.username}</p>
                    <p className="text-yellow-200 text-sm">{leaderboard[0]?.rating} ELO</p>
                  </div>
                  <div className="h-28 bg-gradient-to-t from-yellow-700 to-yellow-600 flex items-center justify-center">
                    <span className="text-5xl">🥇</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {leaderboard[2]?.username[0]?.toUpperCase()}
                  </div>
                  <div className="bg-orange-700 rounded-t-lg px-4 pt-2">
                    <p className="text-white font-bold">{leaderboard[2]?.username}</p>
                    <p className="text-orange-200 text-sm">{leaderboard[2]?.rating} ELO</p>
                  </div>
                  <div className="h-16 bg-gradient-to-t from-orange-800 to-orange-700 flex items-center justify-center">
                    <span className="text-3xl">🥉</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard List */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden shadow-xl">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-900/50 border-b border-gray-700 text-gray-400 text-xs font-semibold uppercase">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4 sm:col-span-5">Player</div>
                <div className="col-span-2 text-right">ELO</div>
                <div className="col-span-2 text-right hidden sm:block">W/L/D</div>
                <div className="col-span-2 text-right hidden sm:block">Win Rate</div>
                <div className="col-span-5 sm:col-span-2 text-right">Rank</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-700/50">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/30 transition-all items-center"
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor(index + 1)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                        {getRankIcon(index + 1)}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="col-span-4 sm:col-span-5 flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                        index === 0 ? 'from-yellow-500 to-amber-400' :
                        index === 1 ? 'from-gray-300 to-gray-200' :
                        index === 2 ? 'from-orange-600 to-orange-500' :
                        'from-cyan-500 to-purple-500'
                      } flex items-center justify-center text-white font-bold shadow-lg`}>
                        {player.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{player.username}</p>
                        <p className="text-gray-400 text-xs">{player.games_played} games</p>
                      </div>
                    </div>

                    {/* ELO Rating */}
                    <div className="col-span-2 text-right">
                      <p className="text-cyan-400 font-bold text-lg">{player.rating}</p>
                    </div>

                    {/* W/L/D */}
                    <div className="col-span-2 text-right hidden sm:block">
                      <p className="text-gray-400 text-sm">
                        <span className="text-green-400">{player.wins}</span>/
                        <span className="text-red-400">{player.losses}</span>/
                        <span className="text-gray-400">{player.draws}</span>
                      </p>
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-2 text-right hidden sm:block">
                      <p className={`font-semibold ${
                        parseFloat(getWinRate(player.wins, player.losses, player.draws)) >= 50 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {getWinRate(player.wins, player.losses, player.draws)}
                      </p>
                    </div>

                    {/* Rank Title */}
                    <div className="col-span-5 sm:col-span-2 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        player.rating >= 2000 ? 'bg-yellow-600/30 text-yellow-400' :
                        player.rating >= 1800 ? 'bg-purple-600/30 text-purple-400' :
                        player.rating >= 1600 ? 'bg-cyan-600/30 text-cyan-400' :
                        player.rating >= 1400 ? 'bg-green-600/30 text-green-400' :
                        player.rating >= 1200 ? 'bg-orange-600/30 text-orange-400' :
                        'bg-gray-600/30 text-gray-400'
                      }`}>
                        {getRankTitle(player.rating)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {leaderboard.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No players on the leaderboard yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Be the first to compete!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="text-center text-gray-400 text-sm">
              <p>Total Players: <span className="text-cyan-400 font-bold">{leaderboard.length}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
