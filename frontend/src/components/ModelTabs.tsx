import React from 'react';
import PersonDropdown from './PersonDropdown.tsx';
import RelationsDropdown from './RelationsDropdown.tsx';
import { Tabs, Tab, Box } from '@mui/material';
import {
  Groups as TeamsIcon,
  DirectionsCar as CarsIcon,
  Flag as RacesIcon
} from '@mui/icons-material';

interface ModelTabsProps {
  value: string;
  onChange: (newValue: string) => void;
}

const ModelTabs: React.FC<ModelTabsProps> = ({ value, onChange }) => {
  const handlePersonSelect = (type: string) => {
    onChange(type);
  };

  const handleRelationsSelect = (type: string) => {
    onChange(type);
  };

  // Custom Tab component with proper icon typing
  const CustomTab = ({ 
    label, 
    tabValue, 
    icon 
  }: { 
    label: string; 
    tabValue: string; 
    icon: React.ReactElement<{ sx?: object }> 
  }) => (
    <Tab 
      iconPosition="start"
      label={label}
      value={tabValue}
      onClick={() => onChange(tabValue)}
      sx={{
        textTransform: 'none',
        fontWeight: value === tabValue ? 'bold' : 'normal',
        color: value === tabValue ? 'primary.main' : 'text.primary',
        borderBottom: value === tabValue ? '2px solid' : 'none',
        borderColor: 'primary.main',
        minHeight: '48px',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '& .MuiTab-iconWrapper': {
          marginRight: '8px',
        }
      }}
      icon={React.cloneElement(icon, {
        sx: {
          fontSize: '1rem',
          color: value === tabValue ? 'primary.main' : 'inherit'
        }
      })}
    />
  );

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={false}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        <CustomTab label="Teams" tabValue="team" icon={<TeamsIcon />} />
        <CustomTab label="Cars" tabValue="car" icon={<CarsIcon />} />
        <CustomTab label="Races" tabValue="race" icon={<RacesIcon />} />
        <PersonDropdown onSelect={handlePersonSelect} value={value} />
        <RelationsDropdown onSelect={handleRelationsSelect} value={value} />
      </Tabs>
    </Box>
  );
};

export default ModelTabs;