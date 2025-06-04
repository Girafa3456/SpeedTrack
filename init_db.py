from f_utils import execute_sql_file, execute_triggers_file

execute_sql_file('tablesDB.sql')
print("Database tables created successfully!")

execute_sql_file('populateDB.sql')
print("Database populated successfully!")

execute_sql_file('indexes.sql')
print("Database indexes created successfully!")

execute_triggers_file('triggers.sql')
print("Database triggers created successfully!")