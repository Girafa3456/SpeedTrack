export interface Person {
  nif: string;
  name: string;
  birth_date: string;
  nationality: string;
}


export interface Team {
  team_id: number;
  name: string;
  budget: number;
}

export interface Driver {
  driver_id: number;
  total_points: number;
  wins: number;
  pole_positions: number;
  nif: string;
  team_id: number;
}


export interface Sponsor {
  sponsor_id: number;
  contract_value: number;
  sector: string;
  nif: string;
  team_id: number;
}

export interface Mechanic {
  mechanic_id: number;
  specialty: string;
  experience: number;
  nif: string;
  team_id: number;
}

export interface Car {
  car_id: number;
  number: number;
  chassis_model: string;
  engine_type: string;
  weight: number;
  manufacture_date: string;
  team_id: number;
  driver_id: number;
}

export interface Race {
  race_id: number;
  circuit: string;
  date: string;
  track: string;
  weather_conditions: string;
}

export interface Participation {
  driver_id: number;
  car_id: number;
  race_id: number;
  final_position: number;
  points_earned: number;
}

export interface WorksOn {
  mechanic_id: number;
  car_id: number;
  idate: string;
  edate: string;
}

export interface Sponsorship {
  sponsor_id: number;
  team_id: number;
  start_date: string;
  end_date: string;
}

export interface Belongs {
  driver_id: number;
  team_id: number;
  car_id: number;
  start_date: string;
  end_date: string;
}