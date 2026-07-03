
import sys
import os

# Ensure backend module is visible
sys.path.append(os.getcwd())

from backend.evaluation.evaluator import Evaluator

def test_evaluator():
    print("Testing Evaluator Module...")
    
    # Mock Twin State
    state = {
        "vessels": {
            "V1": {"id": "V1", "name": "V_Deep", "draft": 15.0},
            "V2": {"id": "V2", "name": "V_Shallow", "draft": 8.0}
        },
        "ports": {
            "P1": {
                "berths": {
                    "B1": {"id": "B1", "max_draft": 10.0}, # Shallow Berth
                    "B2": {"id": "B2", "max_draft": 18.0}  # Deep Berth
                }
            }
        },
        "kpis": {"risk_score": 10}
    }
    
    # 1. Test Constraint Violation (V_Deep -> B1)
    bad_result = {
        "assignments": {
            "vessel_berth": {"V1": "B1"} # 15.0 draft > 10.0 max
        }
    }
    
    ev = Evaluator()
    report = ev.evaluate(state, bad_result)
    
    print("\n[Test 1] Constraint Violation Check:")
    if report["mistake_detected"]:
        print("SUCCESS: Mistake Detected")
        print(f"Reason: {report['wrong_decision']}")
    else:
        print("FAILURE: Failed to detect constraint violation")
        
    # 2. Test Counterfactual (V_Shallow unassigned but fits in B1)
    suboptimal_result = {
        "assignments": {
            "vessel_berth": {} # Empty
        }
    }
    
    report2 = ev.evaluate(state, suboptimal_result)
    print("\n[Test 2] Counterfactual Check:")
    if report2["mistake_detected"]:
        print("SUCCESS: Suboptimal Decision Detected")
        print(f"Recommendation: {report2['correct_decision']}")
    else:
        print("FAILURE: Failed to detect suboptimal plan")

if __name__ == "__main__":
    test_evaluator()
