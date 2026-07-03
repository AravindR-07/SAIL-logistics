
import sys
import os
import json
from dataclasses import dataclass

# Ensure backend modules can be imported
sys.path.append(os.getcwd())

from backend.evaluation.evaluator import Evaluator

def run_verification():
    evaluator = Evaluator()
    print("=== Verifying Decision Evaluation Layer ===\n")

    # --- Test Case 1: Physical Constraint Violation (Draft) ---
    print("[Test 1] Checking Constraint Violation Detection (Draft)...")
    state_draft_violation = {
        "vessels": {
            "V_Heavy": {"id": "V_Heavy", "name": "Heavy Ship", "draft": 18.0}
        },
        "ports": {
            "P1": {
                "berths": {
                    "B_Shallow": {"id": "B_Shallow", "max_draft": 10.0}
                }
            }
        },
        "plants": {}
    }
    result_bad_assignment = {
        "assignments": {
            "vessel_berth": {"V_Heavy": "B_Shallow"}
        }
    }
    
    report_1 = evaluator.evaluate(state_draft_violation, result_bad_assignment)
    if report_1["mistake_detected"] and "Constraint" in report_1["root_cause"]:
        print("  [PASS] SUCCESS: Detected Draft Violation.")
        print(f"     Reason: {report_1['wrong_decision']}")
    else:
        print("  [FAIL] FAILED: Did not detect draft violation.")
        print(json.dumps(report_1, indent=2))
    print("-" * 50)


    # --- Test Case 2: Counterfactual Analysis (Unnecessary Wait) ---
    print("[Test 2] Checking Counterfactual Reasoning (Vessel Left Unassigned)...")
    state_unassigned = {
        "vessels": {
            "V_Waiting": {"id": "V_Waiting", "name": "Waiting Ship", "draft": 10.0}
        },
        "ports": {
            "P1": {
                "berths": {
                    "B_Free": {"id": "B_Free", "max_draft": 12.0}
                }
            }
        },
        "plants": {}
    }
    result_empty = {
        "assignments": {
            "vessel_berth": {} # Empty assignment despite valid berth
        }
    }
    
    report_2 = evaluator.evaluate(state_unassigned, result_empty)
    if report_2["mistake_detected"] and "unassigned" in report_2["wrong_decision"]:
        print("  [PASS] SUCCESS: Detected Missed Opportunity (Counterfactual).")
        print(f"     Correction: {report_2['correct_decision']}")
    else:
        print("  [FAIL] FAILED: Did not detect ignored vessel.")
        print(json.dumps(report_2, indent=2))
    print("-" * 50)

    # --- Test Case 3: Business Logic (Stockout Risk) ---
    print("[Test 3] Checking Business Logic (Stockout Risk)...")
    state_stockout = {
        "vessels": {},
        "ports": {},
        "plants": {
            "Plant_Critical": {"id": "Plant_Critical", "name": "Steel Plant A", "stock_days": 1.5}
        }
    }
    result_ok = {"assignments": {}}
    
    report_3 = evaluator.evaluate(state_stockout, result_ok)
    if report_3["mistake_detected"] and "Stock Critical" in report_3["wrong_decision"]:
         print("  [PASS] SUCCESS: Detected Critical Stock Level.")
         print(f"     Issue: {report_3['wrong_decision']}")
    else:
        print("  [FAIL] FAILED: Did not detect stockout risk.")
        print(json.dumps(report_3, indent=2))
        
    print("\n=== Verification Complete ===")

if __name__ == "__main__":
    run_verification()
