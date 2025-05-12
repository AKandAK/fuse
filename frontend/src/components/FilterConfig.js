// for each filter field show filtername, filteroperators, take_input_in_diff_ways, using the config file
// all these filters should be one one below another
// ex: for size filter, name : Size, show operators [gte, lte, =], users should click on any operator.,
// since options are given for size filter, show options in dropdown selection with support for searching menu values.
// if options are not given for a field, add a textfield for it, in which user can input a text

import {publicApiService} from '../services/apiService'

const localFiltersConfig = {
  size: {
    type: "string",
    operators: ["eq"],
    options: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+"]
  },
  founded: {
    type: "number",
    operators: ["gte", "lte", "eq"]
  },
  country: {
    type: "string",
    operators: ["eq", "ne"],
    // options: ['India', 'UK', 'US'] // for all options fields, they go into dropdown with searchable textfield to filter options
  },
  locality: {
    type: "string",
    operators: ["eq", "ne"] // no optyions means take filtering by input text
  },
  industry: {
    type: "string",
    operators: ["eq"],
    // options: ["Software", "Finance", "Healthcare", "Education", "E-commerce", "Manufacturing"]
  }
};

let filtersInitialized = false;

async function initFilters() {
  // call backend filters only once
  if (filtersInitialized) {
    return activeFiltersConfig;
  }
  filtersInitialized = true

  try {
    const response = await publicApiService.getFilterConfig();
    if (response && response.filters) {
      activeFiltersConfig = response.filters;
    } else {
      console.warn('API returned unexpected data format. Falling back to local config.');
      activeFiltersConfig = localFiltersConfig;
    }
  } catch (error) {
    console.error('Error fetching filters from API, falling back to local config:', error);
    activeFiltersConfig = localFiltersConfig
  }

  return activeFiltersConfig;
}

let activeFiltersConfig = localFiltersConfig;
export function getFiltersConfig() {
  if (!filtersInitialized) {
    // background fetch from apis
    initFilters().catch(() => {}); 
  }
  return activeFiltersConfig;
}