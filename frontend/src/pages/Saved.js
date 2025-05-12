import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Pagination } from '@mui/material';
import CompanyCard from '../components/CompanyCard';
import { companyService } from '../services/apiService';
import { bookmarkService } from '../services/apiService';

const Saved = () => {
  const [records, setRecords] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [fetchingSummaries, setFetchingSummaries] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0
  });
  
  useEffect(() => {
    handleLoadData();
  }, []);



  const handleLoadData = async () => {
    try {
      const { results, totalCount } = await bookmarkService.getBookmarks(pagination.page, pagination.pageSize);
      setRecords(results);
      setPagination(prev => ({
        ...prev,
        totalItems: totalCount
      }));
    } catch (error) {
      console.error('Load failed:', error.message);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
      handleLoadData();
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

  const handleSaveDeleteBookmark = async (companyId, isBookmark) => {
    if (!companyId) return;

    try {
      if (isBookmark) {
        await bookmarkService.deleteBookmark(companyId);
        setRecords(prev => prev.filter(company => company.id !== companyId));
      }
    } catch (error) {
      console.error('Failed to save bookmark:', error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Saved Companies</Typography>
      <Box sx={{width: '100%', p: 0, mt: 4 }}>
          {/* cardview components */}
          <Grid container spacing={3} columns={12}>
            {records.map((company) => (
          <Grid item key={company.id} size={{ xs: 12, md: 4 }}> 
            {/* smaller screens 1 card per row, 3 for big */}
                <CompanyCard
                  company={company}
                  expanded={expandedCards[company.id]}
                  onExpand={() => handleExpandClick(company.id)}
                  onGetSummary={handleGetSummary}
                  onSaveBookmark={handleSaveDeleteBookmark}
                  isBookmark={true}
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
  );
};

export default Saved;