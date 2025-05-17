import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import logo from '../photos/logo.png'; // Import the logo

const Header: React.FC = () => {
  return (
    <AppBar position="static" 
      sx={{ 
        color: 'black',
        backgroundColor: '#1976d2', 
        background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(144, 205, 255) 100%)'
          }}>
      <Toolbar>
        {/* Logo */}
        <Box
          component="img"
          src={logo}
          alt="SpeedTrack Logo"
          sx={{
                height: 40,
                marginRight: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
        />
        {/* Title */}
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            fontFamily: '"Arial", sans-serif',
            color: ""
          }}
        >
          SpeedTrack F1 Management System
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;