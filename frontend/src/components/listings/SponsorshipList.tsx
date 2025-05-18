import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSponsorships } from '../../services/api.ts';
import { Sponsorship } from '../../interfaces/types';

// Extended interface for sponsorships with joined data
interface SponsorshipWithDetails extends Sponsorship {
  sponsor_name: string;
  team_name: string;
}

const SponsorshipList: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<SponsorshipWithDetails[]>([]);

  useEffect(() => {
    const fetchSponsorships = async () => {
      try {
        const data = await getSponsorships();
        setSponsorships(data);
      } catch (error) {
        console.error('Error fetching sponsorships:', error);
      }
    };

    fetchSponsorships();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sponsor</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sponsorships.map((sponsorship) => (
            <TableRow key={`${sponsorship.sponsor_id}-${sponsorship.team_id}`}>
              <TableCell>{sponsorship.sponsor_name}</TableCell>
              <TableCell>{sponsorship.team_name}</TableCell>
              <TableCell>{sponsorship.start_date}</TableCell>
              <TableCell>{sponsorship.end_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SponsorshipList;