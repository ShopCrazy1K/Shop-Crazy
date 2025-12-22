import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loaded');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Rendering with ReactDOM.render');
  
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
  console.log('App rendered with ReactDOM.render');
} else {
  console.error('Root element not found!');
}
