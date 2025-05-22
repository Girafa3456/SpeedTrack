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
import { getMechanics, createPerson, createMechanic, getPersons, getTeams } from '../../services/api.ts';
import { Mechanic, Person, Team } from '../../interfaces/types';
import { Add } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';

interface MechanicWithDetails extends Mechanic {
  person_name: string;
  team_name: string;
}

const MechanicList: React.FC = () => {
  const [mechanics, setMechanics] = useState<MechanicWithDetails[]>([]);
  const [openPersonDialog, setOpenPersonDialog] = useState(false);
  const [openMechanicDialog, setOpenMechanicDialog] = useState(false);
  const [newPerson, setNewPerson] = useState<Person>({
    nif: '',
    name: '',
    birth_date: '',
    nationality: ''
  });
  const [newMechanic, setNewMechanic] = useState<Omit<Mechanic, 'mechanic_id'> & { mechanic_id?: number }>({
    mechanic_id: undefined,
    specialty: '',
    experience: 0,
    nif: '',
    team_id: 0
  });
  const [persons, setPersons] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mechanicsData = await getMechanics();
        setMechanics(mechanicsData);
        
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

  const handleOpenMechanicDialog = () => {
    setOpenMechanicDialog(true);
  };

  const handleCloseMechanicDialog = () => {
    setOpenMechanicDialog(false);
  };

  const handlePersonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMechanicInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const name = e.target.name as keyof typeof newMechanic;
    const value = e.target.value;
    
    setNewMechanic(prev => ({
      ...prev,
      [name]: name === 'team_id' || name === 'experience' || name === 'mechanic_id' 
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

  const handleCreateMechanic = async () => {
    try {
      await createMechanic({
        ...newMechanic,
        mechanic_id: newMechanic.mechanic_id || 0,
        experience: newMechanic.experience || 0,
      });
      const mechanicsData = await getMechanics();
      setMechanics(mechanicsData);
      handleCloseMechanicDialog();
      setNewMechanic({
        specialty: '',
        experience: 0,
        nif: '',
        team_id: 0
      });
    } catch (error) {
      console.error('Error creating mechanic:', error);
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
          onClick={handleOpenMechanicDialog}
        >
          Add Mechanic
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Specialty</TableCell>
              <TableCell>Experience (years)</TableCell>
              <TableCell>Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mechanics.map((mechanic) => (
              <TableRow key={mechanic.mechanic_id}>
                <TableCell>{mechanic.mechanic_id}</TableCell>
                <TableCell>{mechanic.person_name}</TableCell>
                <TableCell>{mechanic.specialty}</TableCell>
                <TableCell>{mechanic.experience}</TableCell>
                <TableCell>{mechanic.team_name}</TableCell>
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

      {/* Add Mechanic Dialog */}
      <Dialog open={openMechanicDialog} onClose={handleCloseMechanicDialog}>
        <DialogTitle>Add New Mechanic</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                name="nif"
                value={newMechanic.nif}
                onChange={handleMechanicInputChange}
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
                value={newMechanic.team_id}
                onChange={handleMechanicInputChange}
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
              label="Mechanic ID"
              name="mechanic_id"
              type="number"
              value={newMechanic.mechanic_id || ''}
              onChange={handleMechanicInputChange}
              fullWidth
              required
            />
            <TextField
              label="Specialty"
              name="specialty"
              value={newMechanic.specialty}
              onChange={handleMechanicInputChange}
              fullWidth
              required
            />
            <TextField
              label="Experience (years)"
              name="experience"
              type="number"
              value={newMechanic.experience}
              onChange={handleMechanicInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMechanicDialog}>Cancel</Button>
          <Button onClick={handleCreateMechanic} color="secondary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MechanicList;