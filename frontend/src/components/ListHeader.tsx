// components/ListHeader.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

interface ListHeaderProps {
  title: string;
  onAdd: () => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({ title, onAdd }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<Add />}
        onClick={onAdd}
        size="small"
      >
        Add
      </Button>
    </Box>
  );
};

export default ListHeader;