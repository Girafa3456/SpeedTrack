import pyodbc

server = 'mednat.ieeta.pt,8101'  # Use this format (no instance name, only port)
username = 'p6g9'
password = '!Gbej5kgTr!'
driver = '{ODBC Driver 17 for SQL Server}'
database = 'p6g9'

conn_str = f"""
    DRIVER={driver};
    SERVER={server};
    DATABASE={database};   
    UID={username};
    PWD={password};
    TrustServerCertificate=yes;
"""

try:
    with pyodbc.connect(conn_str, autocommit=True) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        print("✅ Connection successful and query ran!")
except Exception as e:
    print("❌ Connection failed:", e)

