
import { InventoryItem, Deployment } from '../types';

// A single, unified data source for all inventory items, their costs, and initial stock per yard.
export const initialInventoryData: InventoryItem[] = [
    { category: "A-Frame", item: "A-Frames - General", cost: 1.00, initialStock: { "Northwest Yard": 1000 } },
    { category: "A-Frame", item: "No Park A-Frames", cost: 1.00, initialStock: { "Southwest Yard": 800 } },
    { category: "Advanced Warning Signs", item: "Windmasters", cost: 1.95, initialStock: { "Southwest Yard": 200 } },
    { category: "Advanced Warning Signs", item: "Road Closed Ahead", cost: 1.88, initialStock: { "Northwest Yard": 150 } },
    { category: "Barricade", item: "Barricades", cost: 1.78, initialStock: { "Northwest Yard": 500 } },
    { category: "Delineator Device", item: "20 Inch Cones", cost: 1.00, initialStock: { "Southwest Yard": 3000 } },
    { category: "Delineator Device", item: "28 Inch Cones", cost: 1.00, initialStock: { "Northwest Yard": 2000 } },
    { category: "Delineator Device", item: "48 Inch Cones W/ Black Bases", cost: 1.00, initialStock: {} },
    { category: "Delineator Device", item: "Barrels", cost: 1.00, initialStock: { "Northwest Yard": 300 } },
    { category: "Delineator Device", item: "Knock Down Markers", cost: 1.00, initialStock: {} },
    { category: "Delineator Device", item: "Detour Route Markers", cost: 1.00, initialStock: {} },
    { category: "Delineator Device", item: "Water Fill Barriers", cost: 5.00, initialStock: { "Cromdale Yard": 50 } },
    { category: "Delineator Device", item: "Road Runners", cost: 1.70, initialStock: {} },
    { category: "Delineator Device", item: "Panel Cones With Chevrons", cost: 1.88, initialStock: {} },
    { category: "Delineator Device", item: "Tower Cones", cost: 1.00, initialStock: {} },
    { category: "Delineator Device", item: "Pexco", cost: 1.00, initialStock: {} },
    { category: "Delineator Device", item: "Delineators", cost: 1.00, initialStock: { "Southwest Yard": 1000 } },
    { category: "Info Signs", item: "Sign Covers", cost: 1.88, initialStock: {} },
    { category: "Info Signs", item: "Info Signs + Windmaster", cost: 2.65, initialStock: { "Cromdale Yard": 250 } },
    { category: "Miscellaneous Items", item: "Crowd Control Fencing (CCF)", cost: 1.70, initialStock: { "Cromdale Yard": 400 } },
    { category: "Miscellaneous Items", item: "Temp Stands", cost: 1.95, initialStock: { "Cromdale Yard": 250, "Gretzky Yard": 250 } },
    { category: "Miscellaneous Items", item: "Arrow Board Trailer", cost: 50.28, initialStock: { "Main Yard": 10 } },
    { category: "Miscellaneous Items", item: "Dms/Vms Trailer", cost: 130.94, initialStock: { "Main Yard": 5 } },
    { category: "Miscellaneous Items", item: "Aluminum Ramp", cost: 11.52, initialStock: { "Main Yard": 20 } },
    { category: "Miscellaneous Items", item: "Basic Rate General Item", cost: 2.00, initialStock: {} },
    { category: "Miscellaneous Items", item: "Securistar Fence", cost: 1.70, initialStock: {} },
    { category: "Miscellaneous Items", item: "Sandbags", cost: 1.00, initialStock: { "91st Street Yard": 5000 } },
];

export const initialDeployments: Deployment[] = [
    {
        id: "PM-1001",
        chargeOut: "Client A",
        deploymentDate: "2024-07-01",
        completionDate: "2024-07-05",
        dropOffDate: "2024-06-30",
        pickUpDate: "2024-07-06",
        totalDays: 5,
        event: "Downtown Music Festival",
        location: { street: "1st St", avenue: "Main St" },
        items: [
            { item: "A-Frames - General", yard: "Northwest Yard", quantity: 50 },
            { item: "Barricades", yard: "Northwest Yard", quantity: 200 },
            { item: "Windmasters", yard: "Southwest Yard", quantity: 20 },
            { item: "28 Inch Cones", yard: "Northwest Yard", quantity: 300 },
            { item: "Arrow Board Trailer", yard: "Main Yard", quantity: 1 } 
        ]
    },
    {
        id: "PM-1002",
        chargeOut: "Client B",
        deploymentDate: "2024-07-10",
        completionDate: "2024-07-12",
        dropOffDate: "2024-07-09",
        pickUpDate: "2024-07-13",
        totalDays: 3,
        event: "City Marathon 2024",
        location: { street: "5th Ave", avenue: "Broadway" },
        items: [
            { item: "No Park A-Frames", yard: "Southwest Yard", quantity: 100 },
            { item: "20 Inch Cones", yard: "Southwest Yard", quantity: 500 },
            { item: "Info Signs + Windmaster", yard: "Cromdale Yard", quantity: 40 },
            { item: "Crowd Control Fencing (CCF)", yard: "Cromdale Yard", quantity: 150 }
        ]
    },
    {
        id: "PM-1003",
        chargeOut: "Client C",
        deploymentDate: "2024-08-01",
        completionDate: "2024-08-30",
        dropOffDate: "2024-07-31",
        pickUpDate: "2024-08-31",
        totalDays: 30,
        event: "Main Street Construction",
        location: { street: "Main St", avenue: "Oak Ave" },
        items: [
            { item: "Barricades", yard: "Northwest Yard", quantity: 150 },
            { item: "Road Closed Ahead", yard: "Northwest Yard", quantity: 30 },
            { item: "Barrels", yard: "Northwest Yard", quantity: 100 },
            { item: "Dms/Vms Trailer", yard: "Main Yard", quantity: 2 }
        ]
    },
    {
        id: "PM-1004",
        chargeOut: "Client D",
        deploymentDate: "2024-09-05",
        completionDate: "2024-09-10",
        dropOffDate: "2024-09-04",
        pickUpDate: "2024-09-11",
        totalDays: 6,
        event: "Community Block Party",
        location: { street: "118 Ave", avenue: "95 St" },
        items: [
            { item: "Temp Stands", yard: "Gretzky Yard", quantity: 50 },
            { item: "Sandbags", yard: "91st Street Yard", quantity: 100 }
        ]
    }
];
