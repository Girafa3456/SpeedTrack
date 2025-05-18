import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getWorksOn } from '../../services/api.ts';
import { WorksOn } from '../../interfaces/types';

interface WorksOnWithDetails extends WorksOn {
  mechanic_name: string;
}

const WorksOnList: React.FC = () => {
  const [worksOn, setWorksOn] = useState<WorksOnWithDetails[]>([]);

  useEffect(() => {
    const fetchWorksOn = async () => {
      try {
        const data = await getWorksOn();
        setWorksOn(data);
      } catch (error) {
        console.error('Error fetching works_on:', error);
      }
    };

    fetchWorksOn();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mechanic</TableCell>
            <TableCell>Car Number</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {worksOn.map((work) => (
            <TableRow key={`${work.mechanic_id}-${work.car_id}`}>
              <TableCell>{work.mechanic_name}</TableCell>
              <TableCell>{work.car_id}</TableCell>
              <TableCell>{work.idate}</TableCell>
              <TableCell>{work.edate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WorksOnList;