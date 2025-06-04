import pyodbc
import re

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

def execute_udfs_file(filename):
    """Execute a SQL file containing User-Defined Functions"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    
    udf_blocks = re.split(r'(?=CREATE FUNCTION)', content, flags=re.IGNORECASE)

    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    for block in udf_blocks:
        block = block.strip()
        if not block:
            continue
        try:
            cursor.execute(block)
            print("Executed UDF:\n", block[:80].replace('\n', ' ') + "...")
        except Exception as e:
            print("Error executing UDF:\n", block[:80].replace('\n', ' ') + "...\n", e)

    cursor.close()
    conn.close()

def execute_stored_procedures_file(filename):
    """Execute a SQL file containing Stored Procedures"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

   
    proc_blocks = re.split(r'(?=CREATE PROCEDURE)', content, flags=re.IGNORECASE)

    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    for block in proc_blocks:
        block = block.strip()
        if not block:
            continue
        try:
            cursor.execute(block)
            print("Executed Procedure:\n", block[:80].replace('\n', ' ') + "...")
        except Exception as e:
            print("Error executing Procedure:\n", block[:80].replace('\n', ' ') + "...\n", e)

    cursor.close()
    conn.close()

def execute_dropall_file(filename):
    """Executes dropAll.sql which contains complex multi-statement T-SQL code."""
    import re
    with open(filename, 'r', encoding='utf-8') as f:
        sql = f.read()

    # Remove 'GO' statements, which are not understood by pyodbc
    sql = re.sub(r'^\s*GO\s*$', '', sql, flags=re.MULTILINE | re.IGNORECASE)

    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    try:
        cursor.execute(sql)
        print(f"Executed dropAll file: {filename}")
    except Exception as e:
        print(f"Error executing dropAll.sql:\n{e}")

    cursor.close()
    conn.close()