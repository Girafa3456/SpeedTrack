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
  FormControl,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getMechanics, createPerson, createMechanic, updateMechanic, deleteMechanic, getPersons, getTeams } from '../../services/api.ts';
import { Mechanic, Person, Team } from '../../interfaces/types';
import { SelectChangeEvent } from '@mui/material';

interface MechanicWithDetails extends Mechanic {
  person_name: string;
  team_name: string;
  works_on?: {  
    idate: string;
    edate: string;
    car_id: number;
  };
}

const MechanicList: React.FC = () => {
  const [mechanics, setMechanics] = useState<MechanicWithDetails[]>([]);
  const [openPersonDialog, setOpenPersonDialog] = useState(false);
  const [openMechanicDialog, setOpenMechanicDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMechanic, setCurrentMechanic] = useState({
    mechanic_id: 0,
    specialty: '',
    experience: 0,
    nif: '',
    team_id: 0,
    edate: ''
  });

  const [newPerson, setNewPerson] = useState<Person>({
    nif: '',
    name: '',
    birth_date: '',
    nationality: ''
  });

  const [newMechanic, setNewMechanic] = useState<Omit<Mechanic, 'mechanic_id'> & { 
    mechanic_id?: number,
    edate: string 
  }>({
    mechanic_id: undefined,
    specialty: '',
    experience: 0,
    nif: '',
    team_id: 0,
    edate: ''
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

  const handleOpenPersonDialog = () => setOpenPersonDialog(true);
  const handleClosePersonDialog = () => setOpenPersonDialog(false);
  const handleOpenMechanicDialog = () => setOpenMechanicDialog(true);
  const handleCloseMechanicDialog = () => {
    setOpenMechanicDialog(false);
    setIsEdit(false);
    setCurrentMechanic({ 
      mechanic_id: 0, 
      specialty: '', 
      experience: 0, 
      nif: '', 
      team_id: 0,
      edate: ''
    });
  };

  const handleOpenEditDialog = (mechanic: MechanicWithDetails) => {
    setIsEdit(true);
    setCurrentMechanic({
      mechanic_id: mechanic.mechanic_id,
      specialty: mechanic.specialty,
      experience: mechanic.experience,
      nif: mechanic.nif,
      team_id: mechanic.team_id,
      edate: mechanic.works_on?.edate || '' 
    });
    setOpenMechanicDialog(true);
  };

  const handlePersonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({ ...prev, [name]: value }));
  };

  const handleMechanicInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const name = e.target.name as keyof typeof newMechanic;
    const value = e.target.value;
    setNewMechanic(prev => ({
      ...prev,
      [name]: ['team_id', 'experience', 'mechanic_id'].includes(name) ? Number(value) : value
    }));
  };

  const handleCurrentMechanicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setCurrentMechanic(prev => ({
      ...prev,
      [name]: ['team_id', 'experience'].includes(name) ? Number(value) : value
    }));
  };

  const handleCreatePerson = async () => {
    try {
      await createPerson(newPerson);
      const personsData = await getPersons();
      setPersons(personsData);
      setOpenPersonDialog(false);
      setNewPerson({ nif: '', name: '', birth_date: '', nationality: '' });
    } catch (error) {
      console.error('Error creating person:', error);
    }
  };

  const handleCreateMechanic = async () => {
    try {
      const { edate, ...mechanicData } = newMechanic;
      await createMechanic({ 
        ...mechanicData, 
        mechanic_id: newMechanic.mechanic_id || 0
      });
      const mechanicsData = await getMechanics();
      setMechanics(mechanicsData);
      setOpenMechanicDialog(false);
      setNewMechanic({ 
        mechanic_id: undefined,
        specialty: '', 
        experience: 0, 
        nif: '', 
        team_id: 0,
        edate: ''
      });
    } catch (error) {
      console.error('Error creating mechanic:', error);
    }
  };

  const handleSaveMechanic = async () => {
    try {
      await updateMechanic(currentMechanic.mechanic_id, {
        specialty: currentMechanic.specialty,
        experience: currentMechanic.experience,
        nif: currentMechanic.nif,
        team_id: currentMechanic.team_id
      });
      const mechanicsData = await getMechanics();
      setMechanics(mechanicsData);
      handleCloseMechanicDialog();
    } catch (error) {
      console.error('Error updating mechanic:', error);
    }
  };

  
  const handleDeleteMechanic = async (mechanicId: number) => {
    try {
      await deleteMechanic(mechanicId);
      setMechanics(prev => prev.filter(m => m.mechanic_id !== mechanicId));
    } catch (error) {
      console.error('Error deleting mechanic:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenPersonDialog}>
          Add Person
        </Button>
        <Button variant="contained" color="secondary" startIcon={<Add />} onClick={handleOpenMechanicDialog}>
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
              <TableCell>Actions</TableCell>
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
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenEditDialog(mechanic)} sx={{ mr: 1 }}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteMechanic(mechanic.mechanic_id)}>
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
            <TextField label="NIF" name="nif" value={newPerson.nif} onChange={handlePersonInputChange} fullWidth required />
            <TextField label="Name" name="name" value={newPerson.name} onChange={handlePersonInputChange} fullWidth required />
            <TextField label="Birth Date" name="birth_date" type="date" InputLabelProps={{ shrink: true }} value={newPerson.birth_date} onChange={handlePersonInputChange} fullWidth required/>
            <TextField label="Nationality" name="nationality" value={newPerson.nationality} onChange={handlePersonInputChange} fullWidth required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePersonDialog}>Cancel</Button>
          <Button onClick={handleCreatePerson} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Mechanic Dialog */}
      <Dialog open={openMechanicDialog} onClose={handleCloseMechanicDialog}>
        <DialogTitle>{isEdit ? 'Edit Mechanic' : 'Add New Mechanic'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                name="nif"
                value={isEdit ? currentMechanic.nif : newMechanic.nif}
                onChange={isEdit ? handleCurrentMechanicChange : handleMechanicInputChange}
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
                value={isEdit ? currentMechanic.team_id : newMechanic.team_id}
                onChange={isEdit ? handleCurrentMechanicChange : handleMechanicInputChange}
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

            {!isEdit && (
              <TextField
                label="Mechanic ID"
                name="mechanic_id"
                type="number"
                value={newMechanic.mechanic_id || ''}
                onChange={handleMechanicInputChange}
                fullWidth
                required
              />
            )}

            <TextField
              label="Specialty"
              name="specialty"
              value={isEdit ? currentMechanic.specialty : newMechanic.specialty}
              onChange={isEdit ? handleCurrentMechanicChange : handleMechanicInputChange}
              fullWidth
              required
            />

            <TextField
              label="Experience (years)"
              name="experience"
              type="number"
              value={isEdit ? currentMechanic.experience : newMechanic.experience}
              onChange={isEdit ? handleCurrentMechanicChange : handleMechanicInputChange}
              fullWidth
              required
            />

            <TextField
              label="End Date"
              name="edate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={isEdit ? currentMechanic.edate : newMechanic.edate}
              onChange={isEdit ? handleCurrentMechanicChange : handleMechanicInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMechanicDialog}>Cancel</Button>
          <Button onClick={isEdit ? handleSaveMechanic : handleCreateMechanic} color="secondary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MechanicList;
