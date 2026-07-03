
import requests
import json
import sys

def verify_mmdas():
    print("Testing MMDAS Integration & Feasibility Check...")
    try:
        base_url = "http://localhost:8000/api"
        headers = {"X-API-KEY": "dev-api-key-123"}
        
        # 1. Load Risky Scenario to force an issue
        print("1. Loading Risky Scenario...")
        resp_load = requests.post(f"{base_url}/event", headers=headers, json={"event_type": "load_scenario"})
        if resp_load.status_code != 200:
             print(f"[FAIL] Could not load scenario: {resp_load.text}")
             return

        # 2. Run Optimization
        print("2. Running Optimization...")
        response = requests.post(f"{base_url}/optimize", headers=headers, json={})
        
        if response.status_code != 200:
            print(f"FAILED: Status {response.status_code}")
            return
            
        data = response.json()
        status = data.get("status", "UNKNOWN")
        mistake_detected = data.get("evaluation_report", {}).get("mistake_detected", False)
        
        print(f"   -> Status: {status}")
        print(f"   -> Mistake Detected: {mistake_detected}")
        
        # Check for Fusion Evidence
        if "fusion_evidence" in data:
            print("[PASS] Fusion Evidence Found.")
        else:
            print("[FAIL] 'fusion_evidence' key missing.")

        # Check for Feasibility Enforcement
        if mistake_detected:
            if "WITH_RISK" in status:
                print("[PASS] Feasibility Check Enforced: Status correctly downgraded to WITH_RISK.")
            else:
                print(f"[FAIL] Feasibility Check Failed: Mistake detected but status is still {status}.")
        else:
            print("[INFO] No mistake detected, so status remains optimal (Expected if scenario didn't trigger risk).")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify_mmdas()
