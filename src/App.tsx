import { Routes, Route, Navigate } from 'react-router-dom';
import {
  RouteLayout,
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  LeaderboardPage,
  MatchmakingPage,
  MatchPage,
  LocalGamePage,
} from './routes';

function App() {
  return (
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
  );
}

export default App;
