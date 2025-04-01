import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigurationProvider } from './contexts/ConfigurationContext';
import { configuration } from './contexts/configuration';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <ConfigurationProvider config={configuration}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ConfigurationProvider>
  );
}

export default App;
