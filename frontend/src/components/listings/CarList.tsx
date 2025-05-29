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
  Box,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { getCars, createCar, updateCar, deleteCar, getTeams, getDrivers } from '../../services/api.ts';
import { Car, Team, Driver } from '../../interfaces/types';

interface DriverWithDetails extends Driver {
  person_name: string;
}
interface CarWithDetails extends Car {
  team_name: string;
  driver_name: string;
}

const CarList: React.FC = () => {
  const [cars, setCars] = useState<CarWithDetails[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<DriverWithDetails[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCar, setCurrentCar] = useState<Partial<Car>>({});
  const [isEdit, setIsEdit] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsData, teamsData, driversData] = await Promise.all([
        getCars(),
        getTeams(),
        getDrivers()
      ]);
      setCars(carsData);
      setTeams(teamsData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredDrivers = selectedTeamId
    ? drivers.filter(driver => driver.team_id === selectedTeamId)
    : drivers;

  const handleTeamChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const teamId = Number(e.target.value);
    setSelectedTeamId(teamId);
    setCurrentCar(prev => ({
      ...prev,
      team_id: teamId,
      driver_id: undefined 
    }));
  };

  const handleOpenAddDialog = () => {
    setIsEdit(false);
    setCurrentCar({
      weight: 0,
      number: 0
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (car: CarWithDetails) => {
    setIsEdit(true);
    setCurrentCar({
      ...car,
      manufacture_date: car.manufacture_date?.split('T')[0] // Format date for input
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCar(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'number' || name === 'car_id' || 
              name === 'team_id' || name === 'driver_id'
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentCar.car_id || !currentCar.chassis_model || !currentCar.engine_type) {
        throw new Error('Required fields are missing');
      }

      if (isEdit) {
        await updateCar(currentCar.car_id, {
          number: currentCar.number,
          chassis_model: currentCar.chassis_model,
          engine_type: currentCar.engine_type,
          weight: currentCar.weight,
          manufacture_date: currentCar.manufacture_date,
          team_id: currentCar.team_id,
          driver_id: currentCar.driver_id
        });
      } else {
        await createCar({
          car_id: currentCar.car_id as number,
          number: currentCar.number as number,
          chassis_model: currentCar.chassis_model as string,
          engine_type: currentCar.engine_type as string,
          weight: currentCar.weight as number,
          manufacture_date: currentCar.manufacture_date as string,
          team_id: currentCar.team_id as number,
          driver_id: currentCar.driver_id as number
        });
      }
      
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  const handleDelete = async (carId: number) => {
    try {
      await deleteCar(carId);
      fetchData();
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add Car
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Chassis Model</TableCell>
              <TableCell>Engine Type</TableCell>
              <TableCell>Weight (kg)</TableCell>
              <TableCell>Manufacture Date</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.car_id}>
                <TableCell>{car.car_id}</TableCell>
                <TableCell>{car.number}</TableCell>
                <TableCell>{car.chassis_model}</TableCell>
                <TableCell>{car.engine_type}</TableCell>
                <TableCell>{car.weight}</TableCell>
                <TableCell>{car.manufacture_date?.split('T')[0]}</TableCell>
                <TableCell>{car.team_name}</TableCell>
                <TableCell>{car.driver_name || 'Unassigned'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDialog(car)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(car.car_id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Car' : 'Add New Car'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {!isEdit && (
              <TextField
                name="car_id"
                label="Car ID"
                type="number"
                value={currentCar.car_id || ''}
                onChange={handleInputChange}
                fullWidth
              />
            )}
            <TextField
              name="number"
              label="Car Number"
              type="number"
              value={currentCar.number || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="chassis_model"
              label="Chassis Model"
              value={currentCar.chassis_model || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="engine_type"
              label="Engine Type"
              value={currentCar.engine_type || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="weight"
              label="Weight (kg)"
              type="number"
              value={currentCar.weight || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="manufacture_date"
              label="Manufacture Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={currentCar.manufacture_date || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              select
              name="team_id"
              label="Team"
              value={currentCar.team_id || ''}
              onChange={handleTeamChange}
              fullWidth
            >
              {teams.map((team) => (
                <MenuItem key={team.team_id} value={team.team_id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="driver_id"
              label="Driver"
              value={currentCar.driver_id || ''}
              onChange={handleInputChange}
              fullWidth
              disabled={!selectedTeamId}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {filteredDrivers.map((driver) => (
                <MenuItem key={driver.driver_id} value={driver.driver_id}>
                  {driver.person_name}
                </MenuItem>
              ))}
            </TextField>
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

export default CarList;