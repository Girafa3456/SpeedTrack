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

-- Assign points automatically on Participation insert if not provided
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
