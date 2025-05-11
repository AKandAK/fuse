import React from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Container } from '@mui/material';
import Settings from './Settings';
import Query from './Query';
import Saved from './Saved';

const HomeLayout = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const routes = ['query', 'saved', 'settings'];
    navigate(routes[newValue]);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs centered variant='fullWidth' value={value} onChange={handleChange}>
          <Tab label="Query" />
          <Tab label="Saved" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      <Box sx={{ py: 3 }}>
        <Outlet />
      </Box>
    </Container>
  );
};

const Home = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route path="query" element={<Query />} />
        <Route path="saved" element={<Saved />} />
        <Route path="settings" element={<Settings />} />
        {/* default query route */}
        <Route index element={<Query />} /> 
      </Route>
    </Routes>
  );
};

export default Home;