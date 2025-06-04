import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  getParticipations,
  getDrivers,
  getCars,
  getRaces,
  createParticipation,
  updateParticipation,
  deleteParticipation
} from '../../services/api.ts';
import { Participation, Driver, Car, Race } from '../../interfaces/types';

interface ParticipationWithDetails extends Participation {
  driver_name: string;
  team_name: string;
  car_number: number;
  race_circuit: string;
}

const ParticipationList: React.FC = () => {
  const [participations, setParticipations] = useState<ParticipationWithDetails[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [current, setCurrent] = useState<Partial<Participation>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, dData, cData, rData] = await Promise.all([
        getParticipations(),
        getDrivers(),
        getCars(),
        getRaces()
      ]);
      setParticipations(pData);
      setDrivers(dData);
      setCars(cData);
      setRaces(rData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrent(prev => ({
      ...prev,
      [name]:
        value === ''
          ? null
          : name === 'points_earned' || name === 'final_position'
          ? parseInt(value)
          : name.endsWith('_id')
          ? parseInt(value)
          : value
    }));
  };

  const handleOpenAddDialog = () => {
    setIsEdit(false);
    setCurrent({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (participation: ParticipationWithDetails) => {
    setIsEdit(true);
    setCurrent(participation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrent({});
  };

  const handleSubmit = async () => {
    try {
      const { driver_id, car_id, race_id, final_position, points_earned } = current;
      if (!driver_id || !car_id || !race_id) {
        throw new Error('All required fields must be filled.');
      }

      const participationData = {
        driver_id,
        car_id,
        race_id,
        final_position,
        points_earned
      };

      if (isEdit) {
        await updateParticipation(participationData);
      } else {
        await createParticipation(participationData);
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving participation:', error);
    }
  };

  const handleDelete = async (p: Participation) => {
    try {
      const { driver_id, car_id, race_id } = p;
      if (!driver_id || !car_id || !race_id) {
        throw new Error('Missing participation identifiers');
      }

      await deleteParticipation({ driver_id, car_id, race_id });
      fetchData();
    } catch (error) {
      console.error('Error deleting participation:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenAddDialog}>
          Add Participation
        </Button>
      </Box>

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participations.map((p) => (
              <TableRow key={`${p.driver_id}-${p.race_id}-${p.car_id}`}>
                <TableCell>{p.driver_name}</TableCell>
                <TableCell>{p.team_name}</TableCell>
                <TableCell>{p.car_number}</TableCell>
                <TableCell>{p.race_circuit}</TableCell>
                <TableCell>{p.final_position || '-'}</TableCell>
                <TableCell>{p.points_earned}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDialog(p)}><Edit color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(p)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEdit ? 'Edit Participation' : 'Add Participation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField select name="driver_id" label="Driver" value={current.driver_id || ''} onChange={handleInputChange} fullWidth>
              {drivers.map((d) => (
                <MenuItem key={d.driver_id} value={d.driver_id}>{d.driver_id} - {d.nif}</MenuItem>
              ))}
            </TextField>
            <TextField select name="car_id" label="Car" value={current.car_id || ''} onChange={handleInputChange} fullWidth>
              {cars.map((c) => (
                <MenuItem key={c.car_id} value={c.car_id}>{c.number}</MenuItem>
              ))}
            </TextField>
            <TextField select name="race_id" label="Race" value={current.race_id || ''} onChange={handleInputChange} fullWidth>
              {races.map((r) => (
                <MenuItem key={r.race_id} value={r.race_id}>{r.circuit}</MenuItem>
              ))}
            </TextField>
            <TextField name="final_position" label="Final Position" type="number" value={current.final_position ?? ''} onChange={handleInputChange} fullWidth />
            <TextField name="points_earned" label="Points" type="number" value={current.points_earned ?? ''} onChange={handleInputChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipationList;
