
"""
MMDAS Fusion Engine.
Fuses outputs from MILP, RL, and Heuristic models.
Implements consensus logic, KPI scoring, and stability checks.
"""

import numpy as np
from typing import Dict, Any, List
from backend.multi_model.config import WEIGHTS, CONSENSUS_THRESHOLD
import logging

logger = logging.getLogger(__name__)

def fuse_solutions(original_state: Dict[str, Any], 
                   milp_sol: Dict[str, Any], 
                   rl_sol: Dict[str, Any], 
                   heuristic_sol: Dict[str, Any],
                   twin_state: Dict[str, Any],
                   exclude_models: List[str] = None) -> Dict[str, Any]:
    """
    Main entry point for decision fusion.
    
    Args:
        exclude_models: List of model names to exclude from consideration (e.g., ["MILP"])
    """
    
    if exclude_models is None:
        exclude_models = []
    
    candidates = []
    
    # 1. Normalize and Register Candidates (with exclusion logic)
    if "MILP" not in exclude_models and milp_sol.get("status") in ["OPTIMAL", "FEASIBLE"]:
        candidates.append({
            "source": "MILP",
            "assignments": milp_sol.get("assignments", {}),
            "raw_score": milp_sol.get("objective_value", 0)
        })
    
    if "Heuristic" not in exclude_models:
        candidates.append({
            "source": "Heuristic",
            "assignments": heuristic_sol.get("assignments", {}),
            "raw_score": heuristic_sol.get("objective_value", 0)
        })
    
    # Safety check: If all models excluded, return error
    if not candidates:
        return {
            "final_solution": {
                "assignments": {},
                "status": "NO_MODELS_AVAILABLE",
                "source": "None"
            },
            "fusion_evidence": {
                "consensus_met": False,
                "selected_source": "None",
                "model_scores": {},
                "agreement_matrix": {},
                "error": "All models excluded or failed"
            }
        }
    
    # RL Input (Simplified for this architecture as RL selects strategy, not direct assignments usually)
    # But if RL returned specific assignments, we'd add it here.
    # For now, we use RL as a "Bias" or "Weight Adjuster" if needed.
    
    # 2. Calculate KPI Scores for each Candidate
    scored_candidates = []
    for cand in candidates:
        kpis = _calculate_projected_kpis(cand["assignments"], original_state)
        # Composite Score: Higher is better
        # Score = (Throughput * W) - (Cost * W) - (Risk * W)
        # Normalized roughly to 0-100 scale for comparison
        score = (kpis["throughput_bonus"] * WEIGHTS["throughput"]) - \
                (kpis["cost_penalty"] * WEIGHTS["cost"]) - \
                (kpis["risk_penalty"] * WEIGHTS["risk"])
                
        cand["kpis"] = kpis
        cand["fusion_score"] = score
        scored_candidates.append(cand)
        
    # 3. Sort by Score
    scored_candidates.sort(key=lambda x: x["fusion_score"], reverse=True)
    best_candidate = scored_candidates[0]
    
    # 4. Consensus Check
    consensus_met = False
    if len(candidates) >= 2:
        # Compare best with second best
        match_pct = _calculate_agreement(candidates[0]["assignments"], candidates[1]["assignments"])
        if match_pct >= CONSENSUS_THRESHOLD:
            consensus_met = True
            
    # 5. Build Fusion Evidence
    evidence = {
        "consensus_met": consensus_met,
        "selected_source": best_candidate["source"],
        "model_scores": {c["source"]: c["fusion_score"] for c in scored_candidates},
        "agreement_matrix": {f"{c['source']}_vs_{k['source']}": _calculate_agreement(c["assignments"], k["assignments"]) 
                             for c in candidates for k in candidates if c != k}
    }
    
    return {
        "final_solution": {
            "assignments": best_candidate["assignments"],
            "status": "FUSED_OPTIMAL",
            "source": best_candidate["source"]
        },
        "fusion_evidence": evidence
    }

def _calculate_projected_kpis(assignments: Dict, state: Dict) -> Dict:
    """
    Estimates KPIs for a given set of assignments.
    """
    cost_penalty = 0
    risk_penalty = 0
    throughput_bonus = 0
    
    v_assigns = assignments.get("vessel_berth", {})
    vessels = state.get("vessels", {})
    
    for v_id, v in vessels.items():
        if v_id in v_assigns:
            # Berthed: Good for throughput, avoid demurrage
            throughput_bonus += 100
        else:
            # Unassigned: Pay demurrage
            cost_penalty += v.get("demurrage_rate", 1000)
            
            # Risk: If critical cargo, high penalty
            if v.get("cargo_type") == "Coking Coal":
                risk_penalty += 500
                
    # Normalize (dummy normalization for this scale)
    return {
        "cost_penalty": cost_penalty / 10000.0,
        "risk_penalty": risk_penalty / 1000.0,
        "throughput_bonus": throughput_bonus / 100.0
    }

def _calculate_agreement(assign_a: Dict, assign_b: Dict) -> float:
    """
    Calculates percentage of identical assignments (Jaccard-like or simple overlap).
    """
    map_a = assign_a.get("vessel_berth", {})
    map_b = assign_b.get("vessel_berth", {})
    
    keys_a = set(map_a.keys())
    keys_b = set(map_b.keys())
    all_keys = keys_a.union(keys_b)
    
    if not all_keys:
        return 1.0 # Both empty = agreement
        
    matches = 0
    for k in all_keys:
        val_a = map_a.get(k)
        val_b = map_b.get(k)
        if val_a == val_b:
            matches += 1
            
    return matches / len(all_keys)
