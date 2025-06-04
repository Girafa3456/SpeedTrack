from f_utils import execute_sql_file, execute_triggers_file, execute_udfs_file, execute_stored_procedures_file, execute_dropall_file

execute_dropall_file('dropAll.sql')
print("All database objects dropped successfully!")

execute_sql_file('tablesDB.sql')
print("Database tables created successfully!")

execute_sql_file('populateDB.sql')
print("Database populated successfully!")

execute_sql_file('indexes.sql')
print("Database indexes created successfully!")

execute_triggers_file('triggers.sql')
print("Database triggers created successfully!")

execute_udfs_file('udfs.sql')
print("User-Defined Functions created successfully!")

execute_stored_procedures_file('storedProcedures.sql')
print("Stored Procedures created successfully!")
