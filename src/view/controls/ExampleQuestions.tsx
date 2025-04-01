import React from 'react';
import { useConfig } from '../../contexts/ConfigurationContext';
import { useSearchContext } from '../../contexts/SearchContext';
import { ExampleQuestion } from './ExampleQuestion';
import './exampleQuestions.scss';

export const ExampleQuestions: React.FC = () => {
  const config = useConfig();
  const { search } = useSearchContext();
  const questions = config.questions || [];
  const hasQuestions = questions.length > 0;

  if (!hasQuestions) return null;

  return (
    <div className="example-questions">
      {questions.map((question, index) => (
        <ExampleQuestion
          key={index}
          className="example-question"
          onClick={() => search(question)}
          title={question}
        />
      ))}
    </div>
  );
};
