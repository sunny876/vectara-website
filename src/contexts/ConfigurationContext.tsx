import React, { createContext, useContext } from 'react';
import { Config } from '../types/config';

const ConfigurationContext = createContext<Config | null>(null);

export const useConfig = () => {
  const config = useContext(ConfigurationContext);
  if (!config) {
    throw new Error('useConfig must be used within a ConfigurationProvider');
  }
  return config;
};

export const ConfigurationProvider: React.FC<{ config: Config; children: React.ReactNode }> = ({
  config,
  children,
}) => {
  return (
    <ConfigurationContext.Provider value={config}>
      {children}
    </ConfigurationContext.Provider>
  );
};
