
export interface AuthResponse {
  access_token: string;
  user: {
    name: string;
    email: string;
  };
}


export interface VehicleSearchParams {
  brand: string;
  model: string;
  version: string;
  equipments: string; 
}


export interface SpecificationItem {
  label: string;
  value: string; 
}

export interface SpecificationCategory {
  categoryName: string;
  items: SpecificationItem[];
}

export interface VehicleResponse {
  brand: string;
  model: string;
  version: string;
  specifications: SpecificationCategory[];
}
