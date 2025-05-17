import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './components/Header.tsx';
import ModelTabs from './components/ModelTabs.tsx';
import DriverList from './components/listings/DriverList.tsx';
import SponsorList from './components/listings/SponsorList.tsx';
import MechanicList from './components/listings/MechanicList.tsx';
import TeamList from './components/listings/TeamList.tsx';
import CarList from './components/listings/CarList.tsx';
import RaceList from './components/listings/RaceList.tsx';
import ParticipationList from './components/listings/ParticipationList.tsx';
import WorksOnList from './components/listings/WorksOnList.tsx';
import SponsorshipList from './components/listings/SponsorshipList.tsx';
import BelongsList from './components/listings/BelongsList.tsx';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('team');

  const renderContent = () => {
    switch (currentTab) {
      case 'driver':
        return <DriverList />;
      case 'sponsor':
        return <SponsorList />;
      case 'mechanic':
        return <MechanicList />;
      case 'team':
        return <TeamList />;
      case 'car':
        return <CarList />;
      case 'race':
        return <RaceList />;
      case 'participation':
        return <ParticipationList />;
      case 'works_on':
        return <WorksOnList />;
      case 'sponsorship':
        return <SponsorshipList />;
      case 'belongs':
        return <BelongsList />;
      default:
        return <TeamList />;
    }
  };

  return (
    <div>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ModelTabs value={currentTab} onChange={setCurrentTab} />
        <Box sx={{ mt: 3 }}>
          {renderContent()}
        </Box>
      </Container>
    </div>
  );
};

export default App;