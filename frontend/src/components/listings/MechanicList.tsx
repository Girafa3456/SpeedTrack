import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getMechanics } from '../../services/api.ts';
import { Mechanic } from '../../interfaces/types';


interface MechanicWithDetails extends Mechanic {
  person_name: string;
  team_name: string;
}

const MechanicList: React.FC = () => {
  const [mechanics, setMechanics] = useState<MechanicWithDetails[]>([]);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const data = await getMechanics();
        setMechanics(data);
      } catch (error) {
        console.error('Error fetching mechanics:', error);
      }
    };

    fetchMechanics();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Experience (years)</TableCell>
            <TableCell>Team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mechanics.map((mechanic) => (
            <TableRow key={mechanic.mechanic_id}>
              <TableCell>{mechanic.mechanic_id}</TableCell>
              <TableCell>{mechanic.person_name}</TableCell>
              <TableCell>{mechanic.specialty}</TableCell>
              <TableCell>{mechanic.experience}</TableCell>
              <TableCell>{mechanic.team_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MechanicList;