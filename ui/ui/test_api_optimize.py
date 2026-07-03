
import requests
import json

def test_optimize():
    url = "http://localhost:8000/api/optimize"
    headers = {
        "X-API-KEY": "dev-api-key-123", # Matches config.py
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Calling {url}...")
        response = requests.post(url, headers=headers, json={}, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            print("\n--- API Response Success ---")
            
            # Check Evaluation Report
            if "evaluation_report" in data:
                print("\n[Evaluation Report]")
                print(json.dumps(data["evaluation_report"], indent=2))
            else:
                print("\n[ERROR] 'evaluation_report' missing from response!")
                
            # Check Explanation
            if "explanation" in data:
                print("\n[LLM Explanation]")
                print(data["explanation"])
            else:
                print("\n[ERROR] 'explanation' missing from response!")
                
        else:
            print(f"\n[ERROR] Status Code: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\n[EXCEPTION] {str(e)}")

if __name__ == "__main__":
    test_optimize()
