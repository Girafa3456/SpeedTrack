import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { getRaces, createRace, updateRace, deleteRace, getRaceByCircuit } from '../../services/api.ts';
import { Race } from '../../interfaces/types';

const RaceList: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRace, setCurrentRace] = useState<Partial<Race>>({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchData(); 
      return;
    }
    fetchByCircuit(searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const data = await getRaces();
      setRaces(data);
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  };

  const fetchByCircuit = async (circuit: string) => {
    try {
      const data = await getRaceByCircuit(circuit);
      setRaces(data);
    } catch (error) {
      console.error('Error fetching by circuit:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setIsEdit(false);
    setCurrentRace({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (race: Race) => {
    setIsEdit(true);
    setCurrentRace({
      ...race,
      date: race.date?.split('T')[0]
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentRace(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentRace.race_id || !currentRace.circuit || !currentRace.date || !currentRace.track || !currentRace.weather_conditions) {
        throw new Error('Required fields are missing');
      }

      if (isEdit) {
        await updateRace(currentRace.race_id, {
          circuit: currentRace.circuit,
          date: currentRace.date,
          track: currentRace.track,
          weather_conditions: currentRace.weather_conditions
        });
      } else {
        await createRace({
          race_id: currentRace.race_id as number,
          circuit: currentRace.circuit as string,
          date: currentRace.date as string,
          track: currentRace.track as string,
          weather_conditions: currentRace.weather_conditions as string
        });
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving race:', error);
    }
  };

  const handleDelete = async (raceId: number) => {
    try {
      await deleteRace(raceId);
      fetchData();
    } catch (error) {
      console.error('Error deleting race:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search by Circuit"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenAddDialog}>
          Add Race
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Circuit</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Weather</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {races.map((race) => (
              <TableRow key={race.race_id}>
                <TableCell>{race.race_id}</TableCell>
                <TableCell>{race.circuit}</TableCell>
                <TableCell>{race.date?.split('T')[0]}</TableCell>
                <TableCell>{race.track}</TableCell>
                <TableCell>{race.weather_conditions}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDialog(race)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(race.race_id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Race' : 'Add New Race'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {!isEdit && (
              <TextField
                name="race_id"
                label="Race ID"
                type="number"
                value={currentRace.race_id || ''}
                onChange={handleInputChange}
                fullWidth
              />
            )}
            <TextField
              name="circuit"
              label="Circuit"
              value={currentRace.circuit || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="date"
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={currentRace.date || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="track"
              label="Track"
              value={currentRace.track || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="weather_conditions"
              label="Weather Conditions"
              value={currentRace.weather_conditions || ''}
              onChange={handleInputChange}
              fullWidth
            />
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

export default RaceList;
