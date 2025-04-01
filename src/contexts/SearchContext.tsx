/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchResult, SummaryLanguage, SearchError, mmrRerankerId, SearchResultWithSnippet } from "../view/types";
import { useConfig } from "./ConfigurationContext";
import { HistoryItem, addHistoryItem, deleteHistory, retrieveHistory } from "./history";
import { streamQueryV2 } from "@vectara/stream-query-client";
import { END_TAG, START_TAG, parseSnippet } from "../utils/parseSnippet";
import type { StreamQueryConfig, StreamEvent, StreamEventHandler } from '@vectara/stream-query-client/lib/apiV2/types';

interface SearchContextType {
  filterValue: string;
  setFilterValue: (source: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearch: ({
    value,
    filter,
    language,
    isPersistable
  }: {
    value?: string;
    filter?: string;
    language?: SummaryLanguage;
    isPersistable?: boolean;
  }) => void;
  reset: () => void;
  isSearching: boolean;
  searchError: SearchError | undefined;
  searchResults: SearchResultWithSnippet[] | undefined;
  searchTime: number;
  isSummarizing: boolean;
  summarizationError: SearchError | undefined;
  summarizationResponse: string | undefined;
  summaryTime: number;
  language: SummaryLanguage;
  summaryNumResults: number;
  summaryNumSentences: number;
  summaryPromptName: string;
  history: HistoryItem[];
  clearHistory: () => void;
  searchResultsRef: React.MutableRefObject<HTMLElement[] | null[]>;
  selectedSearchResultPosition: number | undefined;
  selectSearchResultAt: (position: number) => void;
  languageValue: SummaryLanguage;
  setLanguageValue: (value: SummaryLanguage) => void;
  search: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const getQueryParam = (urlParams: URLSearchParams, key: string) => {
  const value = urlParams.get(key);
  if (value) return decodeURIComponent(value);
  return undefined;
};

type Props = {
  children: ReactNode;
};

export const SearchContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useConfig();
  const [searchValue, setSearchValue] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [languageValue, setLanguageValue] = useState<SummaryLanguage>("eng");
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState<HistoryItem[]>(retrieveHistory());
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<SearchError | undefined>();
  const [searchResults, setSearchResults] = useState<SearchResultWithSnippet[] | undefined>(undefined);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizationError, setSummarizationError] = useState<SearchError | undefined>();
  const [summarizationResponse, setSummarizationResponse] = useState<string>();
  const [summaryTime, setSummaryTime] = useState<number>(0);
  const searchResultsRef = useRef<HTMLElement[] | null[]>([]);
  const [selectedSearchResultPosition, setSelectedSearchResultPosition] = useState<number>();

  useEffect(() => {
    setHistory(retrieveHistory());
  }, []);

  useEffect(() => {
    if (isSearching) return;

    const urlParams = new URLSearchParams(searchParams);

    onSearch({
      value: getQueryParam(urlParams, "query") ?? "",
      filter: getQueryParam(urlParams, "filter"),
      language: getQueryParam(urlParams, "language") as SummaryLanguage | undefined,
      isPersistable: false
    });
  }, [searchParams]);

  useEffect(() => {
    if (searchResults) {
      searchResultsRef.current = searchResultsRef.current.slice(0, searchResults.length);
    } else {
      searchResultsRef.current = [];
    }
  }, [searchResults]);

  const clearHistory = () => {
    setHistory([]);
    deleteHistory();
  };

  const selectSearchResultAt = (position: number) => {
    if (!searchResultsRef.current[position] || selectedSearchResultPosition === position) {
      setSelectedSearchResultPosition(undefined);
    } else {
      setSelectedSearchResultPosition(position);
      window.scrollTo({
        top: searchResultsRef.current[position]!.offsetTop - 78,
        behavior: "smooth"
      });
    }
  };

  const getLanguage = (): SummaryLanguage => (languageValue ?? "auto") as SummaryLanguage;

  const onSearch = async ({
    value = searchValue,
    filter = filterValue,
    language = getLanguage(),
    isPersistable = true
  }: {
    value?: string;
    filter?: string;
    language?: SummaryLanguage;
    isPersistable?: boolean;
  }) => {
    setSearchValue(value);
    setFilterValue(filter);
    setLanguageValue(language);
    setSearchError(undefined);
    setSummarizationError(undefined);
    setSummarizationResponse(undefined);

    if (value?.trim()) {
      sessionStorage.setItem('lastQuery', value);

      setHistory(addHistoryItem({ query: value, filter, language }, history));

      if (isPersistable) {
        setSearchParams(
          new URLSearchParams(
            `?query=${encodeURIComponent(value)}&filter=${encodeURIComponent(filter)}&language=${encodeURIComponent(
              language
            )}`
          )
        );
      }

      setIsSearching(true);
      setIsSummarizing(true);
      setSelectedSearchResultPosition(undefined);

      const startTime = Date.now();

      try {
        const streamQueryConfig: StreamQueryConfig = {
          customerId: config.customerId!,
          apiKey: config.apiKey!,
          query: value,
          corpusKey: config.corpusKey!,
          search: {
            offset: 0,
            metadataFilter: "",
            lexicalInterpolation:
              value.trim().split(" ").length > config.hybrid.numWords ? config.hybrid.lambdaLong : config.hybrid.lambdaShort,
            reranker:
              config.rerank.isEnabled && config.rerank.id
                ? config.rerank.id === mmrRerankerId
                  ? {
                      type: "mmr",
                      diversityBias: 0
                    }
                  : {
                      type: "customer_reranker",
                      rerankerId: `rnk_${config.rerank.id.toString()}`
                    }
                : undefined,
            contextConfiguration: {
              sentencesBefore: 2,
              sentencesAfter: 2,
              startTag: START_TAG,
              endTag: END_TAG
            }
          },
          chat: { store: true }
        };

        const onStreamEvent = (event: StreamEvent) => {
          switch (event.type) {
            case "requestError":
            case "genericError":
            case "unexpectedError":
              setSearchError({
                message: "Error sending the query request"
              });
              break;

            case "error":
              setSummarizationError({ message: event.messages.join(", ") });
              break;

            case "searchResults":
              setIsSearching(false);
              setSearchTime(Date.now() - startTime);

              const resultsWithSnippets = event.searchResults.map((result: SearchResult) => {
                const { pre, text, post } = parseSnippet(result.text);
                return {
                  ...result,
                  snippet: {
                    pre,
                    text,
                    post
                  }
                };
              });

              setSearchResults(resultsWithSnippets);
              break;

            case "generationChunk":
              setSummarizationResponse(event.updatedText);
              break;

            case "generationEnd":
              setIsSummarizing(false);
              break;

            case "end":
              setSummaryTime(Date.now() - startTime);
              break;
          }
        };

        await streamQueryV2({
          streamQueryConfig: streamQueryConfig,
          onStreamEvent: onStreamEvent,
          includeRawEvents: false
        });
      } catch (error) {
        console.log("Summary error", error);
        setIsSummarizing(false);
        setSummarizationError(error as SearchError);
        setSummarizationResponse(undefined);
      }
    } else {
      if (isPersistable) setSearchParams(new URLSearchParams(""));

      setSearchResults(undefined);
      setSummarizationResponse(undefined);
      setIsSearching(false);
      setIsSummarizing(false);
    }
  };

  const reset = () => {
    onSearch({ value: "", filter: "" });
  };

  const search = async (query: string) => {
    setIsSearching(true);
    setSearchError(undefined);

    try {
      const streamQueryConfig: StreamQueryConfig = {
        customerId: config.search.customerId,
        apiKey: config.search.apiKey,
        query,
        corpusKey: config.search.corpusKey,
        search: {
          metadataFilter: "",
          offset: 0,
          limit: 10,
        },
        generation: {
          maxResponseCharacters: 1000,
          modelParameters: {
            maxTokens: 1000,
            temperature: 0.7,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          citations: {
            style: "html",
            urlPattern: "{url}",
            textPattern: "{text}",
          },
          enableFactualConsistencyScore: true,
        },
      };

      const onStreamEvent: StreamEventHandler = (event: StreamEvent) => {
        switch (event.type) {
          case "requestError":
          case "genericError":
          case "unexpectedError":
            setSearchError({
              message: "Error sending the query request"
            });
            break;

          case "error":
            setSearchError({ message: event.messages.join(', ') });
            break;

          case "searchResults":
            const resultsWithSnippets = event.searchResults.map((result: SearchResult) => {
              const { pre, text, post } = parseSnippet(result.text);
              return {
                ...result,
                snippet: { pre, text, post }
              };
            });
            setSearchResults(resultsWithSnippets);
            break;

          case "end":
            setIsSearching(false);
            break;
        }
      };

      await streamQueryV2({
        streamQueryConfig: streamQueryConfig,
        onStreamEvent: onStreamEvent,
        includeRawEvents: false
      });

      setSearchParams({ q: query }, { replace: true });
      const newHistoryItem = { 
        query, 
        filter: "", 
        language: "auto" as const,
        date: new Date().toISOString() 
      };
      addHistoryItem(newHistoryItem, history);
      setHistory(retrieveHistory());
    } catch (error) {
      console.error('Search error:', error);
      setSearchError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
      setIsSearching(false);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        filterValue,
        setFilterValue,
        searchValue,
        setSearchValue,
        onSearch,
        reset,
        isSearching,
        searchError,
        searchResults,
        searchTime,
        isSummarizing,
        summarizationError,
        summarizationResponse,
        summaryTime,
        language: getLanguage(),
        summaryNumResults: 7,
        summaryNumSentences: 3,
        summaryPromptName: "vectara-summary-ext-v1.2.0",
        history,
        clearHistory,
        searchResultsRef,
        selectedSearchResultPosition,
        selectSearchResultAt,
        languageValue,
        setLanguageValue,
        search,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchContextProvider");
  }
  return context;
};
