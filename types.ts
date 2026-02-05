
export interface InventoryItem {
  category: string;
  item: string;
  cost: number;
  initialStock: {
    [yard: string]: number;
  };
}

export interface DeployedItem {
  item: string; // Specific item name
  yard: string;
  quantity: number;
}

export interface Deployment {
  id: string; // PM #
  chargeOut: string;
  deploymentDate: string;
  completionDate: string;
  dropOffDate?: string;
  pickUpDate?: string;
  totalDays: number;
  event: string;
  location?: {
    street: string;
    avenue: string;
  };
  items: DeployedItem[];
  synced?: boolean;
}

export interface TotalInventoryItem {
  item: string;
  initial: number;
  deployed: number;
  remaining: number;
}
