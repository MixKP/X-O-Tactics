import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Code-split routes with React.lazy for better performance
// Note: Components use named exports, so we convert to default exports
const RouteLayout = lazy(() => import('./routes/RouteLayout').then(m => ({ default: m.RouteLayout })));
const HomePage = lazy(() => import('./routes/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./routes/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./routes/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./routes/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LeaderboardPage = lazy(() => import('./routes/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const MatchmakingPage = lazy(() => import('./routes/MatchmakingPage').then(m => ({ default: m.MatchmakingPage })));
const MatchPage = lazy(() => import('./routes/MatchPage').then(m => ({ default: m.MatchPage })));
const LocalGamePage = lazy(() => import('./routes/LocalGamePage').then(m => ({ default: m.LocalGamePage })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Home */}
        <Route path="/" element={<RouteLayout />}>
          <Route index element={<HomePage />} />

          {/* Auth */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Profile */}
          <Route path="profile" element={<DashboardPage />} />

          {/* Leaderboard */}
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Matchmaking */}
          <Route path="matchmaking" element={<MatchmakingPage />} />

          {/* Online Match */}
          <Route path="match/:matchCode" element={<MatchPage />} />
        </Route>

        {/* Local/AI Game (no navbar) */}
        <Route path="/local" element={<LocalGamePage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
