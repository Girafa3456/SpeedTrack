import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getRaces } from '../../services/api.ts';
import { Race } from '../../interfaces/types';


interface RaceWithDetails extends Race {
  participation_count: number;
}

const RaceList: React.FC = () => {
  const [races, setRaces] = useState<RaceWithDetails[]>([]);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const data = await getRaces();
        setRaces(data);
      } catch (error) {
        console.error('Error fetching races:', error);
      }
    };

    fetchRaces();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Circuit</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Weather</TableCell>
            <TableCell>Participants</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {races.map((race) => (
            <TableRow key={race.race_id}>
              <TableCell>{race.race_id}</TableCell>
              <TableCell>{race.circuit}</TableCell>
              <TableCell>{race.date}</TableCell>
              <TableCell>{race.track}</TableCell>
              <TableCell>{race.weather_conditions}</TableCell>
              <TableCell>{race.participation_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RaceList;