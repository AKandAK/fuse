import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  MenuItem,
  MenuList
} from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const Search = ({
  searchText,
  setSearchText,
  loading,
  onSearch,
  onSelectSuggestion,
  getAutoCompleteSuggestions = null,
  placeholder = "Search...",
  minCharsForSuggestions = 2,
  debounceMs = 300
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (
      searchText.length > minCharsForSuggestions &&
      getAutoCompleteSuggestions &&
      !suppressSuggestions &&
      isInputFocused
    ) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchText);
      }, debounceMs);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchText, debounceMs, isInputFocused]);
  

  const fetchSuggestions = async (text) => {
    if (!text || !isInputFocused) return;
    setSuggestionsLoading(true);
    try {
      const results = await getAutoCompleteSuggestions(text);
      if (isInputFocused) {
        setSuggestions(results || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Autocomplete failed:', error.message);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSuppressSuggestions(true);
    setSearchText(suggestion.name);
    setShowSuggestions(false);
    setIsInputFocused(false);
    onSelectSuggestion(suggestion.id);
    setTimeout(() => setSuppressSuggestions(false), 500);
  };
  

  const handleClickAway = () => {
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'center' }}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <TextField
            sx={{ borderRadius: 4 }}
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onFocus={() => {
              setIsInputFocused(true);
              if (searchText.length > minCharsForSuggestions) {
                setShowSuggestions(true);
              }
            }}
            slotProps={{
              endAdornment: loading ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null
            }}
          />
        </ClickAwayListener>
          <Button
            variant="contained"
            onClick={onSearch}
            disabled={loading}
            sx={{ borderRadius: 4 }}
          >
            Search
          </Button>
        </Box>
        {showSuggestions && isInputFocused && getAutoCompleteSuggestions && (
          <Paper
            sx={{
              position: 'absolute',
              width: '100%',
              zIndex: 1,
              mt: 1,
              maxHeight: 300,
              overflow: 'auto'
            }}
          >
            <MenuList>
              {suggestionsLoading ? (
                <MenuItem>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                suggestions.map((suggestion, index) => (
                  <MenuItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion.name}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Paper>
        )}
      </Box>
  );
};

export default Search;
