import React, { useState } from 'react';
import { Menu, MenuItem, Button } from '@mui/material';
import {
  Person as PersonIcon,
  SportsMotorsports as DriverIcon,
  Paid as SponsorIcon,
  Engineering as MechanicIcon
} from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface PersonDropdownProps {
  onSelect: (type: string) => void;
  value: string;
}

const PersonDropdown: React.FC<PersonDropdownProps> = ({ onSelect, value }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (type: string = '') => {
    if (type) {
      onSelect(type);
    }
    setAnchorEl(null);
  };

  const isActive = ['driver', 'sponsor', 'mechanic'].includes(value);

  return (
    <div>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<PersonIcon />}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: isActive ? 'bold' : 'normal',
          color: isActive ? 'primary.main' : 'text.primary',
          borderBottom: isActive ? '2px solid' : 'none',
          borderColor: 'primary.main',
          borderRadius: 0,
          minHeight: '48px',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        Person
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'person-button',
        }}
      >
        <MenuItem 
          onClick={() => handleClose('driver')}
          selected={value === 'driver'}
        >
          <DriverIcon sx={{ mr: 1 }} /> Drivers
        </MenuItem>
        <MenuItem 
          onClick={() => handleClose('sponsor')}
          selected={value === 'sponsor'}
        >
          <SponsorIcon sx={{ mr: 1 }} /> Sponsors
        </MenuItem>
        <MenuItem 
          onClick={() => handleClose('mechanic')}
          selected={value === 'mechanic'}
        >
          <MechanicIcon sx={{ mr: 1 }} /> Mechanics
        </MenuItem>
      </Menu>
    </div>
  );
};

export default PersonDropdown;