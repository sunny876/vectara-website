import { BiDetail } from "react-icons/bi";
import {
  VuiDrawer,
  VuiFlexContainer,
  VuiFlexItem,
  VuiHorizontalRule,
  VuiIcon,
  VuiSearchResult,
  VuiSpacer,
  VuiText,
  VuiTextColor,
  VuiTitle,
  truncateEnd,
  truncateStart
} from "../../ui";
import { useSearchContext } from "../../contexts/SearchContext";
import "./searchResultsDrawer.scss";
import { parseSnippet } from "../../utils/parseSnippet";
import { SearchResultWithSnippet } from "../types";
import { getFcsScore } from "../results/ResultHallucinationScore";
import { useState, useEffect } from "react";

// Constants for FCS score thresholds
const HIGH_RISK_THRESHOLD = 0.33;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// Vectara provides a requested number of sentences/characters before/after relevant reference snippets.
// This variable allows for controlling the length of the text actually rendered to the screen.
const CONTEXT_MAX_LENGTH = 200;

export const SearchResultsDrawer = ({ isOpen, onClose }: Props) => {
  const { searchValue, searchResults } = useSearchContext();
  
  // State to hold sorted results
  const [sortedResults, setSortedResults] = useState<SearchResultWithSnippet[] | undefined>(searchResults);
  
  // Sort results when they change
  useEffect(() => {
    if (!searchResults) {
      setSortedResults(undefined);
      return;
    }
    
    // Log original scores for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Drawer - Original results:', searchResults.map(r => ({
        title: r.document_metadata.title,
        fcs: getFcsScore(r),
        score: r.score
      })));
    }
    
    // Create a copy of results to avoid modifying the original array
    const filteredAndSortedResults = [...searchResults]
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
      console.log('Drawer - Sorted results:', filteredAndSortedResults.map(r => ({
        title: r.document_metadata.title,
        fcs: getFcsScore(r),
        score: r.score
      })));
    }
    
    setSortedResults(filteredAndSortedResults);
  }, [searchResults]);

  return (
    <VuiDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <VuiFlexContainer justifyContent="spaceBetween" alignItems="center" spacing="xs">
          <VuiFlexItem>
            <VuiIcon size="s">
              <BiDetail />
            </VuiIcon>
          </VuiFlexItem>

          <VuiFlexItem grow={1}>
            <VuiTitle size="s">
              <h2>Review search results</h2>
            </VuiTitle>
          </VuiFlexItem>
        </VuiFlexContainer>
      }
    >
      <VuiText size="l">
        <p>{searchValue}</p>
      </VuiText>

      <VuiSpacer size="xs" />

      <VuiHorizontalRule />

      <VuiSpacer size="m" />

      <VuiText>
        <p>
          <VuiTextColor color="subdued">
            These are all of the search results retrieved for this query. Not all of them will be used to generate a
            summary. High-risk results are excluded.
          </VuiTextColor>
        </p>
      </VuiText>

      <VuiSpacer size="m" />

      <div className="searchResultsDrawerResults">
        {sortedResults?.map((result, index) => {
          const { pre, text, post } = parseSnippet(result.text);

          return (
            <VuiSearchResult
              key={result.text}
              result={{
                title: result.document_metadata.title as string,
                url: result.document_metadata.url as string,
                snippet: {
                  pre: truncateStart(pre, CONTEXT_MAX_LENGTH),
                  text,
                  post: truncateEnd(post, CONTEXT_MAX_LENGTH)
                }
              }}
              position={index + 1}
              subTitle={
                <VuiText size="s">
                  <p>
                    <VuiTextColor color="subdued">Source: {result.document_metadata.source as string}</VuiTextColor>
                  </p>
                </VuiText>
              }
            />
          );
        })}
      </div>

      <VuiSpacer size="xl" />
    </VuiDrawer>
  );
};
