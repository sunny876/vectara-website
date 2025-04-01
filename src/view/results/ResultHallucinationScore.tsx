import React from 'react';
import { useConfig } from '../../contexts/ConfigurationContext';

interface ResultHallucinationScoreProps {
  result: {
    score: number;
  };
}

export const ResultHallucinationScore: React.FC<ResultHallucinationScoreProps> = ({ result }) => {
  const config = useConfig();

  return (
    <div className="result-hallucination-score">
      Score: {result.score}
    </div>
  );
}; 