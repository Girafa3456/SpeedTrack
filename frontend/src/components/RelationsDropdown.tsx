import React, { useState } from 'react';
import { Menu, MenuItem, Button } from '@mui/material';
import {
  Link as RelationsIcon,
  EmojiEvents as ParticipationIcon,
  Build as WorksOnIcon,
  Handshake as SponsorshipIcon,
  Groups as BelongsIcon
} from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface RelationsDropdownProps {
  onSelect: (type: string) => void;
  value: string;
}

const RelationsDropdown: React.FC<RelationsDropdownProps> = ({ onSelect, value }) => {
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

  const isActive = ['participation', 'works_on', 'sponsorship', 'belongs'].includes(value);

  return (
    <div>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<RelationsIcon />}
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
        Relations
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'relations-button',
        }}
      >
        <MenuItem 
          onClick={() => handleClose('participation')}
          selected={value === 'participation'}
        >
          <ParticipationIcon sx={{ mr: 1 }} /> Participations
        </MenuItem>
        <MenuItem 
          onClick={() => handleClose('works_on')}
          selected={value === 'works_on'}
        >
          <WorksOnIcon sx={{ mr: 1 }} /> Works On
        </MenuItem>
        <MenuItem 
          onClick={() => handleClose('sponsorship')}
          selected={value === 'sponsorship'}
        >
          <SponsorshipIcon sx={{ mr: 1 }} /> Sponsorships
        </MenuItem>
        <MenuItem 
          onClick={() => handleClose('belongs')}
          selected={value === 'belongs'}
        >
          <BelongsIcon sx={{ mr: 1 }} /> Belongs
        </MenuItem>
      </Menu>
    </div>
  );
};

export default RelationsDropdown;