import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import Drivers from './components/Drivers';
import Teams from './components/Teams';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SpeedTrack Racing
          </Typography>
          <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Drivers</Link>
          <Link to="/teams" style={{ color: 'white' }}>Teams</Link>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <Routes>
          <Route path="/" element={<Drivers />} />
          <Route path="/teams" element={<Teams />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;