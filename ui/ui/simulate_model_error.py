import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_URL = "http://localhost:8000/api"
HEADERS = {"Content-Type": "application/json", "X-API-KEY": "dev-api-key-123"}

def simulate_error():
    """
    Simulates a scenario where the model 'fails' to prevent a stockout.
    1. Resets state.
    2. Manually updates state to have critical stock at Rourkela.
    3. Triggers evaluation (which happens on GET /state).
    """
    logger.info("1. Resetting State...")
    requests.post(f"{API_URL}/event", json={"event_type": "reset"}, headers=HEADERS)

    # We need a way to patch the state directly for simulation. 
    # Since we don't have a direct PATCH /state endpoint for specific values, 
    # we will use the 'param_update' event type which we might need to verify exists or create.
    # checking api_handlers.py... if not exists, we'll try to use a specific event 'plant_stock_update'
    
    # Actually, let's just use the 'update_params' event if available, or 'simulate_step'
    # But to be precise, let's inject a "mock" event that forces stock down.
    
    logger.info("2. Forcing Critical Stock Level at 'Rourkela'...")
    # We will assume a generic update event exists or we create a specific valid one.
    # Ideally, we should implement a specific debug endpoint for this, but let's try 'manual_override'
    
    payload = {
        "event_type": "manual_override",
        "target": "plants",
        "id": "Rourkela",
        "updates": {
            "inventory": {"Coal": 100.0}, 
            "processing_rate": 100.0 # Result: 1.0 day of stock
        }
    }
    
    # Note: We need to ensure api_handlers.py supports 'manual_override'. 
    # If not, I will add it briefly or use an existing mechanism.
    resp = requests.post(f"{API_URL}/event", json=payload, headers=HEADERS)
    if resp.status_code != 200:
        logger.error(f"Failed to update: {resp.text}")
        
        # Fallback: Let's try to 'consume' stock rapidly via multiple 'step' calls? No, too slow.
        # Let's modify api_handlers.py to accept 'manual_override' for demo purposes if it doesn't.
        pass
    else:
        logger.info("State updated successfully.")

    logger.info("3. Triggering Evaluation (GET /state)...")
    state_resp = requests.get(f"{API_URL}/state", headers=HEADERS)
    state = state_resp.json()
    
    if state.get("evaluation_report", {}).get("mistake_detected"):
        logger.info("SUCCESS: Model detected the error!")
        logger.info(f"Reason: {state['evaluation_report']['wrong_decision']}")
    else:
        logger.warning("FAILURE: Model did not detect the error.")

if __name__ == "__main__":
    simulate_error()
