import requests
import json

headers = {"X-API-KEY": "dev-api-key-123"}
base_url = "http://localhost:8000/api"

# 1. Reset
print("1. Resetting state...")
requests.post(f"{base_url}/event", headers=headers, json={"event_type": "reset"})

# 2. Load Risky Scenario
print("2. Loading risky scenario...")
resp = requests.post(f"{base_url}/event", headers=headers, json={"event_type": "load_scenario"})
print(f"   Response: {resp.status_code}")

# 3. Check State
print("3. Fetching state...")
state_resp = requests.get(f"{base_url}/state", headers=headers)
state = state_resp.json()

# 4. Print Plant Data
print("\n=== PLANT DATA ===")
for p_id, p_data in state.get("plants", {}).items():
    print(f"{p_id}:")
    print(f"  Inventory: {p_data.get('inventory')}")
    print(f"  Processing Rate: {p_data.get('processing_rate')}")
    print(f"  Stock Days: {p_data.get('stock_days')}")
    
# 5. Print Evaluation Report
print("\n=== EVALUATION REPORT ===")
eval_report = state.get("evaluation_report", {})
print(f"Mistake Detected: {eval_report.get('mistake_detected')}")
print(f"Wrong Decision: {eval_report.get('wrong_decision')}")
print(f"Root Cause: {eval_report.get('root_cause')}")
