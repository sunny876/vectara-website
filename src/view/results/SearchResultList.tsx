import React, { useState, useEffect } from 'react';

interface SearchResultWithSnippet {
  document_metadata?: {
    title?: string;
  };
  snippet: {
    pre: string;
    text: string;
    post: string;
  };
  score: number;
}

interface Props {
  results: SearchResultWithSnippet[];
  setSearchResultRef: (index: number, ref: HTMLElement | null) => void;
}

export const SearchResultList: React.FC<Props> = ({ results, setSearchResultRef }) => {
  const [sortedResults, setSortedResults] = useState<SearchResultWithSnippet[]>([]);

  useEffect(() => {
    setSortedResults([...results].sort((a, b) => b.score - a.score));
  }, [results]);

  return (
    <div className="search-result-list">
      {sortedResults.map((result, index) => (
        <div
          key={index}
          ref={(ref) => setSearchResultRef(index, ref)}
          className="search-result"
        >
          <div className="search-result-title">
            {result.document_metadata?.title || 'Untitled'}
          </div>
          <div className="search-result-snippet">
            {result.snippet.pre}
            <span className="highlight">{result.snippet.text}</span>
            {result.snippet.post}
          </div>
          <div className="search-result-score">
            Score: {result.score.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};
