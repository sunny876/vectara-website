import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderLogo } from './HeaderLogo';
import './appHeader.scss';

export const AppHeader: React.FC = () => {
  return (
    <header className="vectaraHeader">
      <div className="headerContent">
        <HeaderLogo />
        <div className="headerTitle">
          <h1>Vectara Website UI</h1>
        </div>
        <div className="headerSubtitle">
          <p>A modern semantic search interface</p>
        </div>
        <nav>
          <Link to="/" className="navLink">Home</Link>
          <Link to="/documents" className="navLink">Documents</Link>
        </nav>
      </div>
    </header>
  );
};
