import React, { useState, useRef } from 'react';
import { Box, Grid, Pagination, Select, MenuItem } from '@mui/material';
import Search from '../components/Search';
import CompanyCard from '../components/CompanyCard';
import FilterSideBarComponent from '../components/FilterSideBarComponent';
import { companyService } from '../services/apiService';
import { bookmarkService } from '../services/apiService';
import { useQuery } from '../contexts/QueryContext';

const Query = () => {
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('simple_search');
  const { records, setRecords, totalCount, setTotalCount } = useQuery();
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [fetchingSummaries, setFetchingSummaries] = useState({});
  const [bookmarkedRecords, setBookmarkedRecords] = useState({});
  const filterRef = useRef();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: totalCount
  });

  // autocomplete funcs
  const getAutoCompleteSuggestions = async (text) => {
    try {
      if (!text) return [];
      if (searchType != 'simple_search') return []
      const suggestions = await companyService.getAutocomplete(text) || [];
      return suggestions;
    } catch (error) {
      console.error('Search failed:', error.message);
      return []
    }
  };

  // search funcs
  // handle generic search, filtering
  const handleSearch = async () => {
    setLoading(true);
    try {
      const filterUrl = filterRef?.current ? filterRef.current.getFilterUrl() : '';
      const queryParams = new URLSearchParams({
          search: searchText,
          page: pagination.page.toString(),
          pageSize: pagination.pageSize.toString()
      });
      let fullUrl = queryParams.toString();
      if (filterUrl) {
        fullUrl += `&${filterUrl}`;
      }
      const { results, totalCount: newTotalCount } = await companyService.search(fullUrl, searchType);

      setRecords(results);
      setTotalCount(newTotalCount);
      setPagination(prev => ({
        ...prev,
        totalItems: newTotalCount
      }));
    } catch (error) {
      console.error('Search failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // directly get the record by id
  const handleSearchById = async (id) => {
    setLoading(true);
    try {
      if (!id) return;

      const result = await companyService.getById(id);
      if (!result) return;
      
      setRecords([result]);
      setTotalCount(1);
      setPagination(prev => ({
        ...prev,
        totalItems: 1
      }));
    } catch (error) {
      console.error('Search failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // triggered from search autocomplete selection
  const handleSelectSuggestion = (suggestion_id) => {
    handleSearchById(suggestion_id);
  };

  // pagination view during search
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    if (searchText) {
      handleSearch();
    }
  };

  // cardview funcs
  // expand/collapse cardview
  const handleSaveDeleteBookmark = async (companyId, isBookmark) => {
    if (!companyId) return;

    try {
      if (isBookmark) {
        await bookmarkService.deleteBookmark(companyId);
      } else {
        await bookmarkService.saveBookmark(companyId);
      }
      setBookmarkedRecords(prev => ({
        ...prev,
        [companyId]: !isBookmark
      }));
    } catch (error) {
      console.error('Failed to save bookmark:', error.message);
    } finally {
      
    }
  };

  const handleExpandClick = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // fetch summary for companies, service might have retries
  const handleGetSummary = async (companyId) => {
    setFetchingSummaries(prev => ({ ...prev, [companyId]: true }));
    try {
      const summary = await companyService.getSummary(companyId);
      setRecords(prev =>
        prev.map(company =>
          company.id === companyId
            ? { ...company, summary }
            : company
        )
      );
    } catch (error) {
      console.error('Failed to fetch summary:', error.message);
    } finally {
      setFetchingSummaries(prev => ({ ...prev, [companyId]: false }));
    }
  };


  return (
    <Box>

      {/* Searchcomponent + search type dropdown */}
      <Box sx={{ display: 'flex', gap: 2, mb: 0, alignItems: 'center', width: '100%', flexGrow: 1 }}>
        <Select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          sx={{ width: '25%', p: 0 }}
        >
          <MenuItem value="simple_search">Simple Filtering</MenuItem>
          <MenuItem value="open_text_search">Open Text Filtering</MenuItem>
          <MenuItem value="advanced_text_search">Advanced Search</MenuItem>
        </Select>

        <Search
          sx={{width: '75%'}}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onSearch={handleSearch}
          onSelectSuggestion={handleSelectSuggestion}
          getAutoCompleteSuggestions={getAutoCompleteSuggestions}
          minCharsForSuggestions={3}
          placeholder="Search companies..."
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, width: '100%', flexGrow: 1, gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '20%' }, p: 0, mt: 4 }}>
          <FilterSideBarComponent ref={filterRef} />
        </Box>

        <Box sx={{width: { xs: '100%', sm: '75%' }, p: 0, mt: 4 }}>
          {/* cardview components */}
          <Grid container spacing={3} columns={12}>
            {records.map((company) => (
          <Grid item key={company.id} size={{ xs: 12, md: 6 }}> 
            {/* smaller screens 1 card per row,2 for big */}
                <CompanyCard
                  company={company}
                  expanded={expandedCards[company.id]}
                  onExpand={() => handleExpandClick(company.id)}
                  onGetSummary={handleGetSummary}
                  onSaveBookmark={handleSaveDeleteBookmark}
                  isBookmark={bookmarkedRecords[company.id]}
                  fetchingSummary={fetchingSummaries[company.id]}
                  showSummaryButton={company.website || company.linkedin_url}
                />
              </Grid>
            ))}
          </Grid>

          {pagination.totalItems > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(pagination.totalItems / pagination.pageSize)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Query;