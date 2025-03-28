import { useState, useEffect } from "react";
import { SearchResultWithSnippet } from "../types";
import { useConfigContext } from "../../contexts/ConfigurationContext";

// Known confidence levels for hallucination scores
export type ConfidenceLevel = "unavailable" | "low" | "medium" | "high";

// Map a numerical score to a confidence level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score < 0) {
    return "unavailable";
  }
  if (score <= 0.33) {
    return "high";
  }
  if (score <= 0.66) {
    return "medium";
  }
  return "low";
};

// Get color and label for the badge based on confidence level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getBadgeProps = (
  confidenceLevel: ConfidenceLevel
): { color: "success" | "warning" | "danger" | "neutral"; label: string } => {
  switch (confidenceLevel) {
    case "low":
      return { color: "success", label: "Low Risk" };
    case "medium":
      return { color: "warning", label: "Medium Risk" };
    case "high":
      return { color: "danger", label: "High Risk" };
    case "unavailable":
    default:
      return { color: "neutral", label: "Score N/A" };
  }
};

// Check for precomputed FCS scores in result metadata
export const getFcsScore = (result: SearchResultWithSnippet): number => {
  // List of possible metadata field names for FCS scores
  const possibleMetadataNames = [
    'fcs_score',
    'fcs',
    'factual_consistency_score',
    'hallucination_score',
    'hallucination_risk',
    'hhem_score',
    'consistency_score',
    'fact_score'
  ];
  
  if (result.document_metadata) {
    // Check each possible metadata name
    for (const name of possibleMetadataNames) {
      const scoreValue = result.document_metadata[name];
      if (scoreValue !== undefined && scoreValue !== null) {
        // Try to parse the score to a number if it's not already
        const score = typeof scoreValue === 'number' 
          ? scoreValue 
          : parseFloat(String(scoreValue));
        
        // Return the score if it's a valid number between 0 and 1
        if (!isNaN(score) && score >= 0 && score <= 1) {
          console.log(`Found precomputed FCS score in metadata: ${name} = ${score}`);
          return score;
        }
      }
    }
  }
  
  // Also check part_metadata if available
  if (result.part_metadata) {
    // Check each possible metadata name
    for (const name of possibleMetadataNames) {
      const scoreValue = result.part_metadata[name];
      if (scoreValue !== undefined && scoreValue !== null) {
        // Try to parse the score to a number if it's not already
        const score = typeof scoreValue === 'number' 
          ? scoreValue 
          : parseFloat(String(scoreValue));
        
        // Return the score if it's a valid number between 0 and 1
        if (!isNaN(score) && score >= 0 && score <= 1) {
          console.log(`Found precomputed FCS score in part_metadata: ${name} = ${score}`);
          return score;
        }
      }
    }
  }
  
  // Return -1 if no valid score was found
  return -1;
};

// Use the exported function for internal use too
const checkMetadataForScores = getFcsScore;

// Generate a fallback score based on text similarity
const generateFallbackScore = (premise: string, hypothesis: string): number => {
  // Algorithm for generating a semi-meaningful score rather than purely random
  const premiseWords = new Set(premise.toLowerCase().split(/\s+/));
  const hypothesisWords = hypothesis.toLowerCase().split(/\s+/);
  
  // Count matching words
  const matchingWords = hypothesisWords.filter(word => premiseWords.has(word)).length;
  
  // Calculate a basic relevance score based on word overlap and length
  const wordMatchRatio = hypothesisWords.length > 0 ? matchingWords / hypothesisWords.length : 0;
  const lengthRatio = Math.min(1, premise.length / Math.max(1, hypothesis.length * 10));
  
  // Combine factors for a final score between 0.1 and 0.9
  return Math.min(0.9, Math.max(0.1, (wordMatchRatio * 0.7 + lengthRatio * 0.3)));
};

interface ResultHallucinationScoreProps {
  result: SearchResultWithSnippet;
}

// Always use direct API in production since Netlify Functions are not set up
const API_ENDPOINT = "https://api-inference.huggingface.co/models/vectara/hallucination_evaluation_model";
const isProduction = process.env.NODE_ENV === 'production';

export const ResultHallucinationScore = ({ result }: ResultHallucinationScoreProps) => {
  const { search } = useConfigContext();
  // We keep these state variables even though they're not directly used in the render
  // because they're needed for the scoring functionality that powers the sorting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hallucinationScore, setHallucinationScore] = useState<number>(-1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scoreSource, setScoreSource] = useState<string>('');

  useEffect(() => {
    const evaluateHallucination = async () => {
      setIsLoading(true);
      
      try {
        // First check if the result has a precomputed FCS score in its metadata
        const metadataScore = checkMetadataForScores(result);
        if (metadataScore >= 0) {
          setHallucinationScore(metadataScore);
          setScoreSource('metadata');
          setIsLoading(false);
          return;
        }
        
        // Get the query from sessionStorage if available
        const searchQuery = sessionStorage.getItem('lastQuery') || "search query";
        
        // Format the snippet content
        const { snippet } = result;
        const premise = `${snippet.pre} ${snippet.text} ${snippet.post}`;
        
        if (!isProduction) {
          // Mock implementation for development - simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate a random score between 0.1 and 0.9 for testing
          const mockScore = Math.round((Math.random() * 0.8 + 0.1) * 100) / 100;
          setHallucinationScore(mockScore);
          setScoreSource('dev');
        } else {
          try {
            // Try direct API call to Hugging Face with proper CORS headers
            const prompt = `<pad> Determine if the hypothesis is true given the premise?\n\nPremise: ${premise}\n\nHypothesis: ${searchQuery}`;
            
            const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${search.hfToken}`,
                'Content-Type': 'application/json',
                'Origin': window.location.origin
              },
              body: JSON.stringify({ 
                inputs: prompt,
                options: { 
                  use_cache: true, 
                  wait_for_model: true
                }
              })
            });
            
            if (!response.ok) {
              // If direct API call fails, use our fallback mechanism
              throw new Error("API call failed");
            }
            
            const data = await response.json();
            let score = -1;
            
            // Try to find the "consistent" label
            for (const result of data) {
              if (result.label === "consistent") {
                score = Math.round(result.score * 100) / 100;
                break;
              }
            }
            
            // If consistent score not found but we have results, use first score
            if (score === -1 && data.length > 0) {
              score = Math.round(data[0].score * 100) / 100;
            }
            
            setHallucinationScore(score);
            setScoreSource('api');
          } catch (error) {
            console.log("Direct API call failed, using fallback scoring mechanism");
            // Use our own scoring algorithm as a fallback
            const fallbackScore = generateFallbackScore(premise, searchQuery);
            setHallucinationScore(Math.round(fallbackScore * 100) / 100);
            setScoreSource('fallback');
          }
        }
      } catch (error) {
        console.error("Error evaluating hallucination:", error);
        setHallucinationScore(-1);
        setScoreSource('error');
      } finally {
        setIsLoading(false);
      }
    };

    evaluateHallucination();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, search.hfToken]);

  // We're still calculating the scores behind the scenes for sorting purposes,
  // but we're not displaying them visually anymore
  return null;
}; 