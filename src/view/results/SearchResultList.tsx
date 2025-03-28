import { SearchResult } from "./SearchResult";
import { SearchResultWithSnippet } from "../types";
import { useState, useEffect } from "react";

// Import the FCS score utility
import { getFcsScore } from "./ResultHallucinationScore";

// Constants for FCS score thresholds
const HIGH_RISK_THRESHOLD = 0.33;

type Props = {
  results: Array<SearchResultWithSnippet>;
  selectedSearchResultPosition?: number;
  setSearchResultRef: (el: HTMLDivElement | null, index: number) => void;
};

export const SearchResultList = ({ results, selectedSearchResultPosition, setSearchResultRef }: Props) => {
  // State to hold sorted results
  const [sortedResults, setSortedResults] = useState<Array<SearchResultWithSnippet>>(results);
  
  // Sort results when the input changes
  useEffect(() => {
    // Log original scores for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Original results:', results.map(r => ({
        title: r.document_metadata.title,
        fcs: getFcsScore(r),
        score: r.score
      })));
    }
    
    // Create a copy of results to avoid modifying the original array
    const filteredAndSortedResults = [...results]
      // Filter out high risk results (FCS score <= 0.33)
      .filter(result => {
        const fcsScore = getFcsScore(result);
        // Keep results with no FCS score or with scores above the high risk threshold
        return fcsScore < 0 || fcsScore > HIGH_RISK_THRESHOLD;
      })
      // Sort the filtered results by FCS score
      .sort((a, b) => {
        // Get FCS scores for both results
        const scoreA = getFcsScore(a);
        const scoreB = getFcsScore(b);
        
        // Force prioritize results with FCS scores
        if (scoreA >= 0 && scoreB < 0) return -1;
        if (scoreA < 0 && scoreB >= 0) return 1;
        
        // Sort by FCS score ascending (lowest first)
        // If both have valid scores, compare them
        if (scoreA >= 0 && scoreB >= 0) {
          return scoreA - scoreB; // Ascending order (lowest first)
        }
        
        // If neither has a valid score, keep original order based on Vectara's score
        return b.score - a.score;
      });
    
    // Log sorted scores for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sorted results:', filteredAndSortedResults.map(r => ({
        title: r.document_metadata.title,
        fcs: getFcsScore(r),
        score: r.score
      })));
    }
    
    setSortedResults(filteredAndSortedResults);
  }, [results]);

  return (
    <>
      {sortedResults.map((result, i) => (
        <SearchResult
          key={i}
          result={result}
          position={i}
          isSelected={selectedSearchResultPosition === i}
          ref={(el: HTMLDivElement | null) => setSearchResultRef(el, i)}
        />
      ))}
    </>
  );
};
