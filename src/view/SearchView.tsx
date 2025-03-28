import { VuiFlexContainer, VuiFlexItem } from "../ui";
import { SearchControls } from "./controls/SearchControls";
import { CategoryQuestions } from "./controls/CategoryQuestions";
import { useSearchContext } from "../contexts/SearchContext";
import { SummaryUx } from "./SummaryUx";
import "./searchView.scss";

export const SearchView = () => {
  const { isSearching, searchError, searchResults, isSummarizing, summarizationError, summarizationResponse } =
    useSearchContext();

  const showResults = Boolean(
    isSearching || searchError || searchResults || isSummarizing || 
    summarizationError || summarizationResponse
  );

  return (
    <div className="searchViewContainer">
      <div className="searchViewContent">
        <VuiFlexContainer className="searchView" direction="column" alignItems="center" spacing="none">
          <VuiFlexItem className="searchControlsContainer">
            <SearchControls hasQuery={showResults} />
          </VuiFlexItem>

          <VuiFlexItem grow={1} className="searchContent" alignItems="start">
            {showResults ? <SummaryUx /> : <CategoryQuestions />}
          </VuiFlexItem>
        </VuiFlexContainer>
      </div>
    </div>
  );
};
