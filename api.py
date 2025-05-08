from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

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


if __name__ == '__main__':
    app.run(debug=True)