import pyodbc

# Use the same connection string from your api.py
conn_str = """
DRIVER={ODBC Driver 17 for SQL Server};
SERVER=mednat.ieeta.pt,8101;
DATABASE=p6g9;
UID=p6g9;
PWD=!Gbej5kgTr!;
TrustServerCertificate=yes;
"""

def execute_sql_file(filename):
    with open(filename, 'r') as f:
        sql = f.read()
    
    # Split the SQL file into separate commands
    commands = sql.split(';')
    
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    for command in commands:
        if command.strip():
            try:
                cursor.execute(command)
                print(f"Executed: {command[:50]}...")
            except Exception as e:
                print(f"Error executing command: {e}")
    
    cursor.close()
    conn.close()

execute_sql_file('tablesDB.sql')
print("Database tables created successfully!")