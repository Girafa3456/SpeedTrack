USE p6g9;

IF OBJECT_ID('Belongs', 'U') IS NOT NULL DROP TABLE Belongs;
IF OBJECT_ID('Sponsorship', 'U') IS NOT NULL DROP TABLE Sponsorship;
IF OBJECT_ID('Works_On', 'U') IS NOT NULL DROP TABLE Works_On;
IF OBJECT_ID('Participation', 'U') IS NOT NULL DROP TABLE Participation;
IF OBJECT_ID('Race', 'U') IS NOT NULL DROP TABLE Race;
IF OBJECT_ID('Car', 'U') IS NOT NULL DROP TABLE Car;
IF OBJECT_ID('Mechanic', 'U') IS NOT NULL DROP TABLE Mechanic;
IF OBJECT_ID('Sponsor', 'U') IS NOT NULL DROP TABLE Sponsor;
IF OBJECT_ID('Driver', 'U') IS NOT NULL DROP TABLE Driver;
IF OBJECT_ID('Team', 'U') IS NOT NULL DROP TABLE Team;
IF OBJECT_ID('Person', 'U') IS NOT NULL DROP TABLE Person;

CREATE TABLE Person (
    nif VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL
);

CREATE TABLE Team (
    team_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    budget DECIMAL(15,2) NOT NULL
);

CREATE TABLE Driver (
    driver_id INT PRIMARY KEY,
    total_points INT DEFAULT 0,
    wins INT DEFAULT 0,
    pole_positions INT DEFAULT 0,

    nif VARCHAR(20) NOT NULL,
    team_id INT NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Sponsor (
    sponsor_id INT PRIMARY KEY,
    contract_value DECIMAL(15,2) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    
    team_id INT NOT NULL,
    nif VARCHAR(20) NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Mechanic (
    mechanic_id INT PRIMARY KEY,
    specialty VARCHAR(50) NOT NULL,
    experience INT NOT NULL,
    
    team_id INT NOT NULL,
    nif VARCHAR(20) NOT NULL,
    FOREIGN KEY (nif) REFERENCES Person(nif),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Car (
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

CREATE TABLE Race (
    race_id INT PRIMARY KEY,
    circuit VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    track VARCHAR(100) NOT NULL,
    weather_conditions VARCHAR(50) NOT NULL
);

CREATE TABLE Participation (
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

CREATE TABLE Works_On (
    idate DATE NOT NULL,
    edate DATE NOT NULL,  

    mechanic_id INT NOT NULL,
    car_id INT NOT NULL,

    PRIMARY KEY (mechanic_id, car_id),

    FOREIGN KEY (mechanic_id) REFERENCES Mechanic(mechanic_id),
    FOREIGN KEY (car_id) REFERENCES Car(car_id)
);

CREATE TABLE Sponsorship (
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    sponsor_id INT NOT NULL,
    team_id INT NOT NULL,

    PRIMARY KEY (sponsor_id, team_id),

    FOREIGN KEY (sponsor_id) REFERENCES Sponsor(sponsor_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Belongs (
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    car_id INT NOT NULL,
    driver_id INT NOT NULL,
    team_id INT NOT NULL,

    PRIMARY KEY (driver_id, car_id, team_id),

    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id),
    FOREIGN KEY (car_id) REFERENCES Car(car_id)
)