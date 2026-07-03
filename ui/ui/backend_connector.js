
/**
 * SAIL Digital Twin Backend Connector
 * 
 * This script bridges the existing frontend UI with the Python backend.
 * It listens for UI events and communicates with the backend APIs.
 */

const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'dev-api-key-123'; # Configure as needed

class BackendConnector {
    constructor() {
        this.connected = false;
        this.init();
    }

    async init() {
        console.log("Initializing Backend Connector...");
        if (await this.checkHealth()) {
            this.connected = true;
            console.log("Backend Connected Successfully.");
            this.attachListeners();
            this.startPolling();
        } else {
            console.error("Backend not reachable. Ensure server is running on port 8000.");
            // Retry logic could go here
        }
    }

    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    attachListeners() {
        // Map UI buttons to Backend Actions
        // Replace 'simulate-btn', 'heal-btn' with actual IDs from your DOM
        this.bindClick('simulate-btn', () => this.triggerSimulation());
        this.bindClick('heal-btn', () => this.triggerSelfHealing());
        this.bindClick('optimize-btn', () => this.runOptimization());

        console.log("Event listeners attached.");
    }

    bindClick(elementId, handler) {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                await handler();
            });
        } else {
            console.warn(`Element #${elementId} not found in DOM.`);
        }
    }

    async apiCall(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY
        };

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
            return await res.json();
        } catch (err) {
            console.error(`API Error ${endpoint}:`, err);
            return null;
        }
    }

    async triggerSimulation() {
        console.log("Triggering Simulation...");
        // Example event payload
        const payload = {
            event_type: "vessel_delay",
            target_id: "V001",
            payload: { hours: 4 }
        };

        const result = await this.apiCall('/api/event', 'POST', payload);
        if (result) {
            console.log("Simulation Result:", result);
            alert(`Simulation Impacts:\nCost Delta: ${result.impact_analysis.cost_delta}`);
            // Update UI widgets here
        }
    }

    async triggerSelfHealing() {
        console.log("Requesting Self-Healing...");
        // In a real flow, you'd pass the approved action from the simulation step
        const action = { type: "reassign_rake", rake_id: "R001", vessel_id: "V002" };
        const result = await this.apiCall('/api/heal', 'POST', { action });
        if (result) {
            alert("Self-Healing Action Applied!");
            this.refreshState();
        }
    }

    async runOptimization() {
        console.log("Running MILP Optimization...");
        const result = await this.apiCall('/api/optimize', 'POST', {});
        if (result) {
            console.log("Optimization Schedule:", result);
            alert(`Optimization Status: ${result.status}\nObjective: ${result.objective_value}`);
        }
    }

    async refreshState() {
        const state = await this.apiCall('/api/state');
        if (state) {
            // Update Dashboard UI Elements
            // e.g., document.getElementById('kpi-cost').innerText = state.kpis.total_cost;
            console.log("State Refreshed", state);
        }
    }

    startPolling() {
        // Poll for state updates every 30 seconds
        setInterval(() => this.refreshState(), 30000);
    }
}

// Auto-initialize when script loads
window.sailBackend = new BackendConnector();
