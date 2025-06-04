
-- Register a New Race Participation
CREATE PROCEDURE dbo.RegisterParticipation
    @driver_id INT,
    @car_id INT,
    @race_id INT,
    @final_position INT = NULL,
    @points_earned INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check driver eligibility using UDF
    IF dbo.IsDriverEligible(@driver_id) = 0
    BEGIN
        RAISERROR('Driver is not eligible (must be 18+)', 16, 1);
        RETURN -1;
    END
    
    -- Insert participation
    INSERT INTO Participation (driver_id, car_id, race_id, final_position, points_earned)
    VALUES (@driver_id, @car_id, @race_id, @final_position, @points_earned);
    
    -- If points weren't provided, calculate them
    IF @points_earned IS NULL AND @final_position IS NOT NULL
    BEGIN
        SET @points_earned = CASE 
            WHEN @final_position = 1 THEN 25
            WHEN @final_position = 2 THEN 18
            WHEN @final_position = 3 THEN 15
            WHEN @final_position = 4 THEN 12
            WHEN @final_position = 5 THEN 10
            WHEN @final_position = 6 THEN 8
            WHEN @final_position = 7 THEN 6
            WHEN @final_position = 8 THEN 4
            WHEN @final_position = 9 THEN 2
            WHEN @final_position = 10 THEN 1
            ELSE 0
        END;
        
        UPDATE Participation
        SET points_earned = @points_earned
        WHERE driver_id = @driver_id AND car_id = @car_id AND race_id = @race_id;
    END
    
    -- Update driver's total points
    UPDATE Driver
    SET total_points = total_points + ISNULL(@points_earned, 0)
    WHERE driver_id = @driver_id;
    
    -- If won the race, increment wins (using your existing trigger)
    IF @final_position = 1
    BEGIN
        UPDATE Driver
        SET wins = wins + 1
        WHERE driver_id = @driver_id;
    END
    
    RETURN 0;
END;

-- Get Team Report
CREATE PROCEDURE dbo.GetTeamReport
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.team_id,
        t.name AS team_name,
        dbo.GetTeamTotalPoints(t.team_id) AS total_points,
        COUNT(DISTINCT d.driver_id) AS driver_count,
        SUM(d.wins) AS total_wins,
        SUM(d.pole_positions) AS total_poles
    FROM Team t
    LEFT JOIN Driver d ON t.team_id = d.team_id
    GROUP BY t.team_id, t.name
    ORDER BY total_points DESC;
END;

-- Transfer Driver to Another Team
CREATE PROCEDURE dbo.TransferDriver
    @driver_id INT,
    @new_team_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @old_team_id INT;
    DECLARE @car_id INT;
    
    -- Get current team and car
    SELECT @old_team_id = team_id FROM Driver WHERE driver_id = @driver_id;
    SELECT @car_id = car_id FROM Car WHERE driver_id = @driver_id;
    
    -- Validate
    IF @old_team_id IS NULL
    BEGIN
        RAISERROR('Driver not found', 16, 1);
        RETURN -1;
    END
    
    IF NOT EXISTS (SELECT 1 FROM Team WHERE team_id = @new_team_id)
    BEGIN
        RAISERROR('New team not found', 16, 1);
        RETURN -1;
    END
    
    -- Update driver's team
    UPDATE Driver
    SET team_id = @new_team_id
    WHERE driver_id = @driver_id;
    
    -- Update car's team if exists
    IF @car_id IS NOT NULL
    BEGIN
        UPDATE Car
        SET team_id = @new_team_id
        WHERE car_id = @car_id;
        
        -- End current Belongs relationship
        UPDATE Belongs
        SET end_date = GETDATE()
        WHERE car_id = @car_id AND driver_id = @driver_id AND team_id = @old_team_id AND end_date IS NULL;
        
        -- Create new Belongs relationship
        INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
        VALUES (@car_id, @driver_id, @new_team_id, GETDATE(), NULL);
    END
    
    RETURN 0;
END;