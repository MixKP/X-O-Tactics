import { useState } from 'react';
import type { Profile } from '../../lib/supabase';

interface NavbarProps {
  user: Profile | null;
  onHome: () => void;
  onLeaderboard: () => void;
  onProfile: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function Navbar({ user, onHome, onLeaderboard, onProfile, onLogin, onLogout }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onHome}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl sm:text-3xl font-bold">
                <span className="text-white">X/O</span>{' '}
                <span className="gradient-shimmer">Tactics</span>
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={onLeaderboard}
              className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all text-sm font-medium"
            >
              🏆 Leaderboard
            </button>

            {user ? (
              <>
                <div className="relative">
                  {/* Profile Dropdown Button */}
                  <button
                    onClick={() => { setShowDropdown(!showDropdown); }}
                    className="flex items-center space-x-3 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-white text-sm font-medium">{user.username}</p>
                      <p className="text-gray-400 text-xs">{user.games_won}/{user.games_played} W</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 z-50 animate-fade-in">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.username}</p>
                            <p className="text-gray-400 text-xs">Player</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Statistics</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-800 rounded-lg p-2">
                            <p className="text-cyan-400 font-bold">{user.games_played}</p>
                            <p className="text-gray-400 text-xs">Played</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-2">
                            <p className="text-green-400 font-bold">{user.games_won}</p>
                            <p className="text-gray-400 text-xs">Wins</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-2">
                            <p className="text-red-400 font-bold">{user.games_lost}</p>
                            <p className="text-gray-400 text-xs">Losses</p>
                          </div>
                        </div>
                        {user.games_drawn > 0 && (
                          <div className="mt-2 text-center">
                            <span className="text-gray-400 text-sm">Draws: <span className="text-yellow-400 font-bold">{user.games_drawn}</span></span>
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <span className="text-gray-400 text-xs">
                            Streak: <span className={`${user.current_streak >= 3 ? 'text-green-400' : 'text-gray-300'} font-bold`}>
                              🔥 {user.current_streak}
                            </span>
                            {user.best_streak > 0 && (
                              <span className="text-gray-500 ml-2">(Best: {user.best_streak})</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            onProfile();
                          }}
                          className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm flex items-center space-x-2"
                        >
                          <span>👤</span>
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            onLogout();
                          }}
                          className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-sm flex items-center space-x-2"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all text-sm font-bold shadow-lg"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
