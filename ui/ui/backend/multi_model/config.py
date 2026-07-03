
"""
MMDAS Configuration Table.
Defines weights, thresholds, and operational parameters for the multi-model fusion engine.
"""

import os

# --- Feature Flags ---
MMDAS_ENABLED = os.getenv("MMDAS_ENABLED", "true").lower() == "true"

# --- KPI Weights for Consensus Scoring ---
# Higher weight = more critical KPI
WEIGHTS = {
    "cost": 0.4,        # Minimizing demurrage is priority
    "delay": 0.3,       # Delays disrupt supply chain
    "risk": 0.2,        # Inventory stockout risk
    "throughput": 0.1   # Volume moved
}

# --- Consensus Parameters ---
CONSENSUS_THRESHOLD = 0.8  # 80% assignment match required to declare "Consensus"

# --- Stability Check ---
PERTURBATION_FACTOR = 0.1  # +/- 10% change to ETA/Demand for sensitivity check
STABILITY_THRESHOLD = 0.85 # If decision holds in 85% of perturbations, it's stable

# --- Heuristic Fallback ---
MAX_SOLVER_TIME = 10  # Seconds before falling back to heuristic in critical paths
