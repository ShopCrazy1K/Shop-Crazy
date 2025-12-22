import React, { useState } from 'react';
import AuraOS from './AuraOS';
import './AuraOS.css';

const AuraOSDemo: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="aura-demo-container">
      {showInstructions ? (
        <div className="aura-instructions">
          <div className="aura-instructions-content">
            <div className="aura-demo-logo">
              <div className="aura-demo-logo-ring">
                <div className="aura-demo-logo-inner"></div>
              </div>
              <h1>AuraOS</h1>
              <p className="aura-demo-subtitle">The Future of Mobile Computing</p>
            </div>
            
            <div className="aura-features">
              <h2>Features</h2>
              <ul>
                <li>🔒 Futuristic Lock Screen with Glowing Elements</li>
                <li>📱 Modern Home Screen with App Grid</li>
                <li>🎛️ Control Center for Quick Settings</li>
                <li>🔔 Notification System</li>
                <li>📱 Responsive Design for All Devices</li>
                <li>✨ Smooth Animations and Transitions</li>
                <li>🎨 Beautiful Gradient Backgrounds</li>
                <li>💫 Glowing UI Elements</li>
              </ul>
            </div>

            <div className="aura-instructions-text">
              <h2>How to Use</h2>
              <ol>
                <li>Start at the lock screen - click the unlock button to proceed</li>
                <li>Explore the home screen with the app grid</li>
                <li>Tap on any app icon to "launch" it</li>
                <li>Use the lock button to return to lock screen</li>
                <li>Tap the status bar to open control center</li>
                <li>Test the responsive design by resizing your browser</li>
              </ol>
            </div>

            <button 
              className="aura-start-button"
              onClick={() => setShowInstructions(false)}
            >
              Launch AuraOS
            </button>
          </div>
        </div>
      ) : (
        <div className="aura-os-wrapper">
          <div className="aura-demo-header">
            <button 
              className="aura-back-to-instructions"
              onClick={() => setShowInstructions(true)}
            >
              ← Back to Instructions
            </button>
            <h3>AuraOS Demo</h3>
            <div className="aura-demo-info">
              <span>Mobile OS Simulation</span>
            </div>
          </div>
          <AuraOS />
        </div>
      )}
    </div>
  );
};

export default AuraOSDemo;
