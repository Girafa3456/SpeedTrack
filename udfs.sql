-- Get driver's average position across all races
CREATE FUNCTION dbo.GetDriverAveragePosition (@driver_id INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @avg_position DECIMAL(5,2);
    
    SELECT @avg_position = AVG(CAST(final_position AS DECIMAL(5,2)))
    FROM Participation
    WHERE driver_id = @driver_id;
    
    RETURN ISNULL(@avg_position, 0);
END;

-- Get team's total points from all drivers
CREATE FUNCTION dbo.GetTeamTotalPoints (@team_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @total_points INT;
    
    SELECT @total_points = SUM(total_points)
    FROM Driver
    WHERE team_id = @team_id;
    
    RETURN ISNULL(@total_points, 0);
END;

-- Check if a driver 18 years or older
CREATE FUNCTION dbo.IsDriverEligible (@driver_id INT)
RETURNS BIT
AS
BEGIN
    DECLARE @is_eligible BIT;
    DECLARE @age INT;
    
    SELECT @age = DATEDIFF(YEAR, p.birth_date, GETDATE())
    FROM Driver d
    JOIN Person p ON d.nif = p.nif
    WHERE d.driver_id = @driver_id;
    
    SET @is_eligible = CASE WHEN @age >= 18 THEN 1 ELSE 0 END;
    
    RETURN @is_eligible;
END;