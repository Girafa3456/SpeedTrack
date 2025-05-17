import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getWorksOn } from '../../services/api.ts';
import { WorksOn } from '../../interfaces/types';

const WorksOnList: React.FC = () => {
  const [worksOn, setWorksOn] = useState<WorksOn[]>([]);

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
            <TableCell>Specialty</TableCell>
            <TableCell>Car Number</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {worksOn.map((work) => (
            <TableRow key={`${work.mechanic_id}-${work.car_number}`}>
              <TableCell>{work.mechanic_name}</TableCell>
              <TableCell>{work.car_number}</TableCell>
              <TableCell>{work.team_name}</TableCell>
              <TableCell>{new Date(work.idate).toLocaleDateString()}</TableCell>
              <TableCell>{work.edate ? new Date(work.edate).toLocaleDateString() : 'Present'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WorksOnList;