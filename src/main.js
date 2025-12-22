import React from 'react';
import ReactDOM from 'react-dom';

console.log('Main.js loaded');

const App = () => {
  console.log('App component rendered');
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, React.createElement('div', {
    style: { textAlign: 'center' }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: '1rem'
      }
    }, '🏈 NFL CENTER'),
    React.createElement('p', {
      key: 'subtitle',
      style: {
        fontSize: '1.25rem',
        color: '#4b5563',
        marginBottom: '0.5rem'
      }
    }, 'App is working!'),
    React.createElement('p', {
      key: 'description',
      style: {
        fontSize: '0.875rem',
        color: '#6b7280'
      }
    }, 'If you can see this, the React app is loading correctly.')
  ]));
};

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Rendering with ReactDOM.render');
  
  ReactDOM.render(
    React.createElement(React.StrictMode, null, React.createElement(App)),
    rootElement
  );
  console.log('App rendered with ReactDOM.render');
} else {
  console.error('Root element not found!');
}

