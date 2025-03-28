import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigContextProvider } from './contexts/ConfigurationContext';
import { SearchContextProvider } from './contexts/SearchContext';
import { AppHeader } from './view/chrome/AppHeader';
import { SearchView } from './view/SearchView';
import { HarvardManagementDocuments } from './view/controls/HarvardManagementDocuments';
import "./App.scss";

const AppContent: React.FC = () => {
  return (
    <Router>
      <SearchContextProvider>
        <AppHeader />
        <Routes>
          <Route path="/" element={<SearchView />} />
          <Route path="/documents" element={<HarvardManagementDocuments />} />
        </Routes>
      </SearchContextProvider>
    </Router>
  );
};

export const App: React.FC = () => (
  <ConfigContextProvider>
    <AppContent />
  </ConfigContextProvider>
);
