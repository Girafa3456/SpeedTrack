-- =============================================
-- TEAM TRIGGERS
-- =============================================
-- When a Team is deleted, clean up related entities
CREATE TRIGGER CleanupTeamRelationships
ON Team
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM Participation
        WHERE car_id IN (
            SELECT car_id FROM Car WHERE team_id IN (SELECT team_id FROM deleted)
        );
        
        UPDATE Works_On
        SET edate = GETDATE()
        WHERE car_id IN (
            SELECT car_id FROM Car WHERE team_id IN (SELECT team_id FROM deleted)
        ) AND edate IS NULL;
        
        UPDATE Belongs
        SET end_date = GETDATE()
        WHERE team_id IN (SELECT team_id FROM deleted) AND end_date IS NULL;
        
        UPDATE Sponsorship
        SET end_date = GETDATE()
        WHERE team_id IN (SELECT team_id FROM deleted) AND end_date IS NULL;
        
        DELETE FROM Car
        WHERE team_id IN (SELECT team_id FROM deleted);
        
        DELETE FROM Driver
        WHERE team_id IN (SELECT team_id FROM deleted);
        
        DELETE FROM Mechanic
        WHERE team_id IN (SELECT team_id FROM deleted);
        
        DELETE FROM Sponsor
        WHERE team_id IN (SELECT team_id FROM deleted);
        
        DELETE FROM Team
        WHERE team_id IN (SELECT team_id FROM deleted);
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW; 
    END CATCH
END;

-- =============================================
-- DRIVER TRIGGERS
-- =============================================

-- Maintain Belongs when Driver is assigned to a team
CREATE TRIGGER MaintainBelongsOnDriverInsert
ON Driver
AFTER INSERT
AS
BEGIN
    
    INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
    SELECT c.car_id, i.driver_id, i.team_id, GETDATE(), NULL
    FROM inserted i
    LEFT JOIN Car c ON c.driver_id = i.driver_id AND c.team_id = i.team_id
    WHERE c.car_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM Belongs b
        WHERE b.driver_id = i.driver_id AND b.team_id = i.team_id AND b.end_date IS NULL
    );
END;

-- Update Belongs when Driver's team changes
CREATE TRIGGER UpdateBelongsOnDriverTeamChange
ON Driver
AFTER UPDATE
AS
BEGIN
    IF UPDATE(team_id)
    BEGIN
        UPDATE Belongs
        SET end_date = GETDATE()
        FROM Belongs b
        JOIN deleted d ON b.driver_id = d.driver_id
        WHERE b.end_date IS NULL AND d.team_id <> (SELECT team_id FROM inserted);
        
        INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
        SELECT c.car_id, i.driver_id, i.team_id, GETDATE(), NULL
        FROM inserted i
        JOIN Car c ON c.driver_id = i.driver_id AND c.team_id = i.team_id
        WHERE NOT EXISTS (
            SELECT 1 FROM Belongs b
            WHERE b.driver_id = i.driver_id AND b.car_id = c.car_id AND b.team_id = i.team_id
        );
    END
END;

-- Maintain Belongs when Driver is deleted
CREATE TRIGGER CleanupDriverRelationships
ON Driver
INSTEAD OF DELETE
AS
BEGIN
    DELETE FROM Participation 
    WHERE driver_id IN (SELECT driver_id FROM deleted);

    UPDATE Belongs
    SET end_date = GETDATE()
    WHERE driver_id IN (SELECT driver_id FROM deleted) AND end_date IS NULL;
    
    DELETE FROM Driver 
    WHERE driver_id IN (SELECT driver_id FROM deleted);
END;

-- =============================================
-- CAR TRIGGERS
-- =============================================

-- Maintain Belongs when Car is inserted
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
END;

-- Update Belongs when Car's driver or team changes
CREATE TRIGGER UpdateBelongsOnCarChange
ON Car
AFTER UPDATE
AS
BEGIN
    IF UPDATE(driver_id) OR UPDATE(team_id)
    BEGIN
        UPDATE Belongs
        SET end_date = GETDATE()
        FROM Belongs b
        JOIN deleted d ON b.car_id = d.car_id
        WHERE b.end_date IS NULL 
        AND (d.driver_id <> (SELECT driver_id FROM inserted WHERE car_id = d.car_id)
             OR d.team_id <> (SELECT team_id FROM inserted WHERE car_id = d.car_id));
        
        INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
        SELECT i.car_id, i.driver_id, i.team_id, GETDATE(), NULL
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1 FROM Belongs b
            WHERE b.car_id = i.car_id AND b.driver_id = i.driver_id AND b.team_id = i.team_id
        );
    END
END;

-- Maintain Belongs when Car is deleted
CREATE TRIGGER CleanupCarRelationships
ON Car
INSTEAD OF DELETE
AS
BEGIN
    DELETE FROM Participation 
    WHERE car_id IN (SELECT car_id FROM deleted);

    UPDATE Works_On
    SET edate = GETDATE()
    WHERE car_id IN (SELECT car_id FROM deleted) AND edate IS NULL;

    UPDATE Belongs
    SET end_date = GETDATE()
    WHERE car_id IN (SELECT car_id FROM deleted) AND end_date IS NULL;

    DELETE FROM Car 
    WHERE car_id IN (SELECT car_id FROM deleted);
END;

-- =============================================
-- SPONSOR TRIGGERS
-- =============================================

-- Maintain Sponsorship when Sponsor is inserted
CREATE OR ALTER TRIGGER MaintainSponsorshipOnSponsorInsert
ON Sponsor
AFTER INSERT
AS
BEGIN
    INSERT INTO Sponsorship (sponsor_id, team_id, start_date, end_date)
    SELECT 
        i.sponsor_id, 
        i.team_id, 
        GETDATE() AS start_date,
        DATEADD(YEAR, 1, GETDATE()) AS end_date -- Default: 1 year
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM Sponsorship s
        WHERE s.sponsor_id = i.sponsor_id AND s.team_id = i.team_id
    );
END;

-- Update Sponsorship when Sponsor's team changes
CREATE TRIGGER UpdateSponsorshipOnSponsorTeamChange
ON Sponsor
AFTER UPDATE
AS
BEGIN
    IF UPDATE(team_id)
    BEGIN
        UPDATE Sponsorship
        SET end_date = GETDATE()
        FROM Sponsorship s
        JOIN deleted d ON s.sponsor_id = d.sponsor_id
        WHERE s.end_date IS NULL AND d.team_id <> (SELECT team_id FROM inserted WHERE sponsor_id = d.sponsor_id);
        

        INSERT INTO Sponsorship (sponsor_id, team_id, start_date, end_date)
        SELECT i.sponsor_id, i.team_id, GETDATE(), NULL
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1 FROM Sponsorship s
            WHERE s.sponsor_id = i.sponsor_id AND s.team_id = i.team_id
        );
    END
END;

-- Maintain Sponsorship when Sponsor is deleted
CREATE TRIGGER CleanupSponsorRelationships
ON Sponsor
INSTEAD OF DELETE
AS
BEGIN
    UPDATE Sponsorship
    SET end_date = GETDATE()
    WHERE sponsor_id IN (SELECT sponsor_id FROM deleted) AND end_date IS NULL;

    DELETE FROM Sponsor 
    WHERE sponsor_id IN (SELECT sponsor_id FROM deleted);
END;

-- =============================================
-- MECHANIC TRIGGERS
-- =============================================
-- Automatically create Works_On relationships when Mechanic is assigned to team with cars
CREATE OR ALTER TRIGGER MaintainWorksOnForMechanic
ON Mechanic
AFTER INSERT
AS
BEGIN
    INSERT INTO Works_On (mechanic_id, car_id, idate, edate)
    SELECT 
        i.mechanic_id, 
        c.car_id, 
        GETDATE() AS idate, 
        DATEADD(YEAR, 1, GETDATE()) AS edate -- Default: 1 year
    FROM inserted i
    JOIN Car c ON c.team_id = i.team_id
    WHERE NOT EXISTS (
        SELECT 1 FROM Works_On w
        WHERE w.mechanic_id = i.mechanic_id AND w.car_id = c.car_id
    );
END;

-- Update Works_On when Mechanic's team changes
CREATE TRIGGER UpdateWorksOnForMechanicTeamChange
ON Mechanic
AFTER UPDATE
AS
BEGIN
    IF UPDATE(team_id)
    BEGIN
        
        UPDATE Works_On
        SET edate = GETDATE()
        FROM Works_On w
        JOIN deleted d ON w.mechanic_id = d.mechanic_id
        JOIN Car c ON w.car_id = c.car_id
        WHERE w.edate IS NULL AND c.team_id = d.team_id;
        
        
        INSERT INTO Works_On (mechanic_id, car_id, idate, edate)
        SELECT i.mechanic_id, c.car_id, GETDATE(), NULL
        FROM inserted i
        JOIN Car c ON c.team_id = i.team_id
        WHERE NOT EXISTS (
            SELECT 1 FROM Works_On w
            WHERE w.mechanic_id = i.mechanic_id AND w.car_id = c.car_id
        );
    END
END;

-- Maintain Works_On when Mechanic is deleted
CREATE TRIGGER CleanupMechanicRelationships
ON Mechanic
INSTEAD OF DELETE
AS
BEGIN
    -- First end Works_On relationships
    UPDATE Works_On
    SET edate = GETDATE()
    WHERE mechanic_id IN (SELECT mechanic_id FROM deleted) AND edate IS NULL;
    
    -- Then delete the mechanic
    DELETE FROM Mechanic 
    WHERE mechanic_id IN (SELECT mechanic_id FROM deleted);
END;

-- =============================================
-- PARTICIPATION TRIGGERS 
-- =============================================

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
    JOIN inserted i ON p.driver_id = i.driver_id AND p.car_id = i.car_id AND p.race_id = i.race_id
    WHERE i.points_earned IS NULL;
    
    UPDATE d
    SET 
        total_points = d.total_points + ISNULL(i.points_earned, 
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
            END),
        wins = wins + CASE WHEN i.final_position = 1 THEN 1 ELSE 0 END,
        pole_positions = pole_positions + CASE WHEN i.final_position = 1 THEN 1 ELSE 0 END
    FROM Driver d
    JOIN inserted i ON d.driver_id = i.driver_id;
END;

CREATE TRIGGER HandleParticipationUpdates
ON Participation
AFTER UPDATE
AS
BEGIN
    IF UPDATE(final_position)
    BEGIN

        UPDATE d
        SET total_points = d.total_points - ISNULL(dlt.points_earned, 0),
            wins = wins - CASE WHEN dlt.final_position = 1 THEN 1 ELSE 0 END,
            pole_positions = pole_positions - CASE WHEN dlt.final_position = 1 THEN 1 ELSE 0 END
        FROM Driver d
        JOIN deleted dlt ON d.driver_id = dlt.driver_id;
        
        UPDATE d
        SET 
            total_points = d.total_points + 
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
                END,
            wins = wins + CASE WHEN i.final_position = 1 THEN 1 ELSE 0 END,
            pole_positions = pole_positions + CASE WHEN i.final_position = 1 THEN 1 ELSE 0 END
        FROM Driver d
        JOIN inserted i ON d.driver_id = i.driver_id;
        
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
        JOIN inserted i ON p.driver_id = i.driver_id AND p.car_id = i.car_id AND p.race_id = i.race_id;
    END
END;































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
    
    UPDATE Team
    SET total_points = (
        SELECT SUM(total_points)
        FROM Driver
        WHERE Driver.team_id = Team.team_id
    )
    FROM Team
    JOIN inserted i ON Team.team_id = i.team_id;
END