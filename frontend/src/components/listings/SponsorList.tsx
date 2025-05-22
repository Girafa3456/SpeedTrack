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
import { getSponsors, createPerson, createSponsor, getPersons, getTeams } from '../../services/api.ts';
import { Sponsor, Person, Team } from '../../interfaces/types';

interface SponsorWithDetails extends Sponsor {
  person_name: string;
  team_name: string;
}

const SponsorsList: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorWithDetails[]>([]);
  const [openPersonDialog, setOpenPersonDialog] = useState(false);
  const [openSponsorDialog, setOpenSponsorDialog] = useState(false);
  const [newPerson, setNewPerson] = useState<Person>({
    nif: '',
    name: '',
    birth_date: '',
    nationality: ''
  });
  const [newSponsor, setNewSponsor] = useState<{
    sponsor_id?: number;
    contract_value: number;
    sector: string;
    team_id: number;
    nif: string;
  }>({
    sponsor_id: undefined,
    contract_value: 0,
    sector: '',
    team_id: 0,
    nif: ''
  });
  const [persons, setPersons] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sponsorsData = await getSponsors();
        setSponsors(sponsorsData);
        
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

  // Person Dialog Handlers
  const handleOpenPersonDialog = () => setOpenPersonDialog(true);
  const handleClosePersonDialog = () => setOpenPersonDialog(false);

  // Sponsor Dialog Handlers
  const handleOpenSponsorDialog = () => setOpenSponsorDialog(true);
  const handleCloseSponsorDialog = () => setOpenSponsorDialog(false);

  // Input Change Handlers
  const handlePersonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({ ...prev, [name]: value }));
  };

  const handleSponsorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const name = e.target.name as keyof typeof newSponsor;
    const value = e.target.value;
    
    setNewSponsor(prev => ({
      ...prev,
      [name]: name === 'sponsor_id' || name === 'team_id' || name === 'contract_value' 
        ? Number(value) 
        : value
    }));
  };

  // Form Submission Handlers
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

  const handleCreateSponsor = async () => {
    try {
      if (!newSponsor.sponsor_id) {
        alert('Please enter a Sponsor ID');
        return;
      }

      await createSponsor({
        sponsor_id: newSponsor.sponsor_id,
        contract_value: newSponsor.contract_value,
        sector: newSponsor.sector,
        team_id: newSponsor.team_id,
        nif: newSponsor.nif
      });

      const sponsorsData = await getSponsors();
      setSponsors(sponsorsData);
      handleCloseSponsorDialog();
      setNewSponsor({
        sponsor_id: undefined,
        contract_value: 0,
        sector: '',
        team_id: 0,
        nif: ''
      });
    } catch (error) {
      console.error('Error creating sponsor:', error);
      alert('Error creating sponsor. Please check the ID is unique.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenPersonDialog}>
          Add Person
        </Button>
        <Button variant="contained" color="secondary" onClick={handleOpenSponsorDialog}>
          Add Sponsor
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Contract Value</TableCell>
              <TableCell>Sector</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sponsors.map((sponsor) => (
              <TableRow key={sponsor.sponsor_id}>
                <TableCell>{sponsor.sponsor_id}</TableCell>
                <TableCell>{sponsor.person_name}</TableCell>
                <TableCell>{sponsor.team_name}</TableCell>
                <TableCell>${sponsor.contract_value.toLocaleString()}</TableCell>
                <TableCell>{sponsor.sector}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Person Dialog (same as before) */}
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

      {/* Add Sponsor Dialog */}
      <Dialog open={openSponsorDialog} onClose={handleCloseSponsorDialog}>
        <DialogTitle>Add New Sponsor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Sponsor ID"
              name="sponsor_id"
              type="number"
              value={newSponsor.sponsor_id || ''}
              onChange={handleSponsorInputChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />

            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                name="nif"
                value={newSponsor.nif}
                onChange={(e: SelectChangeEvent<string>) => handleSponsorInputChange(e)}
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
                value={newSponsor.team_id}
                onChange={(e: SelectChangeEvent<number>) => handleSponsorInputChange(e)}
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
              label="Contract Value ($)"
              name="contract_value"
              type="number"
              value={newSponsor.contract_value}
              onChange={handleSponsorInputChange}
              fullWidth
              required
              inputProps={{ min: 0, step: 1000 }}
            />

            <TextField
              label="Sector"
              name="sector"
              value={newSponsor.sector}
              onChange={handleSponsorInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSponsorDialog}>Cancel</Button>
          <Button onClick={handleCreateSponsor} color="secondary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SponsorsList;