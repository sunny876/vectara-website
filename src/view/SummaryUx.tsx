import { VuiSpacer, VuiTitle, VuiHorizontalRule, VuiSummary } from "../ui";
import { sanitizeCitations, reorderCitations, applyCitationOrder } from "../ui/utils/citations";
import { useSearchContext } from "../contexts/SearchContext";
import { SearchResultList } from "./results/SearchResultList";
import { ProgressReport } from "./progressReport/ProgressReport";
import { SummaryCitation } from "./summary/SummaryCitation";
import { SearchResultWithSnippet } from "./types";

export const SummaryUx = () => {
  const {
    isSearching,
    searchResults,
    isSummarizing,
    summarizationResponse,
    searchResultsRef,
    selectedSearchResultPosition
  } = useSearchContext();

  const rawSummary = summarizationResponse;
  const unorderedSummary = sanitizeCitations(rawSummary);

  let summary = "";
  let summarySearchResults: SearchResultWithSnippet[] = [];

  if (unorderedSummary) {
    summary = reorderCitations(unorderedSummary);
    if (searchResults) {
      summarySearchResults = applyCitationOrder(searchResults, unorderedSummary);
    }
  }

  return (
    <>
      <ProgressReport isSearching={isSearching} isSummarizing={isSummarizing} />

      {summary && (
        <>
          <VuiSpacer size="l" />

          <VuiTitle size="xs">
            <h2 style={{ display: "flex", alignItems: "center" }}>
              <strong>Summary</strong>
            </h2>
          </VuiTitle>

          <VuiSpacer size="s" />

          <VuiSummary summary={summary} SummaryCitation={SummaryCitation} />

          <VuiSpacer size="s" />

          <VuiSpacer size="l" />
          <VuiHorizontalRule />
          <VuiSpacer size="l" />

          {summarySearchResults.length > 0 && (
            <>
              <VuiTitle size="xs">
                <h2>
                  <strong>References</strong>
                </h2>
              </VuiTitle>

              <VuiSpacer size="s" />

              <SearchResultList
                results={summarySearchResults}
                selectedSearchResultPosition={selectedSearchResultPosition}
                setSearchResultRef={(index: number, ref: HTMLElement | null) =>
                  (searchResultsRef.current[index] = ref)
                }
              />
            </>
          )}
        </>
      )}
    </>
  );
};
