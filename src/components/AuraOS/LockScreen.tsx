import React, { useState, useEffect } from 'react';
import './AuraOS.css';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock();
    }, 800);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="aura-lock-screen">
      {/* Background gradient */}
      <div className="aura-bg-gradient"></div>
      
      {/* Time and date */}
      <div className="aura-time-container">
        <div className="aura-time">{formatTime(currentTime)}</div>
        <div className="aura-date">{formatDate(currentTime)}</div>
      </div>

      {/* AuraOS Logo */}
      <div className="aura-logo-container">
        <div className="aura-logo-ring">
          <div className="aura-logo-inner"></div>
        </div>
        <div className="aura-logo-text">AuraOS</div>
      </div>

      {/* Unlock instruction */}
      <div className="aura-unlock-instruction">
        <div className="aura-swipe-indicator">
          <div className="aura-swipe-arrow">↑</div>
          <div className="aura-swipe-text">Swipe up to unlock</div>
        </div>
      </div>

      {/* Unlock button */}
      <div 
        className={`aura-unlock-button ${isUnlocking ? 'unlocking' : ''}`}
        onClick={handleUnlock}
      >
        <div className="aura-unlock-icon">🔓</div>
      </div>

      {/* Status bar */}
      <div className="aura-status-bar">
        <div className="aura-status-left">
          <span className="aura-signal">📶</span>
          <span className="aura-wifi">📡</span>
        </div>
        <div className="aura-status-right">
          <span className="aura-battery">🔋 85%</span>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
