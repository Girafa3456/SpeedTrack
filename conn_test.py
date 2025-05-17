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

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sys.tables")
tables = cursor.fetchall()
print("Tables in database:", tables)
cursor.close()
conn.close()

