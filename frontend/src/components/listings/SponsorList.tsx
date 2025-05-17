import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSponsors } from '../../services/api.ts';
import { Sponsor } from '../../interfaces/types';

const SponsorList: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const data = await getSponsors();
        setSponsors(data);
      } catch (error) {
        console.error('Error fetching sponsors:', error);
      }
    };

    fetchSponsors();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Contract Value</TableCell>
            <TableCell>Sector</TableCell>
            <TableCell>Team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sponsors.map((sponsor) => (
            <TableRow key={sponsor.sponsor_id}>
              <TableCell>{sponsor.sponsor_id}</TableCell>
              <TableCell>{sponsor.name}</TableCell>
              <TableCell>${sponsor.contract_value.toLocaleString()}</TableCell>
              <TableCell>{sponsor.sector}</TableCell>
              <TableCell>{sponsor.team_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SponsorList;