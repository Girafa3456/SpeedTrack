from flask import Flask, jsonify, request
from flask_cors import CORS
import pyodbc
from datetime import datetime

app = Flask(__name__)
CORS(app)

server = 'mednat.ieeta.pt,8101'
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

def get_db_connection():
    return pyodbc.connect(conn_str, autocommit=True)

def parse_date(date_str):
    if date_str:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    return None

def execute_query(query, params=None, fetch=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
        else:
            conn.commit()
            return cursor.rowcount
    finally:
        cursor.close()
        conn.close()

### Endpoints ###
## Models ##
# Person
@app.route('/api/persons', methods=['GET'])
def get_persons():
    query = "SELECT * FROM Person"
    persons = execute_query(query)
    for p in persons:
        p['birth_date'] = p['birth_date'].isoformat() if p['birth_date'] else None
    return jsonify(persons)

@app.route('/api/persons/<string:nif>', methods=['GET'])
def get_person(nif):
    query = "SELECT * FROM Person WHERE nif = ?"
    person = execute_query(query, (nif,))
    if not person:
        return jsonify({'error': 'Person not found'}), 404
    person[0]['birth_date'] = person[0]['birth_date'].isoformat() if person[0]['birth_date'] else None
    return jsonify(person[0])

# Team
@app.route('/api/teams', methods=['GET'])
def get_teams():
    query = """
    SELECT t.*, 
           (SELECT COUNT(*) FROM Driver d WHERE d.team_id = t.team_id) as driver_count,
           (SELECT COUNT(*) FROM Sponsor s WHERE s.team_id = t.team_id) as sponsor_count
    FROM Team t
    """
    teams = execute_query(query)
    for t in teams:
        t['budget'] = float(t['budget']) if t['budget'] is not None else 0.0
    return jsonify(teams)

@app.route('/api/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team_query = "SELECT * FROM Team WHERE team_id = ?"
    team = execute_query(team_query, (team_id,))
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    

    drivers_query = """
    SELECT d.driver_id, p.name 
    FROM Driver d
    JOIN Person p ON d.nif = p.nif
    WHERE d.team_id = ?
    """
    drivers = execute_query(drivers_query, (team_id,))

    sponsors_query = """
    SELECT s.sponsor_id, p.name, s.contract_value
    FROM Sponsor s
    JOIN Person p ON s.nif = p.nif
    WHERE s.team_id = ?
    """
    sponsors = execute_query(sponsors_query, (team_id,))
    for s in sponsors:
        s['contract_value'] = float(s['contract_value']) if s['contract_value'] is not None else 0.0
    
    team[0]['drivers'] = drivers
    team[0]['sponsors'] = sponsors
    team[0]['budget'] = float(team[0]['budget']) if team[0]['budget'] is not None else 0.0
    
    return jsonify(team[0])

# Driver
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    query = """
    SELECT d.driver_id, p.name, t.name as team, 
           d.total_points, d.wins, d.pole_positions
    FROM Driver d
    JOIN Person p ON d.nif = p.nif
    JOIN Team t ON d.team_id = t.team_id
    """
    drivers = execute_query(query)
    return jsonify(drivers)

@app.route('/api/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    driver_query = """
    SELECT d.*, p.name, p.birth_date, p.nationality, t.name as team_name, t.team_id
    FROM Driver d
    JOIN Person p ON d.nif = p.nif
    JOIN Team t ON d.team_id = t.team_id
    WHERE d.driver_id = ?
    """
    driver = execute_query(driver_query, (driver_id,))
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    car_query = """
    SELECT car_id, number 
    FROM Car 
    WHERE driver_id = ?
    """
    cars = execute_query(car_query, (driver_id,))
    
    response = {
        'driver_id': driver[0]['driver_id'],
        'name': driver[0]['name'],
        'birth_date': driver[0]['birth_date'].isoformat() if driver[0]['birth_date'] else None,
        'nationality': driver[0]['nationality'],
        'team': {
            'team_id': driver[0]['team_id'],
            'name': driver[0]['team_name']
        },
        'stats': {
            'total_points': driver[0]['total_points'],
            'wins': driver[0]['wins'],
            'pole_positions': driver[0]['pole_positions']
        },
        'car': cars[0] if cars else None
    }
    
    return jsonify(response)

# Car
@app.route('/api/cars', methods=['GET'])
def get_cars():
    query = """
    SELECT c.car_id, c.number, t.name as team, p.name as driver, 
           c.chassis_model, c.engine_type
    FROM Car c
    LEFT JOIN Team t ON c.team_id = t.team_id
    LEFT JOIN Driver d ON c.driver_id = d.driver_id
    LEFT JOIN Person p ON d.nif = p.nif
    """
    cars = execute_query(query)
    return jsonify(cars)

@app.route('/api/cars/<int:car_id>', methods=['GET'])
def get_car(car_id):
    car_query = """
    SELECT c.*, t.name as team_name, t.team_id, 
           d.driver_id, p.name as driver_name
    FROM Car c
    LEFT JOIN Team t ON c.team_id = t.team_id
    LEFT JOIN Driver d ON c.driver_id = d.driver_id
    LEFT JOIN Person p ON d.nif = p.nif
    WHERE c.car_id = ?
    """
    car = execute_query(car_query, (car_id,))
    if not car:
        return jsonify({'error': 'Car not found'}), 404
    
    mechanics_query = """
    SELECT m.mechanic_id, p.name, m.specialty
    FROM Works_On w
    JOIN Mechanic m ON w.mechanic_id = m.mechanic_id
    JOIN Person p ON m.nif = p.nif
    WHERE w.car_id = ?
    """
    mechanics = execute_query(mechanics_query, (car_id,))
    
    response = {
        'car_id': car[0]['car_id'],
        'number': car[0]['number'],
        'chassis_model': car[0]['chassis_model'],
        'engine_type': car[0]['engine_type'],
        'weight': float(car[0]['weight']) if car[0]['weight'] is not None else 0.0,
        'manufacture_date': car[0]['manufacture_date'].isoformat() if car[0]['manufacture_date'] else None,
        'team': {
            'team_id': car[0]['team_id'],
            'name': car[0]['team_name']
        },
        'driver': {
            'driver_id': car[0]['driver_id'],
            'name': car[0]['driver_name']
        } if car[0]['driver_id'] else None,
        'mechanics': mechanics
    }
    
    return jsonify(response)

# Race
@app.route('/api/races', methods=['GET'])
def get_races():
    query = """
    SELECT r.*, 
           (SELECT COUNT(*) FROM Participation p WHERE p.race_id = r.race_id) as participation_count
    FROM Race r
    """
    races = execute_query(query)
    for r in races:
        r['date'] = r['date'].isoformat() if r['date'] else None
    return jsonify(races)

@app.route('/api/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    race_query = "SELECT * FROM Race WHERE race_id = ?"
    race = execute_query(race_query, (race_id,))
    if not race:
        return jsonify({'error': 'Race not found'}), 404
    
    participations_query = """
    SELECT p.final_position, p.points_earned, 
           d.driver_id, per.name as driver_name, 
           t.name as team_name, c.number as car_number
    FROM Participation p
    JOIN Driver d ON p.driver_id = d.driver_id
    JOIN Person per ON d.nif = per.nif
    JOIN Team t ON d.team_id = t.team_id
    JOIN Car c ON p.car_id = c.car_id
    WHERE p.race_id = ?
    ORDER BY p.final_position
    """
    participations = execute_query(participations_query, (race_id,))
    
    race[0]['date'] = race[0]['date'].isoformat() if race[0]['date'] else None
    race[0]['results'] = participations
    
    return jsonify(race[0])

## Relationships
# Participation
@app.route('/api/participations', methods=['GET'])
def get_participations():
    query = """
    SELECT p.*, 
           d.driver_id, per.name as driver_name,
           t.name as team_name,
           c.number as car_number,
           r.circuit as race_circuit, r.date as race_date
    FROM Participation p
    JOIN Driver d ON p.driver_id = d.driver_id
    JOIN Person per ON d.nif = per.nif
    JOIN Team t ON d.team_id = t.team_id
    JOIN Car c ON p.car_id = c.car_id
    JOIN Race r ON p.race_id = r.race_id
    """
    participations = execute_query(query)
    for p in participations:
        if 'race_date' in p:
            p['race_date'] = p['race_date'].isoformat() if p['race_date'] else None
    return jsonify(participations)

@app.route('/api/participations', methods=['POST'])
def create_participation():
    data = request.get_json()
    query = """
    INSERT INTO Participation (driver_id, car_id, race_id, final_position, points_earned)
    VALUES (?, ?, ?, ?, ?)
    """
    params = (
        data['driver_id'],
        data['car_id'],
        data['race_id'],
        data.get('final_position'),
        data.get('points_earned', 0)
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Participation created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Works_On
@app.route('/api/works_on', methods=['GET'])
def get_works_on():
    query = """
    SELECT w.*, 
           m.mechanic_id, p.name as mechanic_name, m.specialty,
           c.number as car_number, t.name as team_name
    FROM Works_On w
    JOIN Mechanic m ON w.mechanic_id = m.mechanic_id
    JOIN Person p ON m.nif = p.nif
    JOIN Car c ON w.car_id = c.car_id
    JOIN Team t ON c.team_id = t.team_id
    """
    works_on = execute_query(query)
    for w in works_on:
        w['idate'] = w['idate'].isoformat() if w['idate'] else None
        w['edate'] = w['edate'].isoformat() if w['edate'] else None
    return jsonify(works_on)

@app.route('/api/works_on', methods=['POST'])
def create_works_on():
    data = request.get_json()
    query = """
    INSERT INTO Works_On (mechanic_id, car_id, idate, edate)
    VALUES (?, ?, ?, ?)
    """
    params = (
        data['mechanic_id'],
        data['car_id'],
        parse_date(data['idate']),
        parse_date(data['edate'])
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Works_On relationship created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Sponsorship
@app.route('/api/sponsorships', methods=['GET'])
def get_sponsorships():
    query = """
    SELECT s.*, 
           sp.name as sponsor_name, sp_ent.sector,
           t.name as team_name
    FROM Sponsorship s
    JOIN Sponsor sp_ent ON s.sponsor_id = sp_ent.sponsor_id
    JOIN Person sp ON sp_ent.nif = sp.nif
    JOIN Team t ON s.team_id = t.team_id
    """
    sponsorships = execute_query(query)
    for s in sponsorships:
        s['start_date'] = s['start_date'].isoformat() if s['start_date'] else None
        s['end_date'] = s['end_date'].isoformat() if s['end_date'] else None
    return jsonify(sponsorships)

@app.route('/api/sponsorships', methods=['POST'])
def create_sponsorship():
    data = request.get_json()
    query = """
    INSERT INTO Sponsorship (sponsor_id, team_id, start_date, end_date)
    VALUES (?, ?, ?, ?)
    """
    params = (
        data['sponsor_id'],
        data['team_id'],
        parse_date(data['start_date']),
        parse_date(data['end_date'])
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Sponsorship created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Belongs
@app.route('/api/belongs', methods=['GET'])
def get_belongs():
    query = """
    SELECT b.*, 
           d.driver_id, p.name as driver_name,
           t.name as team_name,
           c.number as car_number
    FROM Belongs b
    JOIN Driver d ON b.driver_id = d.driver_id
    JOIN Person p ON d.nif = p.nif
    JOIN Team t ON b.team_id = t.team_id
    JOIN Car c ON b.car_id = c.car_id
    """
    belongs = execute_query(query)
    for b in belongs:
        b['start_date'] = b['start_date'].isoformat() if b['start_date'] else None
        b['end_date'] = b['end_date'].isoformat() if b['end_date'] else None
    return jsonify(belongs)

@app.route('/api/belongs', methods=['POST'])
def create_belongs():
    data = request.get_json()
    query = """
    INSERT INTO Belongs (car_id, driver_id, team_id, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
    """
    params = (
        data['car_id'],
        data['driver_id'],
        data['team_id'],
        parse_date(data['start_date']),
        parse_date(data['end_date'])
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Belongs relationship created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)