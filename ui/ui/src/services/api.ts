
const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'dev-api-key-123';

export interface KPIState {
    total_cost: number;
    demurrage: number;
    [key: string]: any;
}

export interface TwinState {
    simulation_time: string;
    kpis?: KPIState;
    ports: Record<string, any>;
    plants: Record<string, any>;
    vessels: Record<string, any>;
    rakes: Record<string, any>;
    events_log: any[];
    history?: any[]; // Added for graphs
    evaluation_report?: any; // Added for Decision Evaluation Layer
}

export const api = {
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
    }),

    async getState(): Promise<TwinState | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/state`, {
                headers: this.getHeaders(),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch state:', error);
            return null;
        }
    },

    async triggerEvent(eventType: string, targetId: string, payload: any = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/event`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    event_type: eventType,
                    target_id: targetId,
                    payload: payload,
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Event trigger failed:', error);
            return null;
        }
    },

    async runOptimization() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/optimize`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({}),
            });
            return await response.json();
        } catch (error) {
            console.error('Optimization failed:', error);
            return null;
        }
    },

    async launchVisualizer() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/launch-visualizer`, {
                method: 'POST',
                headers: this.getHeaders(),
            });
            return await response.json();
        } catch (error) {
            console.error('Visualizer launch failed:', error);
            return null;
        }
    }
};
