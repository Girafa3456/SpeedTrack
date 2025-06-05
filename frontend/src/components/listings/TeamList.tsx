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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { getTeams, createTeam, updateTeam, deleteTeam, getTeamByName } from '../../services/api.ts';
import { Team } from '../../interfaces/types';

interface TeamWithDetails extends Team {
  driver_count: number;
  sponsor_count: number;
}

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Partial<Team>>({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchTeams(); 
      return;
    }

    const filtered = teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTeams(filtered);
  }, [searchTerm]);


  const fetchTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setIsEdit(false);
    setCurrentTeam({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (team: Team) => {
    setIsEdit(true);
    setCurrentTeam(team);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTeam(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'team_id' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentTeam.team_id || !currentTeam.name || currentTeam.budget === undefined) {
        throw new Error('All fields are required');
      }

      if (isEdit) {
        await updateTeam(currentTeam.team_id, currentTeam);
      } else {
        await createTeam({
          team_id: currentTeam.team_id as number,
          name: currentTeam.name as string,
          budget: currentTeam.budget as number,
        });
      }
      
      fetchTeams();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleDelete = async (teamId: number) => {
    try {
      await deleteTeam(teamId);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add Team
        </Button>
      </Box>


      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Drivers</TableCell>
              <TableCell>Sponsors</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.team_id}>
                <TableCell>{team.team_id}</TableCell>
                <TableCell>{team.name}</TableCell>
                <TableCell>${team.budget.toLocaleString()}</TableCell>
                <TableCell>{team.driver_count}</TableCell>
                <TableCell>{team.sponsor_count}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDialog(team)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(team.team_id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEdit ? 'Edit Team' : 'Add New Team'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {!isEdit && (
              <TextField
                name="team_id"
                label="Team ID"
                value={currentTeam.team_id || ''}
                onChange={handleInputChange}
                fullWidth
              />
            )}
            <TextField
              name="name"
              label="Team Name"
              value={currentTeam.name || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="budget"
              label="Budget"
              type="number"
              value={currentTeam.budget || ''}
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

export default TeamList;