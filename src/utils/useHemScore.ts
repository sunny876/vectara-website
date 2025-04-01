import { useEffect, useState } from "react";
import { HfInference } from "@huggingface/inference";
import { SearchResultWithSnippet } from "../view/types";

const API_URL = "https://api-inference.huggingface.co/models/vectara/hallucination_evaluation_model";

export const useHemScore = (searchResults: SearchResultWithSnippet[], hfToken: string) => {
  const [hemScores, setHemScores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHemScores = async () => {
      if (!searchResults.length || !hfToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const hf = new HfInference(hfToken);
        const endpoint = hf.endpoint(API_URL);
        const scores = await Promise.all(
          searchResults.map(async (result) => {
            const response = await endpoint.textClassification({
              inputs: `${result.snippet.pre}${result.snippet.text}${result.snippet.post}`
            });
            return response[0].score;
          })
        );
        setHemScores(scores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch HEM scores");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHemScores();
  }, [searchResults, hfToken]);

  return { hemScores, isLoading, error };
};
