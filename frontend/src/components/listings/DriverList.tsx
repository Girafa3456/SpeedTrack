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
import { getDrivers, createPerson, createDriver, getPersons, getTeams } from '../../services/api.ts';
import { Driver, Person, Team } from '../../interfaces/types';
import { Add } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';

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

  const handleCreateDriver = async () => {
    try {
      await createDriver({
        ...newDriver,
        driver_id: newDriver.driver_id || 0,
        total_points: newDriver.total_points || 0,
        wins: newDriver.wins || 0,
        pole_positions: newDriver.pole_positions || 0,
      });
      const driversData = await getDrivers();
      setDrivers(driversData);
      handleCloseDriverDialog();
      setNewDriver({
        total_points: 0,
        wins: 0,
        pole_positions: 0,
        nif: '',
        team_id: 0
      });
    } catch (error) {
      console.error('Error creating driver:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenPersonDialog}
        >
          Add Person
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
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
              label="Birth Date (YYYY-MM-DD)"
              name="birth_date"
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

      {/* Add Driver Dialog */}
      <Dialog open={openDriverDialog} onClose={handleCloseDriverDialog}>
        <DialogTitle>Add New Driver</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                name="nif"
                value={newDriver.nif}
                onChange={handleDriverInputChange}
                label="Person"
                required
              >
                {persons.map((person) => (
                  <MenuItem key={person.nif} value={person.nif}>
                    {person.name} (NIF: {person.nif})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                name="team_id"
                value={newDriver.team_id}
                onChange={handleDriverInputChange}
                label="Team"
                required
              >
                {teams.map((team) => (
                  <MenuItem key={team.team_id} value={team.team_id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Driver ID"
              name="driver_id"
              type="number"
              value={newDriver.driver_id || ''}
              onChange={handleDriverInputChange}
              fullWidth
              required
            />
            <TextField
              label="Total Points"
              name="total_points"
              type="number"
              value={newDriver.total_points}
              onChange={handleDriverInputChange}
              fullWidth
            />
            <TextField
              label="Wins"
              name="wins"
              type="number"
              value={newDriver.wins}
              onChange={handleDriverInputChange}
              fullWidth
            />
            <TextField
              label="Pole Positions"
              name="pole_positions"
              type="number"
              value={newDriver.pole_positions}
              onChange={handleDriverInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDriverDialog}>Cancel</Button>
          <Button onClick={handleCreateDriver} color="secondary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverList;