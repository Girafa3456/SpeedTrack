import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    axios.get('/api/drivers')
      .then(response => setDrivers(response.data))
      .catch(error => console.error('Error fetching drivers:', error));
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Wins</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map(driver => (
            <TableRow key={driver.driver_id}>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.team}</TableCell>
              <TableCell>{driver.total_points}</TableCell>
              <TableCell>{driver.wins}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}