USE p6g9;

-- Insert sample data into Person
INSERT INTO Person (nif, name, birth_date, nationality) VALUES
('111111111', 'Lewis Hamilton', '1985-01-07', 'British'),
('222222222', 'Max Verstappen', '1997-09-30', 'Dutch'),
('333333333', 'Charles Leclerc', '1997-10-16', 'Monegasque'),
('444444444', 'Carlos Sainz', '1994-09-01', 'Spanish'),
('555555555', 'John Sponsor', '1970-05-15', 'American'),
('666666666', 'Jane Sponsor', '1975-08-20', 'German'),
('777777777', 'Mike Mechanic', '1980-03-10', 'Italian'),
('888888888', 'Sarah Mechanic', '1985-11-25', 'French');

-- Insert sample data into Team
INSERT INTO Team (team_id, name, budget) VALUES
(1, 'Mercedes', 500000000),
(2, 'Red Bull Racing', 450000000),
(3, 'Ferrari', 480000000);

-- Insert sample data into Driver
INSERT INTO Driver (driver_id, total_points, wins, pole_positions, nif, team_id) VALUES
(1, 4000, 103, 104, '111111111', 1),
(2, 2500, 54, 30, '222222222', 2),
(3, 900, 5, 18, '333333333', 3),
(4, 800, 2, 5, '444444444', 3);

-- Insert sample data into Sponsor
INSERT INTO Sponsor (sponsor_id, contract_value, sector, nif, team_id) VALUES
(1, 50000000, 'Technology', '555555555', 1),
(2, 40000000, 'Energy Drinks', '666666666', 2);

-- Insert sample data into Mechanic
INSERT INTO Mechanic (mechanic_id, specialty, experience, nif, team_id) VALUES
(1, 'Engine', 15, '777777777', 1),
(2, 'Aerodynamics', 10, '888888888', 2);

-- Insert sample data into Car
INSERT INTO Car (car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id) VALUES
(1, 44, 'W14', 'Mercedes-AMG F1 M14', 798, '2023-01-15', 1, 1),
(2, 1, 'RB19', 'Honda RBPTH001', 795, '2023-02-10', 2, 2),
(3, 16, 'SF-23', 'Ferrari 066/10', 800, '2023-01-20', 3, 3),
(4, 55, 'SF-23', 'Ferrari 066/10', 799, '2023-01-20', 3, 4);

-- Insert sample data into Race
INSERT INTO Race (race_id, circuit, date, track, weather_conditions) VALUES
(1, 'Bahrain International Circuit', '2023-03-05', 'Bahrain', 'Dry'),
(2, 'Jeddah Corniche Circuit', '2023-03-19', 'Saudi Arabia', 'Dry'),
(3, 'Albert Park Circuit', '2023-04-02', 'Australia', 'Wet');

-- Insert sample data into Participation
INSERT INTO Participation (driver_id, car_id, race_id, final_position, points_earned) VALUES
(1, 1, 1, 5, 10),
(2, 2, 1, 1, 25),
(3, 3, 1, 4, 12),
(4, 4, 1, 6, 8),
(2, 2, 2, 1, 25),
(1, 1, 2, 2, 18),
(3, 3, 2, 7, 6),
(4, 4, 2, 5, 10);

-- Insert sample data into Works_On
INSERT INTO Works_On (mechanic_id, car_id, idate, edate) VALUES
(1, 1, '2023-01-01', '2023-12-31'),
(2, 2, '2023-01-01', '2023-12-31');

-- Insert sample data into Sponsorship
INSERT INTO Sponsorship (sponsor_id, team_id, start_date, end_date) VALUES
(1, 1, '2023-01-01', '2023-12-31'),
(2, 2, '2023-01-01', '2023-12-31');

-- Insert sample data into Belongs
INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date) VALUES
(1, 1, 1, '2023-01-01', '2023-12-31'),
(2, 2, 2, '2023-01-01', '2023-12-31'),
(3, 3, 3, '2023-01-01', '2023-12-31'),
(4, 4, 3, '2023-01-01', '2023-12-31');