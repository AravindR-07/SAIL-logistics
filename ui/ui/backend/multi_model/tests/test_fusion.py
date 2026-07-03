
import unittest
from backend.multi_model.fusion import fuse_solutions

class TestMMDASFusion(unittest.TestCase):

    def setUp(self):
        self.original_state = {
            "vessels": {
                "V1": {"id": "V1", "demurrage_rate": 1000, "cargo_type": "Coal"},
                "V2": {"id": "V2", "demurrage_rate": 2000, "cargo_type": "IronOre"}
            },
            "ports": {} 
        }
        self.milp_sol = {
            "status": "OPTIMAL",
            "assignments": {
                "vessel_berth": {"V1": "B1", "V2": "B2"}
            },
            "objective_value": 500
        }
        self.heuristic_sol = {
            "status": "HEURISTIC_OPTIMAL",
            "assignments": {
                "vessel_berth": {"V1": "B1", "V2": "B2"}
            },
            "objective_value": 400
        }
        self.rl_sol = {}
        self.twin_state = self.original_state

    def test_consensus_met(self):
        """Should detect consensus when assignments match."""
        result = fuse_solutions(self.original_state, self.milp_sol, self.rl_sol, self.heuristic_sol, self.twin_state)
        evidence = result["fusion_evidence"]
        
        self.assertTrue(evidence["consensus_met"], "Consensus should be True when models agree")
        self.assertEqual(result["final_solution"]["source"], "MILP", "Should prefer MILP on consensus if scores roughly similar or just first sorted")

    def test_fallback_on_disagreement(self):
        """Should pick highest score when models disagree."""
        # Force huge discrepancy
        self.heuristic_sol["assignments"] = {"vessel_berth": {"V2": "B1"}} # Only V2 assigned
        
        # MMDAS logic calculates score based on KPI (Throughput * W - Cost * W)
        # MILP assigns 2 vessels (+200 throughput)
        # Heuristic assigns 1 vessel (+100 throughput)
        # MILP should win
        
        result = fuse_solutions(self.original_state, self.milp_sol, self.rl_sol, self.heuristic_sol, self.twin_state)
        evidence = result["fusion_evidence"]
        
        self.assertFalse(evidence["consensus_met"], "Consensus should be False")
        self.assertEqual(result["final_solution"]["source"], "MILP")

    def test_heuristic_wins_on_milp_failure(self):
        """If MILP fails, Heuristic should be chosen."""
        self.milp_sol["status"] = "FAILED"
        self.milp_sol["assignments"] = {}
        
        result = fuse_solutions(self.original_state, self.milp_sol, self.rl_sol, self.heuristic_sol, self.twin_state)
        
        self.assertEqual(result["final_solution"]["source"], "Heuristic")

if __name__ == '__main__':
    unittest.main()
