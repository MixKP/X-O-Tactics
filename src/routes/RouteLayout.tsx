import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../ui/navbar/Navbar';
import { authHelpers, profileHelpers } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export function RouteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const session = await authHelpers.getCurrentSession();
      if (session?.user) {
        const { data } = await profileHelpers.getProfile(session.user.id);
        if (data) {
          setUser(data);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
  }, [location.pathname]); // Reload when path changes

  const handleHome = () => {
    navigate('/');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleProfile = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    setUser(null);
    navigate('/');
  };

  // Don't show navbar on game pages
  const hideNavbarPaths = ['/local', '/match/', '/matchmaking'];
  const shouldHideNavbar = hideNavbarPaths.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHideNavbar && (
        <Navbar
          user={user}
          onHome={handleHome}
          onLeaderboard={handleLeaderboard}
          onProfile={handleProfile}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
      <Outlet />
    </>
  );
}
