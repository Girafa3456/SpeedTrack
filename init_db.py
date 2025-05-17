from f_utils import execute_sql_file

execute_sql_file('tablesDB.sql')
print("Database tables created successfully!")

execute_sql_file('populateDB.sql')
print("Database populated successfully!")