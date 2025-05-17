import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getPersons = async () => {
  const response = await axios.get(`${API_BASE_URL}/persons`);
  return response.data;
};

export const getDrivers = async () => {
  const response = await axios.get(`${API_BASE_URL}/drivers`);
  return response.data;
};

export const getSponsors = async () => {
  const response = await axios.get(`${API_BASE_URL}/sponsors`);
  return response.data;
};

export const getMechanics = async () => {
  const response = await axios.get(`${API_BASE_URL}/mechanics`);
  return response.data;
};

export const getTeams = async () => {
  const response = await axios.get(`${API_BASE_URL}/teams`);
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