from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from f_utils import parse_date

app = Flask(__name__)
CORS(app)
# Change this to the right URL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/SpeedTrackRacing'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


### Models ###
class Person(db.Model):
    __tablename__ = 'person'
    nif = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    nationality = db.Column(db.String(50), nullable=False)

    driver = db.relationship('Driver', backref='person', uselist=False)
    sponsor = db.relationship('Sponsor', backref='person', uselist=False)
    mechanic = db.relationship('Mechanic', backref='person', uselist=False)

class Team(db.Model):
    __tablename__ = 'Team'
    team_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Numeric(15,2), nullable=False)

    drivers = db.relationship('Driver', backref='team')
    sponsors = db.relationship('Sponsor', backref='team')
    mechanics = db.relationship('Mechanic', backref='team')
    cars = db.relationship('Car', backref='team')
    sponsorship = db.relationship('Sponsorship', backref='team')

class Driver(db.Model):
    __tablename__ = 'Driver'
    driver_id = db.Column(db.Integer, primary_key=True)
    total_points = db.Column(db.Integer, nullable=False, default=0)
    wins = db.Column(db.Integer, nullable=False, default=0)
    pole_positions = db.Column(db.Integer, nullable=False, default=0)

    nif = db.Column(db.String(20), db.ForeignKey('Person.nif'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), nullable=False)

    participation = db.relationship('Participation', backref='driver')
    cars = db.relationship('Car', backref='driver')
    belongs = db.relationship('Belongs', backref='driver')

class Sponsor(db.Model):
    __tablename__ = 'Sponsor'
    sponsor_id = db.Column(db.Integer, primary_key=True)
    contract_value = db.Column(db.Numeric(15,2), nullable=False)
    sector = db.Column(db.String(50), nullable=False)

    nif = db.Column(db.String(20), db.ForeignKey('Person.nif'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), nullable=False)

    sponsorship = db.relationship('Sponsorship', backref='sponsor')


class Mechanic(db.Model):
    __tablename__ = 'Mechanic'
    mechanic_id = db.Column(db.Integer, primary_key=True)
    speciality = db.Column(db.String(50), nullable=False)
    experience = db.Column(db.Integer, nullable=False)

    nif = db.Column(db.String(20), db.ForeignKey('Person.nif'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), nullable=False)

    works_on = db.relationship('Works_On', backref='mechanic')


class Car(db.Model):
    __tablename__ = 'Car'
    car_id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    chassis_model = db.Column(db.String(50), nullable=False)
    engine_type = db.Column(db.String(50), nullable=False)
    weight = db.Column(db.Numeric(10,2), nullable=False)
    manufacture_date = db.Column(db.Date, nullable=False)

    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('Driver.driver_id'), nullable=False)

    participation = db.relationship('Participation', backref='car')
    works_on = db.relationship('Works_On', backref='car')
    belongs = db.relationship('Belongs', backref='car')

class Race(db.Model):
    __tablename__ = 'Race'
    race_id = db.Column(db.Integer, primary_key=True)
    circuit = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    track = db.Column(db.String(100), nullable=False)
    weather_conditions = db.Column(db.String(50), nullable=False)

    participation = db.relationship('Participation', backref='race')

### Relationships ###
class Participation(db.Model):
    __tablename__ = 'Participation'
    final_position = db.Column(db.Integer)
    points_earned = db.Column(db.Integer)

    driver_id = db.Column(db.Integer, db.ForeignKey('Driver.driver_id'), primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('Car.car_id'), primary_key=True)
    race_id = db.Column(db.Integer, db.ForeignKey('Race.race_id'), primary_key=True)

class Works_On(db.Model):
    __tablename__ = 'Works_On'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    mechanic_id = db.Column(db.Integer, db.ForeignKey('Mechanic.mechanic_id'), primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('Car.car_id'), primary_key=True)


class Sponsorship(db.Model):
    __tablename__ = 'Sponsorship'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    sponsor_id = db.Column(db.Integer, db.ForeignKey('Sponsor.sponsor_id'), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), primary_key=True)


class Belongs(db.Model):
    __tablename__ = 'Belongs'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    car_id = db.Column(db.Integer, db.ForeignKey('Car.car_id'), primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('Driver.driver_id'), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('Team.team_id'), primary_key=True)


### Endpoints ###
## Models ##
# Person
@app.route('/api/persons', methods=['GET'])
def get_persons():
    persons = Person.query.all()
    return jsonify([{
        'nif': p.nif,
        'name': p.name,
        'birth_date': p.birth_date.isoformat(),
        'nationality': p.nationality
    } for p in persons])
        


@app.route('api/persons/<string:nif>', methods=['GET'])
def get_person(nif):
    person = Person.query.get_or_404(nif)
    return jsonify({
        'nif': person.nif,
        'name': person.name,
        'birth_date': person.birth_date.isoformat(),
        'nationality': person.nationality
    })

# Team
@app.route('/api/teams', methods=['GET'])
def get_teams():
    teams = Team.query.all()
    return jsonify([{
        'team_id': t.team_id,
        'name': t.name,
        'budget': float(t.budget),
        'driver_count': len(t.drivers),
        'sponsor_count': len(t.sponsors)
    } for t in teams])

@app.route('/api/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = Team.query.get_or_404(team_id)
    return jsonify({
        'team_id': team.team_id,
        'name': team.name,
        'budget': float(team.budget),
        'drivers': [{
            'driver_id': d.driver_id,
            'name': d.person.name
        } for d in team.drivers],
        'sponsors': [{
            'sponsor_id': s.sponsor_id,
            'name': s.person.name,
            'contract_value': float(s.contract_value)
        } for s in team.sponsors]
    })

# Driver
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    drivers = Driver.query.all()
    return jsonify([{
        'driver_id': d.driver_id,
        'name': d.person.name,
        'team': d.team.name,
        'total_points': d.total_points,
        'wins': d.wins,
        'pole_positions': d.pole_positions
    } for d in drivers])

@app.route('/api/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    return jsonify({
        'driver_id': driver.driver_id,
        'name': driver.person.name,
        'birth_date': driver.person.birth_date.isoformat(),
        'nationality': driver.person.nationality,
        'team': {
            'team_id': driver.team.team_id,
            'name': driver.team.name
        },
        'stats': {
            'total_points': driver.total_points,
            'wins': driver.wins,
            'pole_positions': driver.pole_positions
        },
        'car': {
            'car_id': driver.cars[0].car_id if driver.cars else None,
            'number': driver.cars[0].number if driver.cars else None
        }
    })

# Car
@app.route('/api/cars', methods=['GET'])
def get_cars():
    cars = Car.query.all()
    return jsonify([{
        'car_id': c.car_id,
        'number': c.number,
        'team': c.team.name,
        'driver': c.driver.person.name if c.driver else None,
        'chassis_model': c.chassis_model,
        'engine_type': c.engine_type
    } for c in cars])

@app.route('/api/cars/<int:car_id>', methods=['GET'])
def get_car(car_id):
    car = Car.query.get_or_404(car_id)
    return jsonify({
        'car_id': car.car_id,
        'number': car.number,
        'chassis_model': car.chassis_model,
        'engine_type': car.engine_type,
        'weight': float(car.weight),
        'manufacture_date': car.manufacture_date.isoformat(),
        'team': {
            'team_id': car.team.team_id,
            'name': car.team.name
        },
        'driver': {
            'driver_id': car.driver.driver_id,
            'name': car.driver.person.name
        } if car.driver else None,
        'mechanics': [{
            'mechanic_id': w.mechanic.mechanic_id,
            'name': w.mechanic.person.name,
            'specialty': w.mechanic.specialty
        } for w in car.works_on]
    })

# Race
@app.route('/api/races', methods=['GET'])
def get_races():
    races = Race.query.all()
    return jsonify([{
        'race_id': r.race_id,
        'circuit': r.circuit,
        'date': r.date.isoformat(),
        'track': r.track,
        'weather': r.weather_conditions,
        'participation_count': len(r.participations)
    } for r in races])

@app.route('/api/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    race = Race.query.get_or_404(race_id)
    return jsonify({
        'race_id': race.race_id,
        'circuit': race.circuit,
        'date': race.date.isoformat(),
        'track': race.track,
        'weather_conditions': race.weather_conditions,
        'results': sorted([{
            'position': p.final_position,
            'driver': p.driver.person.name,
            'team': p.driver.team.name,
            'car_number': p.car.number,
            'points': p.points_earned
        } for p in race.participations], key=lambda x: x['position'] if x['position'] else 999)
    })

## Relationships
@app.route('/api/participations', methods=['POST'])
def create_participation():
    data = request.get_json()
    participation = Participation(
        driver_id=data['driver_id'],
        car_id=data['car_id'],
        race_id=data['race_id'],
        final_position=data.get('final_position'),
        points_earned=data.get('points_earned', 0)
    )
    db.session.add(participation)
    db.session.commit()
    return jsonify({'message': 'Participation created successfully'}), 201

@app.route('/api/works_on', methods=['POST'])
def create_works_on():
    data = request.get_json()
    works_on = Works_On(
        mechanic_id=data['mechanic_id'],
        car_id=data['car_id'],
        idate=parse_date(data['idate']),
        edate=parse_date(data['edate'])
    )
    db.session.add(works_on)
    db.session.commit()
    return jsonify({'message': 'Works_On relationship created successfully'}), 201

@app.route('/api/sponsorships', methods=['POST'])
def create_sponsorship():
    data = request.get_json()
    sponsorship = Sponsorship(
        sponsor_id=data['sponsor_id'],
        team_id=data['team_id'],
        start_date=parse_date(data['start_date']),
        end_date=parse_date(data['end_date'])
    )
    db.session.add(sponsorship)
    db.session.commit()
    return jsonify({'message': 'Sponsorship created successfully'}), 201

@app.route('/api/belongs', methods=['POST'])
def create_belongs():
    data = request.get_json()
    belongs = Belongs(
        car_id=data['car_id'],
        driver_id=data['driver_id'],
        team_id=data['team_id'],
        start_date=parse_date(data['start_date']),
        end_date=parse_date(data['end_date'])
    )
    db.session.add(belongs)
    db.session.commit()
    return jsonify({'message': 'Belongs relationship created successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)