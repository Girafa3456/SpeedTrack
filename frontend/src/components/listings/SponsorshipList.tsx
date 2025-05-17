import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSponsorships } from '../../services/api.ts';
import { Sponsorship } from '../../interfaces/types';

const SponsorshipList: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);

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
            <TableRow key={`${sponsorship.sponsor_id}-${sponsorship.team_name}`}>
              <TableCell>{sponsorship.sponsor_name}</TableCell>
              <TableCell>{sponsorship.team_name}</TableCell>
              <TableCell>{new Date(sponsorship.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{sponsorship.end_date ? new Date(sponsorship.end_date).toLocaleDateString() : 'Ongoing'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SponsorshipList;