import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getTeams } from '../../services/api.ts';
import { Team } from '../../interfaces/types';

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Budget</TableCell>
            <TableCell>Drivers</TableCell>
            <TableCell>Sponsors</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.team_id}>
              <TableCell>{team.team_id}</TableCell>
              <TableCell>{team.name}</TableCell>
              <TableCell>${team.budget.toLocaleString()}</TableCell>
              <TableCell>{team.driver_count}</TableCell>
              <TableCell>{team.sponsor_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamList;