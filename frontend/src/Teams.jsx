import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';

export default function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    axios.get('/api/teams')
      .then(response => setTeams(response.data))
      .catch(error => console.error('Error fetching teams:', error));
  }, []);

  return (
    <Grid container spacing={3}>
      {teams.map(team => (
        <Grid item xs={12} sm={6} md={4} key={team.team_id}>
          <Card>
            <CardContent>
              <Typography variant="h5">{team.name}</Typography>
              <Typography>Budget: ${team.budget.toLocaleString()}</Typography>
              <Typography>Drivers: {team.driver_count}</Typography>
              <Typography>Sponsors: {team.sponsor_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}