import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getCars } from '../../services/api.ts';
import { Car } from '../../interfaces/types';


interface CarWithDetails extends Car {
  team_name: string;
  driver_name: string;
}

const CarList: React.FC = () => {
  const [cars, setCars] = useState<CarWithDetails[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchCars();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Chassis Model</TableCell>
            <TableCell>Engine Type</TableCell>
            <TableCell>Weight (kg)</TableCell>
            <TableCell>Manufacture Date</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Driver</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cars.map((car) => (
            <TableRow key={car.car_id}>
              <TableCell>{car.car_id}</TableCell>
              <TableCell>{car.number}</TableCell>
              <TableCell>{car.chassis_model}</TableCell>
              <TableCell>{car.engine_type}</TableCell>
              <TableCell>{car.weight}</TableCell>
              <TableCell>{car.manufacture_date}</TableCell>
              <TableCell>{car.team_name}</TableCell>
              <TableCell>{car.driver_name || 'Unassigned'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CarList;