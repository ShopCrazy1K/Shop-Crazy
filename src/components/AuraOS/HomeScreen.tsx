import React, { useState } from 'react';
import './AuraOS.css';

interface App {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface HomeScreenProps {
  onLock: () => void;
  onOpenApp: (appId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLock, onOpenApp }) => {
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const apps: App[] = [
    { id: 'phone', name: 'Phone', icon: '📞', color: '#4CAF50' },
    { id: 'messages', name: 'Messages', icon: '💬', color: '#2196F3' },
    { id: 'camera', name: 'Camera', icon: '📷', color: '#FF9800' },
    { id: 'photos', name: 'Photos', icon: '🖼️', color: '#E91E63' },
    { id: 'maps', name: 'Maps', icon: '🗺️', color: '#9C27B0' },
    { id: 'weather', name: 'Weather', icon: '🌤️', color: '#00BCD4' },
    { id: 'music', name: 'Music', icon: '🎵', color: '#FF5722' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: '#607D8B' },
    { id: 'appstore', name: 'App Store', icon: '🛍️', color: '#795548' },
    { id: 'mail', name: 'Mail', icon: '📧', color: '#3F51B5' },
    { id: 'safari', name: 'Safari', icon: '🌐', color: '#4CAF50' },
    { id: 'calendar', name: 'Calendar', icon: '📅', color: '#FF9800' }
  ];

  const dockApps: App[] = [
    { id: 'phone', name: 'Phone', icon: '📞', color: '#4CAF50' },
    { id: 'messages', name: 'Messages', icon: '💬', color: '#2196F3' },
    { id: 'camera', name: 'Camera', icon: '📷', color: '#FF9800' },
    { id: 'photos', name: 'Photos', icon: '🖼️', color: '#E91E63' }
  ];

  const handleAppTap = (appId: string) => {
    onOpenApp(appId);
  };

  const handleStatusBarTap = () => {
    setShowControlCenter(!showControlCenter);
  };

  const handleNotificationTap = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="aura-home-screen">
      {/* Background */}
      <div className="aura-bg-gradient"></div>
      
      {/* Status Bar */}
      <div className="aura-status-bar" onClick={handleStatusBarTap}>
        <div className="aura-status-left">
          <span className="aura-signal">📶</span>
          <span className="aura-wifi">📡</span>
        </div>
        <div className="aura-status-center">
          <span className="aura-time">9:41</span>
        </div>
        <div className="aura-status-right">
          <span className="aura-battery">🔋 85%</span>
        </div>
      </div>

      {/* App Grid */}
      <div className="aura-app-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="aura-app-icon"
            onClick={() => handleAppTap(app.id)}
            style={{ '--app-color': app.color } as React.CSSProperties}
          >
            <div className="aura-app-icon-bg">
              <span className="aura-app-icon-text">{app.icon}</span>
            </div>
            <div className="aura-app-name">{app.name}</div>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="aura-dock">
        {dockApps.map((app) => (
          <div
            key={app.id}
            className="aura-dock-app"
            onClick={() => handleAppTap(app.id)}
            style={{ '--app-color': app.color } as React.CSSProperties}
          >
            <div className="aura-dock-app-icon">
              <span className="aura-dock-app-icon-text">{app.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Center */}
      {showControlCenter && (
        <div className="aura-control-center">
          <div className="aura-control-header">
            <h3>Control Center</h3>
            <button onClick={() => setShowControlCenter(false)}>✕</button>
          </div>
          <div className="aura-control-grid">
            <div className="aura-control-item">
              <div className="aura-control-icon">✈️</div>
          <span>Airplane Mode</span>
        </div>
        <div className="aura-control-item">
          <div className="aura-control-icon">📶</div>
          <span>Cellular</span>
        </div>
        <div className="aura-control-item">
          <div className="aura-control-icon">📡</div>
          <span>Wi-Fi</span>
        </div>
        <div className="aura-control-item">
          <div className="aura-control-icon">🔊</div>
          <span>Sound</span>
        </div>
        <div className="aura-control-item">
          <div className="aura-control-icon">🔋</div>
          <span>Battery</span>
        </div>
        <div className="aura-control-item">
          <div className="aura-control-icon">🌙</div>
          <span>Focus</span>
        </div>
      </div>
    </div>
  )}

  {/* Notifications */}
  {showNotifications && (
    <div className="aura-notifications">
      <div className="aura-notification-header">
        <h3>Notifications</h3>
        <button onClick={() => setShowNotifications(false)}>✕</button>
      </div>
      <div className="aura-notification-list">
        <div className="aura-notification-item">
          <div className="aura-notification-icon">📱</div>
          <div className="aura-notification-content">
            <div className="aura-notification-title">System Update</div>
            <div className="aura-notification-text">AuraOS 2.0 is ready to install</div>
          </div>
        </div>
        <div className="aura-notification-item">
          <div className="aura-notification-icon">📧</div>
          <div className="aura-notification-content">
            <div className="aura-notification-title">New Message</div>
            <div className="aura-notification-text">You have 3 unread messages</div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Lock Button */}
  <div className="aura-lock-button" onClick={onLock}>
    <div className="aura-lock-icon">🔒</div>
  </div>
</div>
  );
};

export default HomeScreen;
