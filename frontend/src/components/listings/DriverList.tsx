import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getDrivers } from '../../services/api.ts';
import { Driver } from '../../interfaces/types';

const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Wins</TableCell>
            <TableCell>Pole Positions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.driver_id}>
              <TableCell>{driver.driver_id}</TableCell>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.team}</TableCell>
              <TableCell>{driver.total_points}</TableCell>
              <TableCell>{driver.wins}</TableCell>
              <TableCell>{driver.pole_positions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DriverList;