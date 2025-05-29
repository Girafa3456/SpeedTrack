USE p6g9;

-- Índices para chaves estrangeiras (relacionamentos frequentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_driver_team' AND object_id = OBJECT_ID('Driver'))
    CREATE INDEX idx_driver_team ON Driver(team_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_driver_person' AND object_id = OBJECT_ID('Driver'))
    CREATE INDEX idx_driver_person ON Driver(nif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsor_team' AND object_id = OBJECT_ID('Sponsor'))
    CREATE INDEX idx_sponsor_team ON Sponsor(team_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsor_person' AND object_id = OBJECT_ID('Sponsor'))
    CREATE INDEX idx_sponsor_person ON Sponsor(nif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_mechanic_team' AND object_id = OBJECT_ID('Mechanic'))
    CREATE INDEX idx_mechanic_team ON Mechanic(team_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_mechanic_person' AND object_id = OBJECT_ID('Mechanic'))
    CREATE INDEX idx_mechanic_person ON Mechanic(nif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_car_team' AND object_id = OBJECT_ID('Car'))
    CREATE INDEX idx_car_team ON Car(team_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_car_driver' AND object_id = OBJECT_ID('Car'))
    CREATE INDEX idx_car_driver ON Car(driver_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_participation_driver' AND object_id = OBJECT_ID('Participation'))
    CREATE INDEX idx_participation_driver ON Participation(driver_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_participation_car' AND object_id = OBJECT_ID('Participation'))
    CREATE INDEX idx_participation_car ON Participation(car_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_participation_race' AND object_id = OBJECT_ID('Participation'))
    CREATE INDEX idx_participation_race ON Participation(race_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_works_on_mechanic' AND object_id = OBJECT_ID('Works_On'))
    CREATE INDEX idx_works_on_mechanic ON Works_On(mechanic_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_works_on_car' AND object_id = OBJECT_ID('Works_On'))
    CREATE INDEX idx_works_on_car ON Works_On(car_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsorship_sponsor' AND object_id = OBJECT_ID('Sponsorship'))
    CREATE INDEX idx_sponsorship_sponsor ON Sponsorship(sponsor_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsorship_team' AND object_id = OBJECT_ID('Sponsorship'))
    CREATE INDEX idx_sponsorship_team ON Sponsorship(team_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_belongs_driver' AND object_id = OBJECT_ID('Belongs'))
    CREATE INDEX idx_belongs_driver ON Belongs(driver_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_belongs_car' AND object_id = OBJECT_ID('Belongs'))
    CREATE INDEX idx_belongs_car ON Belongs(car_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_belongs_team' AND object_id = OBJECT_ID('Belongs'))
    CREATE INDEX idx_belongs_team ON Belongs(team_id);

-- Índices para campos frequentemente filtrados/ordenados
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_person_name' AND object_id = OBJECT_ID('Person'))
    CREATE INDEX idx_person_name ON Person(name);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_team_name' AND object_id = OBJECT_ID('Team'))
    CREATE INDEX idx_team_name ON Team(name);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_team_budget' AND object_id = OBJECT_ID('Team'))
    CREATE INDEX idx_team_budget ON Team(budget);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_driver_points' AND object_id = OBJECT_ID('Driver'))
    CREATE INDEX idx_driver_points ON Driver(total_points);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_driver_wins' AND object_id = OBJECT_ID('Driver'))
    CREATE INDEX idx_driver_wins ON Driver(wins);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsor_contract' AND object_id = OBJECT_ID('Sponsor'))
    CREATE INDEX idx_sponsor_contract ON Sponsor(contract_value);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_race_date' AND object_id = OBJECT_ID('Race'))
    CREATE INDEX idx_race_date ON Race(date);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_race_circuit' AND object_id = OBJECT_ID('Race'))
    CREATE INDEX idx_race_circuit ON Race(circuit);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_participation_position' AND object_id = OBJECT_ID('Participation'))
    CREATE INDEX idx_participation_position ON Participation(final_position);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_car_number' AND object_id = OBJECT_ID('Car'))
    CREATE INDEX idx_car_number ON Car(number);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_car_chassis' AND object_id = OBJECT_ID('Car'))
    CREATE INDEX idx_car_chassis ON Car(chassis_model);

-- Índices compostos para consultas frequentes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_driver_stats' AND object_id = OBJECT_ID('Driver'))
    CREATE INDEX idx_driver_stats ON Driver(total_points, wins, pole_positions);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_race_conditions' AND object_id = OBJECT_ID('Race'))
    CREATE INDEX idx_race_conditions ON Race(weather_conditions, track);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sponsor_sector_value' AND object_id = OBJECT_ID('Sponsor'))
    CREATE INDEX idx_sponsor_sector_value ON Sponsor(sector, contract_value);