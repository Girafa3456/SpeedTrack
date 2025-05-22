import axios from 'axios';


const API_BASE_URL = 'http://localhost:5000/api';

export const getPersons = async () => {
  const response = await axios.get(`${API_BASE_URL}/persons`);
  return response.data;
};

export const createPerson = async (personData: {
  nif: string;
  name: string;
  birth_date: string;
  nationality: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/persons`, personData);
  return response.data;
};

export const updatePerson = async (
  nif: string,
  personData: {
    name?: string;
    birth_date?: string;
    nationality?: string;
  }
) => {
  const response = await axios.put(`${API_BASE_URL}/persons/${nif}`, personData);
  return response.data;
};

export const deletePerson = async (nif: string) => {
  const response = await axios.delete(`${API_BASE_URL}/persons/${nif}`);
  return response.data;
};

export const getDrivers = async () => {
  const response = await axios.get(`${API_BASE_URL}/drivers`);
  return response.data;
};

export const getDriver = async (driverId: number) => {
  const response = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
  return response.data;
};

export const createDriver = async (driverData: {
  driver_id: number;
  total_points: number;
  wins: number;
  pole_positions: number;
  nif: string;
  team_id: number;
}) => {
  const response = await axios.post(`${API_BASE_URL}/drivers`, driverData);
  return response.data;
};

export const updateDriver = async (
  driverId: number,
  driverData: {
    total_points?: number;
    wins?: number;
    pole_positions?: number;
    nif?: number;
    team_id?: number;
  }
) => {
  const response = await axios.put(`${API_BASE_URL}/drivers/${driverId}`, driverData);
  return response.data;
};

export const deleteDriver = async (driverId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/drivers/${driverId}`);
  return response.data;
};

export const getSponsors = async () => {
  const response = await axios.get(`${API_BASE_URL}/sponsors`);
  return response.data;
};

export const createSponsor = async (sponsorData: {
  sponsor_id: number;
  contract_value: number;
  sector: string;
  team_id: number;
  nif: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/sponsors`, sponsorData);
  return response.data;
};

export const updateSponsor = async (
  sponsorId: number,
  sponsorData: {
    contract_value?: number;
    sector?: string;
    team_id?: number;
  }
) => {
  const response = await axios.put(`${API_BASE_URL}/sponsors/${sponsorId}`, sponsorData);
  return response.data;
};

export const deleteSponsor = async (sponsorId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/sponsors/${sponsorId}`);
  return response.data;
};

export const getMechanics = async () => {
  const response = await axios.get(`${API_BASE_URL}/mechanics`);
  return response.data;
};

export const createMechanic = async (mechanic: Omit<Mechanic, 'mechanic_id'> & { mechanic_id?: number }) => {
  const response = await fetch('/api/mechanics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mechanic),
  });
  if (!response.ok) {
    throw new Error('Failed to create mechanic');
  }
  return response.json();
};

// Teams
export const getTeams = async () => {
  const response = await axios.get(`${API_BASE_URL}/teams`);
  return response.data;
};

export const getTeam = async (teamId: number) => {
  const response = await axios.get(`${API_BASE_URL}/teams/${teamId}`);
  return response.data;
};

export const createTeam = async (teamData: {
  team_id: number;
  name: string;
  budget: number;
}) => {
  const response = await axios.post(`${API_BASE_URL}/teams`, teamData);
  return response.data;
};

export const updateTeam = async (
  teamId: number,
  teamData: {
    name?: string;
    budget?: number;
  }
) => {
  const response = await axios.put(`${API_BASE_URL}/teams/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/teams/${teamId}`);
  return response.data;
};

export const getCars = async () => {
  const response = await axios.get(`${API_BASE_URL}/cars`);
  return response.data;
};

export const getRaces = async () => {
  const response = await axios.get(`${API_BASE_URL}/races`);
  return response.data;
};

export const getParticipations = async () => {
  const response = await axios.get(`${API_BASE_URL}/participations`);
  return response.data;
};

export const getWorksOn = async () => {
  const response = await axios.get(`${API_BASE_URL}/works_on`);
  return response.data;
};

export const getSponsorships = async () => {
  const response = await axios.get(`${API_BASE_URL}/sponsorships`);
  return response.data;
};

export const getBelongs = async () => {
  const response = await axios.get(`${API_BASE_URL}/belongs`);
  return response.data;
};