import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getBelongs } from '../../services/api.ts';
import { Belongs } from '../../interfaces/types';


interface BelongsWithDetails extends Belongs {
  driver_name: string;
  car_number: number;
  team_name: string;
}

const BelongsList: React.FC = () => {
  const [belongs, setBelongs] = useState<BelongsWithDetails[]>([]);

  useEffect(() => {
    const fetchBelongs = async () => {
      try {
        const data = await getBelongs();
        setBelongs(data);
      } catch (error) {
        console.error('Error fetching belongs:', error);
      }
    };

    fetchBelongs();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Driver</TableCell>
            <TableCell>Car Number</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {belongs.map((belong) => (
            <TableRow key={`${belong.driver_id}-${belong.car_id}-${belong.team_id}`}>
              <TableCell>{belong.driver_name}</TableCell>
              <TableCell>{belong.car_number}</TableCell>
              <TableCell>{belong.team_name}</TableCell>
              <TableCell>{belong.start_date}</TableCell>
              <TableCell>{belong.end_date ? new Date(belong.end_date).toLocaleDateString() : 'Current'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BelongsList;