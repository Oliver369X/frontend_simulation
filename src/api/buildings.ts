import { Building, BuildingCreateRequest } from '../types';
import { API_URL } from '../config';

// Usando proxy
export async function getBuildings(): Promise<Building[]> {
    console.log('Fetching buildings from:', `${API_URL}/buildings`); // Debug
    const response = await fetch(`${API_URL}/buildings`);
    if (!response.ok) {
        const error = await response.text();
        console.error('Error response:', error); // Debug
        throw new Error(`Error fetching buildings: ${error}`);
    }
    const data = await response.json();
    console.log('Received buildings:', data); // Debug
    return data.buildings;
}

export async function createBuilding(building: BuildingCreateRequest): Promise<Building> {
    console.log('Creating building:', building); // Debug
    const response = await fetch(`${API_URL}/buildings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(building)
    });
    if (!response.ok) {
        const error = await response.text();
        console.error('Error response:', error); // Debug
        throw new Error(`Error creating building: ${error}`);
    }
    const data = await response.json();
    console.log('Created building:', data); // Debug
    return data.building;
} 