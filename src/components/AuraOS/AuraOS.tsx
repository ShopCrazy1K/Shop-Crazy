import React, { useState } from 'react';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';
import './AuraOS.css';

type ScreenState = 'locked' | 'unlocked';

const AuraOS: React.FC = () => {
  const [screenState, setScreenState] = useState<ScreenState>('locked');
  const [currentApp, setCurrentApp] = useState<string | null>(null);

  const handleUnlock = () => {
    setScreenState('unlocked');
  };

  const handleLock = () => {
    setScreenState('locked');
    setCurrentApp(null);
  };

  const handleOpenApp = (appId: string) => {
    setCurrentApp(appId);
    // In a real OS, this would launch the actual app
    console.log(`Launching app: ${appId}`);
  };

  const handleBackToHome = () => {
    setCurrentApp(null);
  };

  return (
    <div className="aura-os">
      {screenState === 'locked' ? (
        <LockScreen onUnlock={handleUnlock} />
      ) : currentApp ? (
        <div className="aura-app-container">
          <div className="aura-app-header">
            <button className="aura-back-button" onClick={handleBackToHome}>
              ← Back
            </button>
            <span className="aura-app-title">{currentApp}</span>
            <button className="aura-home-button" onClick={handleBackToHome}>
              🏠
            </button>
          </div>
          <div className="aura-app-content">
            <div className="aura-app-placeholder">
              <div className="aura-app-icon-large">📱</div>
              <h2>{currentApp} App</h2>
              <p>This is a placeholder for the {currentApp} application.</p>
              <p>In a real AuraOS implementation, this would be the actual app interface.</p>
            </div>
          </div>
        </div>
      ) : (
        <HomeScreen onLock={handleLock} onOpenApp={handleOpenApp} />
      )}
    </div>
  );
};

export default AuraOS;
