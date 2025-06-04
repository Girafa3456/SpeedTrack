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
# Person #
# POST
@app.route('/api/persons', methods=['POST'])
def create_person():
    data = request.get_json()
    query = """
    INSERT INTO Person (nif, name, birth_date, nationality)
    VALUES (?, ?, ?, ?)
    """
    params = (
        data['nif'],
        data['name'],
        parse_date(data['birth_date']),
        data['nationality']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Person created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/persons/<string:nif>', methods=['PUT'])
def update_person(nif):
    data = request.get_json()
    query = """
    UPDATE Person 
    SET name = ?, birth_date = ?, nationality = ?
    WHERE nif = ?
    """
    params = (
        data.get('name'),
        parse_date(data.get('birth_date')),
        data.get('nationality'),
        nif
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Person not found'}), 404
        return jsonify({'message': 'Person updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/persons/<string:nif>', methods=['DELETE'])
def delete_person(nif):
    query = "DELETE FROM Person WHERE nif = ?"
    try:
        affected_rows = execute_query(query, (nif,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Person not found'}), 404
        return jsonify({'message': 'Person deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# GET
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

# Driver #
# POST
@app.route('/api/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    query = """
    INSERT INTO Driver (driver_id, total_points, wins, pole_positions, nif, team_id)
    VALUES (?, ?, ?, ?, ?, ?)
    """
    params = (
        data['driver_id'],
        data.get('total_points', 0),
        data.get('wins', 0),
        data.get('pole_positions', 0),
        data['nif'],
        data['team_id']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Driver created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/drivers/<int:driver_id>', methods=['PUT'])
def update_driver(driver_id):
    data = request.get_json()
    query = """
    UPDATE Driver 
    SET total_points = ?, wins = ?, pole_positions = ?, team_id = ?
    WHERE driver_id = ?
    """
    params = (
        data.get('total_points'),
        data.get('wins'),
        data.get('pole_positions'),
        data.get('team_id'),
        driver_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Driver not found'}), 404
        return jsonify({'message': 'Driver updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    query = "DELETE FROM Driver WHERE driver_id = ?"
    try:
        affected_rows = execute_query(query, (driver_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Driver not found'}), 404
        return jsonify({'message': 'Driver deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    query = """
    SELECT 
        d.driver_id,
        d.total_points,
        d.wins,
        d.pole_positions,
        d.nif,
        d.team_id,
        p.name as person_name,
        t.name as team_name
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
# Sponsor #
# POST
@app.route('/api/sponsors', methods=['POST'])
def create_sponsor():
    data = request.get_json()
    query = """
    INSERT INTO Sponsor (sponsor_id, contract_value, sector, team_id, nif)
    VALUES (?, ?, ?, ?, ?)
    """
    params = (
        data['sponsor_id'],
        data['contract_value'],
        data['sector'],
        data['team_id'],
        data['nif']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Sponsor created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# PUT
@app.route('/api/sponsors/<int:sponsor_id>', methods=['PUT'])
def update_sponsor(sponsor_id):
    data = request.get_json()
    query = """
    UPDATE Sponsor 
    SET contract_value = ?, sector = ?, team_id = ?
    WHERE sponsor_id = ?
    """
    params = (
        data.get('contract_value'),
        data.get('sector'),
        data.get('team_id'),
        sponsor_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Sponsor not found'}), 404
        return jsonify({'message': 'Sponsor updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# DELETE
@app.route('/api/sponsors/<int:sponsor_id>', methods=['DELETE'])
def delete_sponsor(sponsor_id):
    query = "DELETE FROM Sponsor WHERE sponsor_id = ?"
    try:
        affected_rows = execute_query(query, (sponsor_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Sponsor not found'}), 404
        return jsonify({'message': 'Sponsor deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    query = """
    SELECT 
        s.sponsor_id,
        s.contract_value,
        s.sector,
        s.team_id,
        s.nif,
        p.name as person_name,
        t.name as team_name
    FROM Sponsor s
    JOIN Person p ON s.nif = p.nif
    JOIN Team t ON s.team_id = t.team_id
    ORDER BY s.contract_value DESC
    """
    sponsors = execute_query(query)
    
    formatted_sponsors = []
    for sponsor in sponsors:
        formatted_sponsor = {
            **sponsor,
            'contract_value': float(sponsor['contract_value']) if sponsor['contract_value'] is not None else 0.0
        }
        formatted_sponsors.append(formatted_sponsor)
    
    return jsonify(formatted_sponsors)

@app.route('/api/sponsors/<int:sponsor_id>', methods=['GET'])
def get_sponsor(sponsor_id):
    sponsor_query = """
    SELECT s.sponsor_id, p.name, p.birth_date, p.nationality, 
           s.contract_value, s.sector, t.name as team_name, t.team_id
    FROM Sponsor s
    JOIN Person p ON s.nif = p.nif
    JOIN Team t ON s.team_id = t.team_id
    WHERE s.sponsor_id = ?
    """
    sponsor = execute_query(sponsor_query, (sponsor_id,))
    if not sponsor:
        return jsonify({'error': 'Sponsor not found'}), 404
    
    sponsorships_query = """
    SELECT sp.start_date, sp.end_date, t.name as team_name, t.team_id
    FROM Sponsorship sp
    JOIN Team t ON sp.team_id = t.team_id
    WHERE sp.sponsor_id = ?
    """
    sponsorships = execute_query(sponsorships_query, (sponsor_id,))
    for s in sponsorships:
        s['start_date'] = s['start_date'].isoformat() if s['start_date'] else None
        s['end_date'] = s['end_date'].isoformat() if s['end_date'] else None
    
    response = {
        'sponsor_id': sponsor[0]['sponsor_id'],
        'name': sponsor[0]['name'],
        'birth_date': sponsor[0]['birth_date'].isoformat() if sponsor[0]['birth_date'] else None,
        'nationality': sponsor[0]['nationality'],
        'contract_value': float(sponsor[0]['contract_value']) if sponsor[0]['contract_value'] is not None else 0.0,
        'sector': sponsor[0]['sector'],
        'team': {
            'team_id': sponsor[0]['team_id'],
            'name': sponsor[0]['team_name']
        },
        'sponsorships': sponsorships
    }
    
    return jsonify(response)

# Mechanic #
# POST
@app.route('/api/mechanics', methods=['POST'])
def create_mechanic():
    data = request.get_json()
    query = """
    INSERT INTO Mechanic (mechanic_id, specialty, experience, team_id, nif)
    VALUES (?, ?, ?, ?, ?)
    """
    params = (
        data['mechanic_id'],
        data['specialty'],
        data['experience'],
        data['team_id'],
        data['nif']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Mechanic created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/mechanics/<int:mechanic_id>', methods=['PUT'])
def update_mechanic(mechanic_id):
    data = request.get_json()
    query = """
    UPDATE Mechanic 
    SET specialty = ?, experience = ?, team_id = ?
    WHERE mechanic_id = ?
    """
    params = (
        data.get('specialty'),
        data.get('experience'),
        data.get('team_id'),
        mechanic_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Mechanic not found'}), 404
        return jsonify({'message': 'Mechanic updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/mechanics/<int:mechanic_id>', methods=['DELETE'])
def delete_mechanic(mechanic_id):
    query = "DELETE FROM Mechanic WHERE mechanic_id = ?"
    try:
        affected_rows = execute_query(query, (mechanic_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Mechanic not found'}), 404
        return jsonify({'message': 'Mechanic deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/mechanics', methods=['GET'])
def get_mechanics():
    query = """
    SELECT 
        m.mechanic_id,
        m.specialty,
        m.experience,
        m.nif,
        m.team_id,
        p.name as person_name,
        t.name as team_name
    FROM Mechanic m
    JOIN Person p ON m.nif = p.nif
    JOIN Team t ON m.team_id = t.team_id
    """
    mechanics = execute_query(query)
    return jsonify(mechanics)

@app.route('/api/mechanics/<int:mechanic_id>', methods=['GET'])
def get_mechanic(mechanic_id):
    mechanic_query = """
    SELECT m.mechanic_id, p.name, p.birth_date, p.nationality, 
           m.specialty, m.experience, t.name as team_name, t.team_id
    FROM Mechanic m
    JOIN Person p ON m.nif = p.nif
    JOIN Team t ON m.team_id = t.team_id
    WHERE m.mechanic_id = ?
    """
    mechanic = execute_query(mechanic_query, (mechanic_id,))
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404
    
    works_on_query = """
    SELECT w.idate, w.edate, c.car_id, c.number as car_number, 
           t.name as team_name, t.team_id
    FROM Works_On w
    JOIN Car c ON w.car_id = c.car_id
    JOIN Team t ON c.team_id = t.team_id
    WHERE w.mechanic_id = ?
    """
    works_on = execute_query(works_on_query, (mechanic_id,))
    for w in works_on:
        w['idate'] = w['idate'].isoformat() if w['idate'] else None
        w['edate'] = w['edate'].isoformat() if w['edate'] else None
    
    response = {
        'mechanic_id': mechanic[0]['mechanic_id'],
        'name': mechanic[0]['name'],
        'birth_date': mechanic[0]['birth_date'].isoformat() if mechanic[0]['birth_date'] else None,
        'nationality': mechanic[0]['nationality'],
        'specialty': mechanic[0]['specialty'],
        'experience': mechanic[0]['experience'],
        'team': {
            'team_id': mechanic[0]['team_id'],
            'name': mechanic[0]['team_name']
        },
        'works_on': works_on
    }
    
    return jsonify(response)

# Team #
# POST
@app.route('/api/teams', methods=['POST'])
def create_team():
    data = request.get_json()
    query = """
    INSERT INTO Team (team_id, name, budget)
    VALUES (?, ?, ?)
    """
    params = (
        data['team_id'],
        data['name'],
        data['budget']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Team created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/teams/<int:team_id>', methods=['PUT'])
def update_team(team_id):
    data = request.get_json()
    query = """
    UPDATE Team 
    SET name = ?, budget = ?
    WHERE team_id = ?
    """
    params = (
        data.get('name'),
        data.get('budget'),
        team_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Team not found'}), 404
        return jsonify({'message': 'Team updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    query = "DELETE FROM Team WHERE team_id = ?"
    try:
        affected_rows = execute_query(query, (team_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Team not found'}), 404
        return jsonify({'message': 'Team deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
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

# Car #
# POST
@app.route('/api/cars', methods=['POST'])
def create_car():
    data = request.get_json()
    query = """
    INSERT INTO Car (car_id, number, chassis_model, engine_type, weight, manufacture_date, team_id, driver_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = (
        data['car_id'],
        data['number'],
        data['chassis_model'],
        data['engine_type'],
        data['weight'],
        parse_date(data['manufacture_date']),
        data['team_id'],
        data['driver_id']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Car created successfully'}), 201
    except Exception as e:      
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/cars/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    data = request.get_json()
    query = """
    UPDATE Car 
    SET number = ?, chassis_model = ?, engine_type = ?, weight = ?, 
        manufacture_date = ?, team_id = ?, driver_id = ?
    WHERE car_id = ?
    """
    params = (
        data.get('number'),
        data.get('chassis_model'),
        data.get('engine_type'),
        data.get('weight'),
        parse_date(data.get('manufacture_date')),
        data.get('team_id'),
        data.get('driver_id'),
        car_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Car not found'}), 404
        return jsonify({'message': 'Car updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# DELETE
@app.route('/api/cars/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    query = "DELETE FROM Car WHERE car_id = ?"
    try:
        affected_rows = execute_query(query, (car_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Car not found'}), 404
        return jsonify({'message': 'Car deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/cars', methods=['GET'])
def get_cars():
    query = """
    SELECT 
        c.car_id, 
        c.number, 
        c.chassis_model, 
        c.engine_type,
        c.weight,
        c.manufacture_date,
        t.name as team_name, 
        p.name as driver_name
    FROM Car c
    LEFT JOIN Team t ON c.team_id = t.team_id
    LEFT JOIN Driver d ON c.driver_id = d.driver_id
    LEFT JOIN Person p ON d.nif = p.nif
    """
    cars = execute_query(query)
    
    # Format the dates and handle null values
    formatted_cars = []
    for car in cars:
        formatted_car = {
            **car,
            'weight': float(car['weight']) if car['weight'] is not None else 0.0,
            'manufacture_date': car['manufacture_date'].isoformat() if car['manufacture_date'] else None
        }
        formatted_cars.append(formatted_car)
    
    return jsonify(formatted_cars)

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

# Race #
# POST
@app.route('/api/races', methods=['POST'])
def create_race():
    data = request.get_json()
    query = """
    INSERT INTO Race (race_id, circuit, date, track, weather_conditions)
    VALUES (?, ?, ?, ?, ?)
    """
    params = (
        data['race_id'],
        data['circuit'],
        parse_date(data['date']),
        data['track'],
        data['weather_conditions']
    )
    try:
        execute_query(query, params, fetch=False)
        return jsonify({'message': 'Race created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# PUT
@app.route('/api/races/<int:race_id>', methods=['PUT'])
def update_race(race_id):
    data = request.get_json()
    query = """
    UPDATE Race 
    SET circuit = ?, date = ?, track = ?, weather_conditions = ?
    WHERE race_id = ?
    """
    params = (
        data.get('circuit'),
        parse_date(data.get('date')),
        data.get('track'),
        data.get('weather_conditions'),
        race_id
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Race not found'}), 404
        return jsonify({'message': 'Race updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/races/<int:race_id>', methods=['DELETE'])
def delete_race(race_id):
    query = "DELETE FROM Race WHERE race_id = ?"
    try:
        affected_rows = execute_query(query, (race_id,), fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Race not found'}), 404
        return jsonify({'message': 'Race deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/races', methods=['GET'])
def get_races():
    query = """
    SELECT 
        r.race_id,
        r.circuit,
        r.date,
        r.track,
        r.weather_conditions,
        COUNT(p.race_id) as participation_count
    FROM Race r
    LEFT JOIN Participation p ON r.race_id = p.race_id
    GROUP BY r.race_id, r.circuit, r.date, r.track, r.weather_conditions
    ORDER BY r.date DESC
    """
    races = execute_query(query)
    
    formatted_races = []
    for race in races:
        formatted_race = {
            **race,
            'date': race['date'].isoformat() if race['date'] else None,
            'participation_count': race['participation_count'] or 0
        }
        formatted_races.append(formatted_race)
    
    return jsonify(formatted_races)

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
# Participation #
# POST
@app.route('/api/participations', methods=['POST'])
def create_participation():
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Prepare parameters including output parameter
        params = [
            data['driver_id'],
            data['car_id'],
            data['race_id'],
            data.get('final_position'),
            None  # Placeholder for output parameter
        ]
        
        # Execute stored procedure
        cursor.execute("{CALL dbo.RegisterParticipation(?, ?, ?, ?, ?)}", params)
        
        points_earned = params[4]
        
        conn.commit()
        
        return jsonify({
            'message': 'Participation registered successfully',
            'points_earned': points_earned
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()
    
# PUT
@app.route('/api/participations', methods=['PUT'])
def update_participation():
    data = request.get_json()
    query = """
    UPDATE Participation 
    SET final_position = ?, points_earned = ?
    WHERE driver_id = ? AND car_id = ? AND race_id = ?
    """
    params = (
        data.get('final_position'),
        data.get('points_earned'),
        data['driver_id'],
        data['car_id'],
        data['race_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Participation not found'}), 404
        return jsonify({'message': 'Participation updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/participations', methods=['DELETE'])
def delete_participation():
    data = request.get_json()
    query = """
    DELETE FROM Participation
    WHERE driver_id = ? AND car_id = ? AND race_id = ?
    """
    params = (
        data['driver_id'],
        data['car_id'],
        data['race_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Participation not found'}), 404
        return jsonify({'message': 'Participation deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/participations', methods=['GET'])
def get_participations():
    query = """
    SELECT 
        p.driver_id,
        p.car_id,
        p.race_id,
        p.final_position,
        p.points_earned,
        per.name as driver_name,
        t.name as team_name,
        c.number as car_number,
        r.circuit as race_circuit
    FROM Participation p
    JOIN Driver d ON p.driver_id = d.driver_id
    JOIN Person per ON d.nif = per.nif
    JOIN Car c ON p.car_id = c.car_id
    JOIN Team t ON c.team_id = t.team_id
    JOIN Race r ON p.race_id = r.race_id
    """
    participations = execute_query(query)
    return jsonify(participations)


# Works_On #
# POST
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
    
# PUT
@app.route('/api/works_on', methods=['PUT'])
def update_works_on():
    data = request.get_json()
    query = """
    UPDATE Works_On 
    SET idate = ?, edate = ?
    WHERE mechanic_id = ? AND car_id = ?
    """
    params = (
        parse_date(data.get('idate')),
        parse_date(data.get('edate')),
        data['mechanic_id'],
        data['car_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Works_On relationship not found'}), 404
        return jsonify({'message': 'Works_On relationship updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/works_on', methods=['DELETE'])
def delete_works_on():
    data = request.get_json()
    query = """
    DELETE FROM Works_On
    WHERE mechanic_id = ? AND car_id = ?
    """
    params = (
        data['mechanic_id'],
        data['car_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Works_On relationship not found'}), 404
        return jsonify({'message': 'Works_On relationship deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
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

# Sponsorship #
# POST
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
    
# PUT
@app.route('/api/sponsorships', methods=['PUT'])
def update_sponsorship():
    data = request.get_json()
    query = """
    UPDATE Sponsorship 
    SET start_date = ?, end_date = ?
    WHERE sponsor_id = ? AND team_id = ?
    """
    params = (
        parse_date(data.get('start_date')),
        parse_date(data.get('end_date')),
        data['sponsor_id'],
        data['team_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Sponsorship not found'}), 404
        return jsonify({'message': 'Sponsorship updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/sponsorships', methods=['DELETE'])
def delete_sponsorship():
    data = request.get_json()
    query = """
    DELETE FROM Sponsorship
    WHERE sponsor_id = ? AND team_id = ?
    """
    params = (
        data['sponsor_id'],
        data['team_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Sponsorship not found'}), 404
        return jsonify({'message': 'Sponsorship deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
@app.route('/api/sponsorships', methods=['GET'])
def get_sponsorships():
    query = """
    SELECT 
        sp.sponsor_id,
        sp.team_id,
        sp.start_date,
        sp.end_date,
        p.name as sponsor_name,
        t.name as team_name
    FROM Sponsorship sp
    JOIN Sponsor s ON sp.sponsor_id = s.sponsor_id
    JOIN Person p ON s.nif = p.nif
    JOIN Team t ON sp.team_id = t.team_id
    ORDER BY sp.start_date DESC
    """
    sponsorships = execute_query(query)
    
    formatted_sponsorships = []
    for sponsorship in sponsorships:
        formatted_sponsorship = {
            **sponsorship,
            'start_date': sponsorship['start_date'].isoformat(),
            'end_date': sponsorship['end_date'].isoformat() if sponsorship['end_date'] else None
        }
        formatted_sponsorships.append(formatted_sponsorship)
    
    return jsonify(formatted_sponsorships)

# Belongs #
# POST
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
    
# PUT
@app.route('/api/belongs', methods=['PUT'])
def update_belongs():
    data = request.get_json()
    query = """
    UPDATE Belongs 
    SET start_date = ?, end_date = ?
    WHERE car_id = ? AND driver_id = ? AND team_id = ?
    """
    params = (
        parse_date(data.get('start_date')),
        parse_date(data.get('end_date')),
        data['car_id'],
        data['driver_id'],
        data['team_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Belongs relationship not found'}), 404
        return jsonify({'message': 'Belongs relationship updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# DELETE
@app.route('/api/belongs', methods=['DELETE'])
def delete_belongs():
    data = request.get_json()
    query = """
    DELETE FROM Belongs
    WHERE car_id = ? AND driver_id = ? AND team_id = ?
    """
    params = (
        data['car_id'],
        data['driver_id'],
        data['team_id']
    )
    try:
        affected_rows = execute_query(query, params, fetch=False)
        if affected_rows == 0:
            return jsonify({'error': 'Belongs relationship not found'}), 404
        return jsonify({'message': 'Belongs relationship deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# GET
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


@app.route('/api/teams/report', methods=['GET'])
def get_teams_report():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute stored procedure
        cursor.execute("{CALL dbo.GetTeamReport}")
        
        # Get results
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/drivers/<int:driver_id>/transfer', methods=['POST'])
def transfer_driver(driver_id):
    data = request.get_json()
    new_team_id = data.get('new_team_id')
    
    if not new_team_id:
        return jsonify({'error': 'new_team_id is required'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute stored procedure
        cursor.execute("{CALL dbo.TransferDriver(?, ?)}", (driver_id, new_team_id))
        conn.commit()
        
        return jsonify({'message': 'Driver transferred successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/drivers/<int:driver_id>/average_position', methods=['GET'])
def get_driver_average_position(driver_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute UDF
        cursor.execute("SELECT dbo.GetDriverAveragePosition(?)", (driver_id,))
        avg_position = cursor.fetchone()[0]
        
        return jsonify({'average_position': float(avg_position)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/teams/<int:team_id>/total_points', methods=['GET'])
def get_team_total_points(team_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute UDF
        cursor.execute("SELECT dbo.GetTeamTotalPoints(?)", (team_id,))
        total_points = cursor.fetchone()[0]
        
        return jsonify({'total_points': total_points})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)