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
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { getDrivers, createPerson, createDriver, updateDriver, getPersons, getTeams, deleteDriver } from '../../services/api.ts';
import { Driver, Person, Team } from '../../interfaces/types';
import { Add, Edit, Delete } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import { IconButton } from '@mui/material';

interface DriverWithDetails extends Driver {
  person_name: string;
  team_name: string;
}

const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverWithDetails[]>([]);
  const [openPersonDialog, setOpenPersonDialog] = useState(false);
  const [openDriverDialog, setOpenDriverDialog] = useState(false);
  const [newPerson, setNewPerson] = useState<Person>({
    nif: '',
    name: '',
    birth_date: '',
    nationality: ''
  });
  const [newDriver, setNewDriver] = useState<Omit<Driver, 'driver_id'> & { driver_id?: number }>({
    driver_id: undefined,
    total_points: 0,
    wins: 0,
    pole_positions: 0,
    nif: '',
    team_id: 0
  });
  const [persons, setPersons] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Omit<Driver, 'driver_id'> & { driver_id: number }>({
    driver_id: 0,
    total_points: 0,
    wins: 0,
    pole_positions: 0,
    nif: '',
    team_id: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driversData = await getDrivers();
        setDrivers(driversData);
        
        const personsData = await getPersons();
        setPersons(personsData);
        
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleOpenPersonDialog = () => {
    setOpenPersonDialog(true);
  };

  const handleClosePersonDialog = () => {
    setOpenPersonDialog(false);
  };

  const handleOpenDriverDialog = () => {
    setOpenDriverDialog(true);
  };

  const handleCloseDriverDialog = () => {
    setOpenDriverDialog(false);
  };

  const handlePersonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const name = e.target.name as keyof typeof newDriver;
    const value = e.target.value;
    
    setNewDriver(prev => ({
      ...prev,
      [name]: name === 'team_id' || name === 'total_points' || name === 'wins' || name === 'pole_positions' 
        ? Number(value) 
        : value
    }));
  };

  const handleCreatePerson = async () => {
    try {
      await createPerson(newPerson);
      const personsData = await getPersons();
      setPersons(personsData);
      handleClosePersonDialog();
      setNewPerson({
        nif: '',
        name: '',
        birth_date: '',
        nationality: ''
      });
    } catch (error) {
      console.error('Error creating person:', error);
    }
  };

  const handleDeleteDriver = async (driverId: number) => {
    try {
      await deleteDriver(driverId);
      setDrivers((prev) => prev.filter((d) => d.driver_id !== driverId));
    } catch (error) {
      console.error('Error deleting driver: ', error);
    }
  };

  const handleOpenEditDriverDialog = (driver: DriverWithDetails) => {
    setIsEdit(true);
    setCurrentDriver(driver);
    setOpenDriverDialog(true);
  };

  const handleCurrentDriverChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>
  ) => {
    const { name, value } = e.target;
    setCurrentDriver((prev) => ({
      ...prev,
      [name]: name === 'team_id' || name === 'total_points' || name === 'wins' || name === 'pole_positions' 
        ? Number(value) 
        : value
    }));
  };

  const handleSaveDriver = async () => {
    try {
      if (isEdit) {
        await updateDriver(currentDriver.driver_id, currentDriver);
      } else {
        await createDriver({
          ...newDriver,
          driver_id: newDriver.driver_id || 0,
          total_points: newDriver.total_points || 0,
          wins: newDriver.wins || 0,
          pole_positions: newDriver.pole_positions || 0,
        });
      }

      const driversData = await getDrivers();
      setDrivers(driversData);
      setOpenDriverDialog(false);
      setIsEdit(false);
      setCurrentDriver({
        driver_id: 0,
        total_points: 0,
        wins: 0,
        pole_positions: 0,
        nif: '',
        team_id: 0
      });
      setNewDriver({
        driver_id: undefined,
        total_points: 0,
        wins: 0,
        pole_positions: 0,
        nif: '',
        team_id: 0
      });
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenPersonDialog}
        >
          Add Person
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<Add />}
          onClick={handleOpenDriverDialog}
        >
          Add Driver
        </Button>
      </Box>
      
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.driver_id}>
                <TableCell>{driver.driver_id}</TableCell>
                <TableCell>{driver.person_name}</TableCell>
                <TableCell>{driver.team_name}</TableCell>
                <TableCell>{driver.total_points}</TableCell>
                <TableCell>{driver.wins}</TableCell>
                <TableCell>{driver.pole_positions}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDriverDialog(driver)} sx={{ mr: 1}}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteDriver(driver.driver_id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Person Dialog */}
      <Dialog open={openPersonDialog} onClose={handleClosePersonDialog}>
        <DialogTitle>Add New Person</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="NIF"
              name="nif"
              value={newPerson.nif}
              onChange={handlePersonInputChange}
              fullWidth
              required
            />
            <TextField
              label="Name"
              name="name"
              value={newPerson.name}
              onChange={handlePersonInputChange}
              fullWidth
              required
            />
            <TextField
              label="Birth Date"
              name="birth_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newPerson.birth_date}
              onChange={handlePersonInputChange}
              fullWidth
              required
            />
            <TextField
              label="Nationality"
              name="nationality"
              value={newPerson.nationality}
              onChange={handlePersonInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePersonDialog}>Cancel</Button>
          <Button onClick={handleCreatePerson} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add or edit Driver Dialog */}
      <Dialog open={openDriverDialog} onClose={handleCloseDriverDialog}>
        <DialogTitle>{isEdit ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {!isEdit && (
              <TextField
                label="Driver ID"
                name="driver_id"
                type="number"
                value={newDriver.driver_id || ''}
                onChange={handleDriverInputChange}
                fullWidth
                required
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                name="nif"
                value={isEdit ? currentDriver.nif : newDriver.nif}
                onChange={isEdit ? handleCurrentDriverChange : handleDriverInputChange}
                label="Person"
              >
                {persons.map((person) => (
                  <MenuItem key={person.nif} value={person.nif}>
                    {person.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                name="team_id"
                value={isEdit ? currentDriver.team_id : newDriver.team_id}
                onChange={isEdit ? handleCurrentDriverChange : handleDriverInputChange}
                label="Team"
              >
                {teams.map((team) => (
                  <MenuItem key={team.team_id} value={team.team_id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Total Points"
              name="total_points"
              type="number"
              value={isEdit ? currentDriver.total_points : newDriver.total_points}
              onChange={isEdit ? handleCurrentDriverChange : handleDriverInputChange}
              fullWidth
            />
            <TextField
              label="Wins"
              name="wins"
              type="number"
              value={isEdit ? currentDriver.wins : newDriver.wins}
              onChange={isEdit ? handleCurrentDriverChange : handleDriverInputChange}
              fullWidth
            />
            <TextField
              label="Pole Positions"
              name="pole_positions"
              type="number"
              value={isEdit ? currentDriver.pole_positions : newDriver.pole_positions}
              onChange={isEdit ? handleCurrentDriverChange : handleDriverInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDriverDialog}>Cancel</Button>
          <Button onClick={handleSaveDriver} color="secondary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DriverList;