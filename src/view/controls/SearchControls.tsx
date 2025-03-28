import { ChangeEvent, FormEvent, useState } from "react";
import { BiSlider, BiTimeFive } from "react-icons/bi";
import {
  VuiFlexContainer,
  VuiFlexItem,
  VuiSearchInput,
  VuiSpacer,
  VuiText,
  VuiIcon,
  VuiButtonSecondary
} from "../../ui";
import { useSearchContext } from "../../contexts/SearchContext";
import { HistoryDrawer } from "./HistoryDrawer";
import { OptionsDrawer } from "./OptionsDrawer";
import "./searchControls.scss";

type Props = {
  hasQuery: boolean;
};

export const SearchControls = ({ hasQuery }: Props) => {
  const { searchValue, setSearchValue, onSearch, reset } = useSearchContext();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const onSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch({ value: searchValue });
  };

  return (
    <>
      <div className="searchControls">
        <VuiSearchInput
          size="l"
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Ask a question about your investments or market research..."
          autoFocus
        />

        <VuiSpacer size="s" />

        <VuiFlexContainer alignItems="center" justifyContent="spaceBetween">
          <VuiFlexItem grow={false}>
            <VuiText size="s" className="aiPoweredText">
              <p>AI-powered search</p>
            </VuiText>
          </VuiFlexItem>

          <VuiFlexItem grow={false}>
            <VuiFlexContainer alignItems="center" spacing="m">
              <VuiFlexItem grow={false}>
                <VuiButtonSecondary
                  className="modernButton historyButton"
                  color="neutral"
                  size="s"
                  isSelected={isHistoryOpen}
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  icon={
                    <VuiIcon size="m">
                      <BiTimeFive />
                    </VuiIcon>
                  }
                >
                  History
                </VuiButtonSecondary>
              </VuiFlexItem>

              <VuiFlexItem grow={false}>
                <VuiButtonSecondary
                  className="modernButton optionsButton"
                  color="neutral"
                  size="s"
                  isSelected={isOptionsOpen}
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  icon={
                    <VuiIcon size="m">
                      <BiSlider />
                    </VuiIcon>
                  }
                >
                  Options
                </VuiButtonSecondary>
              </VuiFlexItem>
            </VuiFlexContainer>
          </VuiFlexItem>
        </VuiFlexContainer>

        {hasQuery && (
          <>
            <VuiSpacer size="m" />
            <VuiButtonSecondary className="modernButton resetButton" color="neutral" size="s" onClick={() => reset()}>
              Start over
            </VuiButtonSecondary>
          </>
        )}
      </div>

      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <OptionsDrawer isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />
    </>
  );
};
