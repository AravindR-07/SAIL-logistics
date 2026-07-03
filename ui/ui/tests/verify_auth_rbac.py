
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print("Testing Authentication Flow...")
    
    # 1. Test Login (Success)
    print("\n[1] Testing Valid Login (role: corporate)")
    try:
        payload = {"username": "corporate", "password": "password123"}
        resp = requests.post(f"{BASE_URL}/api/login", json=payload)
        
        if resp.status_code == 200:
            data = resp.json()
            token = data.get('token')
            print(f"SUCCESS: Login successful. Token obtained.")
            print(f"User Role: {data['user']['role']}")
        else:
            print(f"FAILED: Login failed. {resp.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"FAILED: Could not connect to backend. Is it running? {e}")
        sys.exit(1)

    # 2. Test Login (Failure)
    print("\n[2] Testing Invalid Credentials")
    resp = requests.post(f"{BASE_URL}/api/login", json={"username": "corporate", "password": "wrongpassword"})
    if resp.status_code == 401:
        print("SUCCESS: Rejected invalid credentials.")
    else:
        print(f"FAILED: Should have rejected. Status: {resp.status_code}")

    # 3. Test Protected Route (Accessing /api/me)
    print("\n[3] Testing Protected Route (/api/me)")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/me", headers=headers)
    if resp.status_code == 200:
        print(f"SUCCESS: Accessed protected route. User: {resp.json()['name']}")
    else:
        print(f"FAILED: Access denied. {resp.text}")
        
    print("\nVerification Complete.")

if __name__ == "__main__":
    test_auth_flow()
