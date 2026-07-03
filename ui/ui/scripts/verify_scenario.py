
import requests
import json
import time

BASE_URL = "http://localhost:8000"
HEADERS = {"X-API-KEY": "dev-api-key-123", "Content-Type": "application/json"}

def run_scenario():
    print("--- Starting Self-Healing Scenario ---")
    
    # 1. Check Health
    try:
        r = requests.get(f"{BASE_URL}/health", headers=HEADERS)
        print(f"Server Health: {r.status_code}")
    except Exception:
        print("Server not running. Please start app.py first.")
        return

    # 2. Trigger Event (Vessel Delay)
    print("\n[Step 1] Triggering Vessel Delay Event...")
    payload = {
        "event_type": "vessel_delay",
        "target_id": "V001",
        "payload": {"hours": 12}
    }
    r = requests.post(f"{BASE_URL}/api/event", json=payload, headers=HEADERS)
    data = r.json()
    print("Impact Analysis:", json.dumps(data['impact_analysis'], indent=2))
    print("AI Recommendation:", json.dumps(data['proposed_actions'], indent=2))
    
    rec = data['proposed_actions']
    best_action = None
    if 'best_candidate' in rec and rec['best_candidate']:
        # Extract meaningful action to apply
        # For this demo, we mock constructing the action object
        best_action = {"type": "reassign_rake", "rake_id": "R001", "vessel_id": "V002"} 
    
    # 3. Apply Healing Action
    if best_action:
        print(f"\n[Step 2] Applying Action: {best_action}")
        r = requests.post(f"{BASE_URL}/api/heal", json={"action": best_action}, headers=HEADERS)
        print("Heal Status:", r.json().get("status"))
        print("\n--- Scenario Complete: System Healed ---")
    else:
        print("\nNo actionable recommendation found.")

if __name__ == "__main__":
    run_scenario()
