import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TitleScreen } from '../ui/title/TitleScreen';
import { HowToPlay } from '../ui/skills/HowToPlay';

export function HomePage() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <>
      <TitleScreen
        onStart={() => navigate('/local')}
        onCompetitive={() => navigate('/profile')}
        onHowToPlay={() => setShowHowToPlay(true)}
      />
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </>
  );
}
