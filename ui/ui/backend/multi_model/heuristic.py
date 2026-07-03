
"""
Fast Heuristic Solver.
Provides a deterministic baseline solution using greedy logic.
Idempotent and stateless.
"""

from typing import Dict, Any, List
from copy import deepcopy

def heuristic_solution(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a schedule using a greedy strategy:
    1. Sort vessels by Demurrage Rate (priority).
    2. Assign to first available, compatible berth.
    3. Returns result in same format as MILPScheduler.
    """
    
    results = {
        "status": "HEURISTIC_OPTIMAL",
        "objective_value": 0.0,
        "assignments": {
            "vessel_berth": {},
            "rake_vessel": {}
        },
        "source": "Heuristic"
    }

    # Deep copy to purely simulate
    vessels = deepcopy(state.get("vessels", {}))
    ports = deepcopy(state.get("ports", {}))
    
    # Sort vessels: High demurrage cost first (Greedy choice)
    sorted_vessels = sorted(vessels.values(), key=lambda v: v.get('demurrage_rate', 0), reverse=True)
    
    berth_occupancy = {} # Track assignments
    
    objective_score = 0
    
    # 1. Assign Vessel -> Berth
    for v in sorted_vessels:
        assigned = False
        v_id = v.get('id')
        v_draft = v.get('draft', 0)
        
        # Try finding a berth
        best_berth = None
        
        # Iterate all ports/berths
        for p_id, p_data in ports.items():
            for b_id, b_data in p_data.get('berths', {}).items():
                
                # Check 1: Already occupied by this heuristic?
                if b_id in berth_occupancy:
                    continue
                    
                # Check 2: Physical Constraint (Draft)
                if v_draft > b_data.get('max_draft', 10):
                    continue
                    
                # Check 3: Status
                if b_data.get('status') != 'operational':
                    continue
                    
                # Found a candidate
                best_berth = b_id
                break # Take first fit (Greedy)
            
            if best_berth:
                break
                
        if best_berth:
            results["assignments"]["vessel_berth"][v_id] = best_berth
            berth_occupancy[best_berth] = v_id
            # Rough score estimation: +1000 for berthed, -Cost for delay avoided
            objective_score += 1000 + v.get('demurrage_rate', 0)
    
    results["objective_value"] = objective_score
    return results
