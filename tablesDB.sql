CREATE DATABASE IF NOT EXISTS SpeedTrackRacing;
USE SpeedTrackRacing;


CREATE TABLE IF NOT EXISTS Person (
    nif VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Team (
    team_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    budget DECIMAL(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Driver (
    driver_id INT PRIMARY KEY,
    total_points INT DEFAULT 0,
    wins INT DEFAULT 0,
    pole_positions INT DEFAULT 0,

    nif VARCHAR(20) NOT NULL,
    team_id INT NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE IF NOT EXISTS Sponsor (
    sponsor_id INT PRIMARY KEY,
    contract_value DECIMAL(15,2) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    
    team_id INT NOT NULL,
    nif VARCHAR(20) NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE IF NOT EXISTS Mechanic (
    mechanic_id INT PRIMARY KEY,
    specialty VARCHAR(50) NOT NULL,
    experience INT NOT NULL,
    
    team_id INT NOT NULL,
    nif VARCHAR(20) NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE IF NOT EXISTS Car (
    car_id INT PRIMARY KEY,
    number INT NOT NULL,
    chassis_model VARCHAR(50) NOT NULL,
    engine_type VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    manufacture_date DATE NOT NULL,

    team_id INT NOT NULL,
    driver_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Team(team_id),
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

CREATE TABLE IF NOT EXISTS Race (
    race_id INT PRIMARY KEY,
    circuit VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    track VARCHAR(100) NOT NULL,
    weather_conditions VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Participation (
    final_position INT,
    points_earned INT,  

    driver_id INT NOT NULL,
    car_id INT NOT NULL,
    race_id INT NOT NULL,

    PRIMARY KEY (driver_id, car_id, race_id),

    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
    FOREIGN KEY (car_id) REFERENCES Car(car_id),
    FOREIGN KEY (race_id) REFERENCES Race(race_id)
);

CREATE TABLE IF NOT EXISTS Works_On (
    idate DATE NOT NULL,
    edate DATE NOT NULL,  

    mechanic_id INT NOT NULL,
    car_id INT NOT NULL,

    PRIMARY KEY (mechanic_id, car_id),

    FOREIGN KEY (mechanic_id) REFERENCES Mechanic(mechanic_id),
    FOREIGN KEY (car_id) REFERENCES Car(car_id)
);

CREATE TABLE IF NOT EXISTS Sponsorship (
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    sponsor_id INT NOT NULL,
    team_id INT NOT NULL,

    PRIMARY KEY (sponsor_id, team_id),

    FOREIGN KEY (sponsor_id) REFERENCES Sponsor(sponsor_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE IF NOT EXISTS Belongs (
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    car_id INT NOT NULL,
    driver_id INT NOT NULL,
    team_id INT NOT NULL,

    PRIMARY KEY (driver_id, car_id, team_id),

    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
    FOREIGN KEY (car_id) REFERENCES Car(car_id)
)