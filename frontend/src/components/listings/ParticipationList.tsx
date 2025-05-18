import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getParticipations } from '../../services/api.ts';
import { Participation } from '../../interfaces/types';


interface ParticipationWithDetails extends Participation {
  driver_name: string;
  team_name: string;
  car_number: number;
  race_circuit: string;
}

const ParticipationList: React.FC = () => {
  const [participations, setParticipations] = useState<ParticipationWithDetails[]>([]);

  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        const data = await getParticipations();
        setParticipations(data);
      } catch (error) {
        console.error('Error fetching participations:', error);
      }
    };

    fetchParticipations();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Driver</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Car Number</TableCell>
            <TableCell>Race</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participations.map((participation) => (
            <TableRow key={`${participation.driver_id}-${participation.race_id}-${participation.car_id}`}>
              <TableCell>{participation.driver_name}</TableCell>
              <TableCell>{participation.team_name}</TableCell>
              <TableCell>{participation.car_number}</TableCell>
              <TableCell>{participation.race_circuit}</TableCell>
              <TableCell>{participation.final_position || '-'}</TableCell>
              <TableCell>{participation.points_earned}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ParticipationList;