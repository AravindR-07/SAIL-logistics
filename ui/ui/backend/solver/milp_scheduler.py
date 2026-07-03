
from ortools.linear_solver import pywraplp
import pulp
import logging
from dataclasses import dataclass
from typing import Dict, List, Any
import datetime

logger = logging.getLogger(__name__)

class MILPScheduler:
    def __init__(self, timeout_seconds=30):
        self.timeout = timeout_seconds
        
    def solve_scheduling(self, twin_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Solves the berth allocation and rake assignment problem.
        Objective: Minimize total demurrage cost and rake delay time.
        """
        # Create solver
        solver = pywraplp.Solver.CreateSolver('CBC')
        if not solver:
            logger.warning("CBC solver not available, trying GLOP")
            solver = pywraplp.Solver.CreateSolver('GLOP')
            
        if not solver:
            return {"status": "FAILED", "error": "No solver available"}

        # Extract data
        vessels = twin_state.get('vessels', {})
        rakes = twin_state.get('rakes', {})
        ports = twin_state.get('ports', {})
        
        # Flatten berths
        berths = []
        for p_id, p_data in ports.items():
            for b_id, b_data in p_data.get('berths', {}).items():
                berths.append({'id': b_id, 'max_draft': b_data.get('max_draft', 10.0), 'port': p_id})
        
        # Variables
        # x_v_b: binary set to 1 if vessel v assigned to berth b
        x = {} 
        for v_id, v in vessels.items():
            for b in berths:
                if v['draft'] <= b['max_draft']:
                    x[(v_id, b['id'])] = solver.IntVar(0, 1, f'x_{v_id}_{b["id"]}')
        
        # y_r_v: binary set to 1 if rake r assigned to vessel v
        y = {}
        for r_id in rakes:
            for v_id in vessels:
                y[(r_id, v_id)] = solver.IntVar(0, 1, f'y_{r_id}_{v_id}')

        # Constraints
        
        # 1. Every vessel must be assigned to at most 1 berth
        for v_id in vessels:
            solver.Add(sum(x.get((v_id, b['id']), 0) for b in berths) <= 1)
            
        # 2. Every rake must be assigned to at most 1 vessel
        for r_id in rakes:
            solver.Add(sum(y.get((r_id, v_id), 0) for v_id in vessels) <= 1)
            
        # 3. Berth Capacity (Simplified: 1 vessel per berth for this snapshot)
        for b in berths:
            solver.Add(sum(x.get((v_id, b['id']), 0) for v_id in vessels) <= 1)
            
        # 4. Rake Assignment validity: Can only assign rake if vessel is berthed
        # y_rv <= sum(x_vb)
        for r_id in rakes:
            for v_id in vessels:
                is_berthed = sum(x.get((v_id, b['id']), 0) for b in berths)
                solver.Add(y[(r_id, v_id)] <= is_berthed)

        # Objective Function
        # Minimize unassigned vessels (high penalty) + unassigned rakes
        objective = solver.Objective()
        
        # Maximize assignments = Minimize negative assignments
        for v_id in vessels:
            # Reward for berthing
            for b in berths:
                if (v_id, b['id']) in x:
                    objective.SetCoefficient(x[(v_id, b['id'])], 1000)
                    
        for r_id in rakes:
            # Reward for rake moving cargo
            for v_id in vessels:
                objective.SetCoefficient(y[(r_id, v_id)], 100)
                
        objective.SetMaximization()
        
        # Solve
        status = solver.Solve()
        
        results = {
            "status": "OPTIMAL" if status == pywraplp.Solver.OPTIMAL else "FEASIBLE" if status == pywraplp.Solver.FEASIBLE else "FAILED",
            "objective_value": objective.Value(),
            "assignments": {
                "vessel_berth": {},
                "rake_vessel": {}
            }
        }
        
        if status in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
            for (v_id, b_id), var in x.items():
                if var.solution_value() > 0.5:
                    results["assignments"]["vessel_berth"][v_id] = b_id
                    
            for (r_id, v_id), var in y.items():
                if var.solution_value() > 0.5:
                    results["assignments"]["rake_vessel"][r_id] = v_id
                    
        return results
