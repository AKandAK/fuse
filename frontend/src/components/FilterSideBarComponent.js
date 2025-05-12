import React, { useState, useEffect, useImperativeHandle } from 'react';
import { getFiltersConfig } from './FilterConfig';
import {
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  List,
  ListItem,
  Chip,
  Stack
} from '@mui/material';

const FilterSideBarComponent = React.forwardRef(({ onFilterChange }, ref) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [filterInputs, setFilterInputs] = useState({});
  const [filterOperators, setFilterOperators] = useState({});

  useEffect(() => {
    const initialInputs = {};
    const initialOperators = {};
    Object.keys(getFiltersConfig()).forEach(filterKey => {
      initialInputs[filterKey] = '';
      initialOperators[filterKey] = getFiltersConfig()[filterKey].operators[0];
    });
    setFilterInputs(initialInputs);
    setFilterOperators(initialOperators);
  }, []);

  // expose getfilerurl func to parent component
  useImperativeHandle(ref, () => ({
    getFilterUrl: () => {
      const activeFilterEntries = Object.entries(activeFilters).filter(([_, value]) => value !== '');
      if (activeFilterEntries.length === 0) return '';

      const filterParams = activeFilterEntries.map(([key, value]) => {
        const operator = filterOperators[key];
        if (operator === '=' || operator === "eq") return `${key}=${encodeURIComponent(value)}`;
        return `${key}[${operator}]=${encodeURIComponent(value)}`;
      });
      return filterParams.join('&');
    }
  }));

  const handleOperatorChange = (filterKey, operator) => {
    setFilterOperators(prev => ({
      ...prev,
      [filterKey]: operator
    }));
  };

  const handleInputChange = (filterKey, value) => {
    setFilterInputs(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleClearFilters = () => {
    const emptyInputs = {};
    const initialOperators = {};
    Object.keys(getFiltersConfig()).forEach(filterKey => {
      emptyInputs[filterKey] = '';
      initialOperators[filterKey] = getFiltersConfig()[filterKey].operators[0];
    });
    setFilterInputs(emptyInputs);
    setFilterOperators(initialOperators);
    setActiveFilters({});
    if (onFilterChange) onFilterChange();
  };

  const renderFilterInput = (filterKey, config) => {
    if (config.options) {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={filterInputs[filterKey]}
            onChange={(e) => handleInputChange(filterKey, e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select {filterKey}</em>
            </MenuItem>
            {config.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      // filter fields without options
      return (
        <TextField
          fullWidth
          size="small"
          value={filterInputs[filterKey]}
          onChange={(e) => handleInputChange(filterKey, e.target.value)}
          placeholder={`Enter ${filterKey}`}
          type={config.type === "number" ? "number" : "text"}
        />
      );
    }
  };

  return (
    <Box sx={{ width: '100%', border: 1, borderColor: 'lightgray' }}>
      <Stack direction="column" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" sx={{ mt: 1}}>
          Filters
        </Typography>
        <Button
          onClick={handleClearFilters}
          size="small"
          variant="outlined"
          sx={{ mt: 1}}
        >
          Clear All
        </Button>
      </Stack>

      <List>
        {Object.entries(getFiltersConfig()).map(([filterKey, config]) => (
          <ListItem key={filterKey} sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {filterKey.toLowerCase()}
            </Typography>
            
            {/* show the operators */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1, flexWrap: 'wrap' }}
            >
              {config.operators.map((operator) => (
                <Chip
                  key={operator}
                  label={operator}
                  onClick={() => handleOperatorChange(filterKey, operator)}
                  color={filterOperators[filterKey] === operator ? "primary" : "default"}
                  size="small"
                />
              ))}
            </Stack>


            {renderFilterInput(filterKey, config)}

            {activeFilters[filterKey] && (
              <Chip
                label={`${filterKey} ${filterOperators[filterKey]} ${activeFilters[filterKey]}`}
                onDelete={() => handleInputChange(filterKey, '')}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

export default FilterSideBarComponent;