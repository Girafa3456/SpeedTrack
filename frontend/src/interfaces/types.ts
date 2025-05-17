export interface Person {
  nif: string;
  name: string;
  birth_date: string | null;
  nationality: string;
}

export interface Driver {
  driver_id: number;
  name: string;
  team: string;
  total_points: number;
  wins: number;
  pole_positions: number;
}

export interface Sponsor {
  sponsor_id: number;
  name: string;
  contract_value: number;
  sector: string;
  team_name: string;
}

export interface Mechanic {
  mechanic_id: number;
  name: string;
  specialty: string;
  experience: number;
  team_name: string;
}

export interface Team {
  team_id: number;
  name: string;
  budget: number;
  driver_count: number;
  sponsor_count: number;
}

export interface Car {
  car_id: number;
  number: number;
  team: string;
  driver: string;
  chassis_model: string;
  engine_type: string;
}

export interface Race {
  race_id: number;
  circuit: string;
  date: string;
  track: string;
  weather_conditions: string;
  participation_count: number;
}

export interface Participation {
  driver_id: number;
  driver_name: string;
  team_name: string;
  car_number: number;
  race_circuit: string;
  final_position: number;
  points_earned: number;
}

export interface WorksOn {
  mechanic_id: number;
  mechanic_name: string;
  car_number: number;
  team_name: string;
  idate: string;
  edate: string;
}

export interface Sponsorship {
  sponsor_id: number;
  sponsor_name: string;
  team_name: string;
  start_date: string;
  end_date: string;
}

export interface Belongs {
  driver_id: number;
  driver_name: string;
  team_name: string;
  car_number: number;
  start_date: string;
  end_date: string;
}