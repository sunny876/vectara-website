import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SearchContextProvider } from '../contexts/SearchContext';
import { AppHeader } from '../view/chrome/AppHeader';
import { SearchView } from '../view/SearchView';
import { HarvardManagementDocuments } from '../view/controls/HarvardManagementDocuments';
import "../App.scss";

const AppLayout: React.FC = () => {
  return (
    <SearchContextProvider>
      <AppHeader />
      <Routes>
        <Route path="/" element={<SearchView />} />
        <Route path="/documents" element={<HarvardManagementDocuments />} />
      </Routes>
    </SearchContextProvider>
  );
};

export default AppLayout; 