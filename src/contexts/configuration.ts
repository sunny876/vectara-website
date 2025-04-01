import { Config } from '../types/config';
import { mmrRerankerId } from '../view/types';

export const configuration: Config = {
  endpoint: process.env.REACT_APP_VECTARA_ENDPOINT || '',
  corpusKey: process.env.REACT_APP_VECTARA_CORPUS_KEY || '',
  customerId: process.env.REACT_APP_VECTARA_CUSTOMER_ID || '',
  apiKey: process.env.REACT_APP_VECTARA_API_KEY || '',
  search: {
    endpoint: process.env.REACT_APP_VECTARA_ENDPOINT || '',
    corpusKey: process.env.REACT_APP_VECTARA_CORPUS_KEY || '',
    customerId: process.env.REACT_APP_VECTARA_CUSTOMER_ID || '',
    apiKey: process.env.REACT_APP_VECTARA_API_KEY || '',
  },
  appTitle: process.env.REACT_APP_TITLE || 'Student Resources',
  questions: [],
  rerank: {
    isEnabled: true,
    numResults: 50,
    id: mmrRerankerId,
    diversityBias: 0.3
  },
  hybrid: {
    numWords: 2,
    lambdaLong: 0.0,
    lambdaShort: 0.1
  }
}; 