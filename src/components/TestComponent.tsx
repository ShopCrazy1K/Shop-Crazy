import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent rendered');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">🏈 NFL CENTER</h1>
        <p className="text-xl text-gray-600">App is working!</p>
        <p className="text-sm text-gray-500 mt-2">If you can see this, the React app is loading correctly.</p>
        <p className="text-xs text-gray-400 mt-4">Check browser console for debug logs</p>
      </div>
    </div>
  );
};

export default TestComponent;
