
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.evaluation.evaluator import Evaluator

def test_kpi_evaluation():
    print("Testing KPI Evaluation Logic...")
    
    # 1. Create a mock state with HIGH KPIs
    mock_state = {
        "kpis": {
            "demurrage": 15000.0,         # > 10,000 (Warning)
            "total_delay_hours": 60.0,    # > 48 (Critical)
            "total_cost": 200000.0,       # > 150,000 (Warning)
            "risk_score": 90.0            # Existing logic
        },
        "plants": {},
        "vessels": {},
        "ports": {}
    }
    
    mock_result = {
        "assignments": {"vessel_berth": {}},
        "status": "FEASIBLE"
    }

    evaluator = Evaluator()
    report = evaluator.evaluate(mock_state, mock_result)
    
    # 2. Verify Output
    print("\n--- Evaluation Report ---")
    print(f"Mistake Detected: {report['mistake_detected']}")
    
    kpi_warnings = report.get("evidence", {}).get("kpi_warnings", [])
    print(f"KPI Warnings Found: {len(kpi_warnings)}")
    for w in kpi_warnings:
        print(f" - {w}")

    # Assertions
    if not report['mistake_detected']:
        print("FAILED: Should have detected mistake due to CRITICAL delay.")
        sys.exit(1)
        
    if len(kpi_warnings) < 3:
        print("FAILED: Should have caught all 3 KPI violations.")
        sys.exit(1)
        
    print("\nSUCCESS: KPI Evaluation verified.")

if __name__ == "__main__":
    test_kpi_evaluation()
