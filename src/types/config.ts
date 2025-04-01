export type SummaryLanguage =
  | 'auto'
  | 'eng'
  | 'deu'
  | 'fra'
  | 'zho'
  | 'kor'
  | 'ara'
  | 'rus'
  | 'tha'
  | 'nld'
  | 'ita'
  | 'por'
  | 'spa'
  | 'jpn'
  | 'pol'
  | 'tur'
  | 'heb'
  | 'vie'
  | 'ind'
  | 'ces'
  | 'ukr'
  | 'ell'
  | 'fas'
  | 'hun'
  | 'ron';

export interface Config {
  // Search
  endpoint: string;
  corpusKey: string;
  customerId: string;
  apiKey: string;
  search: {
    endpoint: string;
    corpusKey: string;
    customerId: string;
    apiKey: string;
  };

  // App
  appTitle?: string;

  // Questions
  questions?: string[];

  // Reranking
  rerank: {
    isEnabled: boolean;
    numResults?: number;
    id?: number;
    diversityBias?: number;
  };

  // Hybrid search
  hybrid: {
    numWords: number;
    lambdaLong: number;
    lambdaShort: number;
  };
} 