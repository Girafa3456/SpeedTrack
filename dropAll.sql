USE p6g9;
GO

-- Drop all triggers on tables
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += 'DROP TRIGGER [' + OBJECT_SCHEMA_NAME(object_id) + '].[' + name + '];' + CHAR(13)
FROM sys.triggers
WHERE parent_class = 1;

EXEC sp_executesql @sql;

-- Drop all udfs
SET @sql = N'';
SELECT @sql += 'DROP FUNCTION [' + OBJECT_SCHEMA_NAME(object_id) + '].[' + name + '];' + CHAR(13)
FROM sys.objects
WHERE type IN ('FN', 'IF', 'TF');

EXEC sp_executesql @sql;

-- Drop all stored procedures
SET @sql = N'';
SELECT @sql += 'DROP PROCEDURE [' + OBJECT_SCHEMA_NAME(object_id) + '].[' + name + '];' + CHAR(13)
FROM sys.procedures;

EXEC sp_executesql @sql;

-- Drop all tables 
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