-- Insert a new Belongs relationship when a Car is inserted, if not already exists
CREATE TRIGGER MaintainBelongsOnCarInsert
ON Car
AFTER INSERT
AS
BEGIN
    INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
    SELECT i.car_id, i.driver_id, i.team_id, GETDATE(), NULL
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM Belongs b
        WHERE b.car_id = i.car_id AND b.driver_id = i.driver_id AND b.team_id = i.team_id
    );
END

-- Assign points automatically on Participation insert if not provided (NOT WORKING YET)
CREATE TRIGGER AutoAssignPointsOnParticipationInsert
ON Participation
AFTER INSERT
AS
BEGIN
    UPDATE p
    SET points_earned = 
        CASE 
            WHEN i.final_position = 1 THEN 25
            WHEN i.final_position = 2 THEN 18
            WHEN i.final_position = 3 THEN 15
            WHEN i.final_position = 4 THEN 12
            WHEN i.final_position = 5 THEN 10
            WHEN i.final_position = 6 THEN 8
            WHEN i.final_position = 7 THEN 6
            WHEN i.final_position = 8 THEN 4
            WHEN i.final_position = 9 THEN 2
            WHEN i.final_position = 10 THEN 1
            ELSE 0
        END
    FROM Participation p
    JOIN inserted i ON 
        p.driver_id = i.driver_id AND 
        p.car_id = i.car_id AND 
        p.race_id = i.race_id
    WHERE i.points_earned IS NULL;
END

-- Update driver's total_points after new participation
CREATE TRIGGER UpdateDriverPointsOnParticipationInsert
ON Participation
AFTER INSERT
AS
BEGIN
    UPDATE d
    SET total_points = d.total_points + ISNULL(i.points_earned, 0)
    FROM Driver d
    JOIN inserted i ON d.driver_id = i.driver_id;
END

-- Subtract points from driver after participation deletion
CREATE TRIGGER SubtractDriverPointsOnParticipationDelete
ON Participation
AFTER DELETE
AS
BEGIN
    UPDATE d
    SET total_points = d.total_points - ISNULL(dlt.points_earned, 0)
    FROM Driver d
    JOIN deleted dlt ON d.driver_id = dlt.driver_id;
END

-- Update driver's pole positions when they win a race
CREATE TRIGGER UpdatePolePositionsOnRaceWin
ON Participation
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE Driver
    SET pole_positions = pole_positions + 1
    FROM Driver d
    JOIN inserted i ON d.driver_id = i.driver_id
    WHERE i.final_position = 1;
END

-- Update driver's win count when they finish 1st in a race
CREATE TRIGGER UpdateDriverWinsOnParticipationInsert
ON Participation
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE Driver
    SET wins = wins + 1
    FROM Driver d
    JOIN inserted i ON d.driver_id = i.driver_id
    WHERE i.final_position = 1;
END

-- Update team budget when a new sponsorship is added
CREATE TRIGGER UpdateTeamBudgetOnSponsorshipInsert
ON Sponsorship
AFTER INSERT
AS
BEGIN
    UPDATE Team
    SET budget = budget + s.contract_value
    FROM Team t
    JOIN Sponsor s ON t.team_id = s.team_id
    JOIN inserted i ON s.sponsor_id = i.sponsor_id;
END

-- Update team budget when a sponsorship ends
CREATE TRIGGER UpdateTeamBudgetOnSponsorshipEnd
ON Sponsorship
AFTER UPDATE
AS
BEGIN
    -- When end_date is set (from NULL to a date)
    UPDATE Team
    SET budget = budget - s.contract_value
    FROM Team t
    JOIN Sponsor s ON t.team_id = s.team_id
    JOIN inserted i ON s.sponsor_id = i.sponsor_id
    JOIN deleted d ON s.sponsor_id = d.sponsor_id
    WHERE d.end_date IS NULL AND i.end_date IS NOT NULL;
END

-- Ensure a driver can only be assigned to one car per team
CREATE TRIGGER PreventMultipleCarAssignments
ON Car
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Car c ON i.driver_id = c.driver_id AND i.team_id = c.team_id
    )
    BEGIN
        RAISERROR('Driver is already assigned to a car in this team', 16, 1);
        RETURN;
    END
    
    INSERT INTO Car (car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id)
    SELECT car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id
    FROM inserted;
END

-- Archive old car assignments when a new one is created
CREATE TRIGGER ArchiveCarAssignment
ON Car
AFTER UPDATE
AS
BEGIN
    -- When driver_id changes, update the Belongs relationship
    UPDATE Belongs
    SET end_date = GETDATE()
    FROM Belongs b
    JOIN deleted d ON b.car_id = d.car_id
    JOIN inserted i ON b.car_id = i.car_id
    WHERE b.end_date IS NULL AND d.driver_id <> i.driver_id;
    
    -- Create new Belongs relationship
    INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
    SELECT i.car_id, i.driver_id, i.team_id, GETDATE(), NULL
    FROM inserted i
    JOIN deleted d ON i.car_id = d.car_id
    WHERE i.driver_id <> d.driver_id
    AND NOT EXISTS (
        SELECT 1 FROM Belongs b
        WHERE b.car_id = i.car_id AND b.driver_id = i.driver_id AND b.team_id = i.team_id
    );
END

-- Ensure driver meets minimum age requirement
CREATE TRIGGER ValidateDriverAge
ON Driver
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Person p ON i.nif = p.nif
        WHERE DATEDIFF(YEAR, p.birth_date, GETDATE()) < 18
    )
    BEGIN
        RAISERROR('Driver must be at least 18 years old', 16, 1);
        RETURN;
    END
    
    INSERT INTO Driver (driver_id, total_points, wins, pole_positions, nif, team_id)
    SELECT driver_id, total_points, wins, pole_positions, nif, team_id
    FROM inserted;
END

-- Prevent duplicate car numbers within a team
CREATE TRIGGER PreventDuplicateCarNumbers
ON Car
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Car c ON i.team_id = c.team_id AND i.number = c.number
    )
    BEGIN
        RAISERROR('Car number already exists in this team', 16, 1);
        RETURN;
    END
    
    INSERT INTO Car (car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id)
    SELECT car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id
    FROM inserted;
END

-- Update team statistics when driver statistics change
CREATE TRIGGER UpdateTeamStatsOnDriverChange
ON Driver
AFTER UPDATE
AS
BEGIN
    -- Update team's total points (if you add this column to Team)
    UPDATE Team
    SET total_points = (
        SELECT SUM(total_points)
        FROM Driver
        WHERE Driver.team_id = Team.team_id
    )
    FROM Team
    JOIN inserted i ON Team.team_id = i.team_id;
END