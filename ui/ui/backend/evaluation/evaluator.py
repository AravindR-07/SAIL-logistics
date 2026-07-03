
import logging
import copy
import json
import random
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class Evaluator:
    """
    Decision Evaluation Layer.
    Detects, diagnoses, and explains mistakes made by optimization models.
    """

    def __init__(self):
        pass

    def evaluate(self, 
                 twin_state: Dict[str, Any], 
                 milp_result: Dict[str, Any], 
                 rl_action: Optional[int] = None) -> Dict[str, Any]:
        """
        Main entry point for evaluation.
        Returns a structured report on the quality and validity of the decision.
        """
        report = {
            "mistake_detected": False,
            "location": None,
            "wrong_decision": None,
            "correct_decision": None,
            "root_cause": None,
            "evidence": {
                "constraint_violations": [],
                "cross_model_disagreement": None,
                "counterfactual_cost_delta": 0.0,
                "stability_score": 1.0
            },
            "llm_explanation_ready_prompt": ""
        }

        # 1. Constraint Violation Detection
        violations = self._check_constraints(twin_state, milp_result)
        if violations:
            report["mistake_detected"] = True
            report["location"] = "milp_assignment"
            report["wrong_decision"] = str(violations[0])
            report["root_cause"] = "Optimization model violated physical constraints."
            report["evidence"]["constraint_violations"] = violations
            report["correct_decision"] = "Do not assign invalid vessel-berth pair."

        # 2. Cross-Model Disagreement (Heuristic vs MILP)
        # Heuristic: Assign if draft fits and berth free.
        if not report["mistake_detected"]:
            disagreement = self._check_cross_model(twin_state, milp_result)
            if disagreement:
                report["evidence"]["cross_model_disagreement"] = disagreement
                # We don't necessarily flag this as a "mistake" unless MILP is obviously worse, 
                # but valid for "diagnosis".
        
        # 3. Business Logic Validation (Stockout Risk - HIGH PRIORITY)
        if not report["mistake_detected"]:
            risks = self._check_business_logic(twin_state)
            if risks:
                report["mistake_detected"] = True
                report["location"] = "inventory_management"
                report["wrong_decision"] = f"Plant Stock Critical: {risks[0]}"
                report["root_cause"] = "Supply chain disruption or scheduling failure."
                report["correct_decision"] = "Prioritize rake dispatch to this plant immediately."

        # 4. Counterfactual Simulation (What if we swapped?)
        # Simple check: Could an unassigned vessel have been assigned?
        if not report["mistake_detected"]:
            better_option = self._run_counterfactuals(twin_state, milp_result)
            if better_option:
                report["mistake_detected"] = True
                report["location"] = "berth_assignment"
                report["wrong_decision"] = "Vessel left unassigned."
                report["correct_decision"] = f"Assign {better_option['vessel']} to {better_option['berth']}"
                report["root_cause"] = "Suboptimal local optima or timeout."
                report["evidence"]["counterfactual_cost_delta"] = better_option['score_gain']

        # 5. Sensitivity & Stability Analysis
        # Perturb draft/ETA slightly and see if assignment holds
        stability = self._analyze_stability(twin_state, milp_result)
        report["evidence"]["stability_score"] = stability
        if stability < 0.5:
             report["root_cause"] = report["root_cause"] or "Decision is highly sensitive to input noise."

        # 6. Financial & Operational Validation (KPI Checks)
        kpi_risks = self._check_kpis(twin_state)
        if kpi_risks:
            # We treat these as "Warnings" rather than "Mistakes" unless critical
            # But for visibility, we can flag them or add to evidence
            report["evidence"]["kpi_warnings"] = kpi_risks
            # If cost is extremely high, flag as mistake
            if any("CRITICAL" in r for r in kpi_risks):
                report["mistake_detected"] = True
                report["location"] = "financial_kpi"
                report["wrong_decision"] = "KPIs exceeded critical thresholds."
                report["root_cause"] = "Schedule results in unacceptable costs or delays."
                report["correct_decision"] = "optimize-retry with 'cost_minimization' focus."

        # 7. Generate LLM Prompt Context
        report["llm_explanation_ready_prompt"] = self._generate_prompt_context(report, milp_result)

        return report

    def _generate_prompt_context(self, report: Dict, result: Dict) -> str:
        """Generates the text snippet for the LLM."""
        
        prompt = ""
        
        # MMDAS Context
        if "fusion_evidence" in result:
             evidence = result["fusion_evidence"]
             prompt += f"DECISION ASSURANCE: Selected {evidence['selected_source']} model. "
             if evidence['consensus_met']:
                 prompt += "High consensus between models (Robust). "
             else:
                 prompt += "Low consensus (Sensitive). Heuristic fallback may have been used. "
                 
        if report["mistake_detected"]:
            prompt += (
                f"EVALUATION WARNING: A suboptimal risk was detected.\n"
                f"Issue: {report['wrong_decision']}\n"
                f"Root Cause: {report['root_cause']}\n"
                f"Recommended Correction: {report['correct_decision']}\n"
                f"Please explain why this error might have happened."
            )
        else:
             prompt += (
                 "EVALUATION SUCCESS: The plan has been verified against physical constraints and appears optimal.\n"
                 "No obvious errors found. Proceed with explaining the efficiency gains."
             )
             
        return prompt



    def _check_business_logic(self, state: Dict) -> List[str]:
        """Checks for high-level business risks like stockouts."""
        risks = []
        plants = state.get("plants", {})
        for p_id, p in plants.items():
            if p.get("stock_days", 5) < 3:
                risks.append(f"{p.get('name', p_id)} has only {p['stock_days']} days of stock.")
        return risks

    def _check_constraints(self, state: Dict, result: Dict) -> List[str]:
        """Checks specific physical constraints."""
        violations = []
        assignments = result.get("assignments", {}).get("vessel_berth", {})
        
        vessels = state.get("vessels", {})
        ports = state.get("ports", {})
        
        # Build berth map
        berth_map = {}
        for p in ports.values():
            for b_id, b in p.get("berths", {}).items():
                berth_map[b_id] = b

        for v_id, b_id in assignments.items():
            v = vessels.get(v_id)
            b = berth_map.get(b_id)
            
            if not v or not b: continue

            # Constraint A: Draft
            if v.get("draft", 0) > b.get("max_draft", 0):
                violations.append(f"Vessel {v_id} (Draft {v['draft']}) exceeds Berth {b_id} (Max {b['max_draft']})")

        return violations

    def _check_cross_model(self, state: Dict, result: Dict) -> Optional[str]:
        """Compares MILP output with a greedy heuristic."""
        # Greedy: Sort vessels by value (mock capacity) assignment
        # This is just a string check for the report
        milp_count = len(result.get("assignments", {}).get("vessel_berth", {}))
        
        # Heuristic count (naive)
        heuristic_count = 0
        vessels = state.get("vessels", {})
        assignments = []
        # Naively finding any fit
        ports = state.get("ports", {})
        used_berths = set()
        
        for v_id, v in vessels.items():
             for p in ports.values():
                 for b_id, b in p.get("berths", {}).items():
                     if b_id not in used_berths and v.get("draft", 0) <= b.get("max_draft", 0):
                         heuristic_count += 1
                         used_berths.add(b_id)
                         break
        
        if heuristic_count > milp_count:
             return f"Heuristic found {heuristic_count} assignments vs MILP {milp_count}. MILP underperforming."
        return None

    def _run_counterfactuals(self, state: Dict, result: Dict) -> Optional[Dict]:
        """Checks if an unassigned vessel could physically fit in an empty berth."""
        assignments = result.get("assignments", {}).get("vessel_berth", {})
        assigned_vessels = set(assignments.keys())
        occupied_berths = set(assignments.values())
        
        vessels = state.get("vessels", {})
        ports = state.get("ports", {})
        
        for v_id, v in vessels.items():
            if v_id not in assigned_vessels:
                # Check if it fits anywhere empty
                for p in ports.values():
                    for b_id, b in p.get("berths", {}).items():
                         if b_id not in occupied_berths:
                             if v.get("draft", 0) <= b.get("max_draft", 0):
                                 return {
                                     "vessel": v.get("name", v_id),
                                     "berth": b_id,
                                     "score_gain": 1000.0 # Based on MILP weights
                                 }
        return None

    def _analyze_stability(self, state: Dict, result: Dict) -> float:
        """
        Mock stability check. 
        In real impl, would re-run MILP with perturbed inputs.
        Here we assume deterministic unless 'risk_score' is high in state.
        """
        kpis = state.get("kpis", {})
        if kpis.get("risk_score", 0) > 80:
            return 0.4 # Unstable high risk
        return 0.9 # Stable

    def _check_kpis(self, state: Dict) -> List[str]:
        """
        Validates the state against Financial and Operational KPI thresholds.
        """
        kpis = state.get("kpis", {})
        warnings = []
        
        # Thresholds (Hardcoded for now, could be config)
        MAX_DEMURRAGE = 10000.0
        MAX_DELAY_HOURS = 48.0
        MAX_TOTAL_COST = 150000.0
        
        # 1. Demurrage Check
        demurrage = kpis.get("demurrage", 0.0)
        if demurrage > MAX_DEMURRAGE:
            warnings.append(f"Demurrage ${demurrage:,.2f} exceeds limit (${MAX_DEMURRAGE:,.2f})")
            
        # 2. Total Delay Check
        delays = kpis.get("total_delay_hours", 0.0)
        if delays > MAX_DELAY_HOURS:
            warnings.append(f"CRITICAL: Total Delay {delays}h exceeds limit ({MAX_DELAY_HOURS}h)")

        # 3. Total Cost Check
        total_cost = kpis.get("total_cost", 0.0)
        if total_cost > MAX_TOTAL_COST:
            warnings.append(f"Total Cost ${total_cost:,.2f} exceeds budget (${MAX_TOTAL_COST:,.2f})")
            
        return warnings


