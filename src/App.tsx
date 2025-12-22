import React from 'react';
import './App.css';

const App: React.FC = () => {
  console.log('App component rendered');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '1rem' 
        }}>
          🏈 NFL CENTER
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#4b5563', 
          marginBottom: '0.5rem' 
        }}>
          App is working!
        </p>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280' 
        }}>
          If you can see this, the React app is loading correctly.
        </p>
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#9ca3af',
          marginTop: '1rem'
        }}>
          Check browser console for debug logs
        </p>
      </div>
    </div>
  );
};

export default App;
