import pyodbc
import re

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
    with open(filename, 'r', encoding='utf-8') as f:
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

def execute_triggers_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Divide por cada CREATE TRIGGER pero sin partir el contenido dentro del bloque
    trigger_blocks = re.split(r'(?=CREATE TRIGGER)', content, flags=re.IGNORECASE)

    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    for block in trigger_blocks:
        block = block.strip()
        if not block:
            continue
        try:
            cursor.execute(block)
            print("Executed:\n", block[:80].replace('\n', ' ') + "...")
        except Exception as e:
            print("Error executing block:\n", block[:80].replace('\n', ' ') + "...\n", e)

    cursor.close()
    conn.close()