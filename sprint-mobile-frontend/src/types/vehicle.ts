export interface VehicleSearchParams {
  brand: string;
  model: string;
  version: string;
  equipments?: string;
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
  version?: string;
  specifications: SpecificationCategory[];
}

export interface HistoryItem {
  type?: 'search' | 'vehicle' | 'comparison';
  brand?: string;
  model?: string;
  version?: string;
  equipments?: string;
  id?: string;
  v1Brand?: string;
  v1Model?: string;
  v1Version?: string;
  v2Brand?: string;
  v2Model?: string;
  v2Version?: string;
}

