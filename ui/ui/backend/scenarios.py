from datetime import datetime, timedelta

def get_risky_scenario_data():
    """
    Returns a Digital Twin state dictionary pre-seeded with risks.
    1. Stockout Risk at Rourkela (1.0 days)
    2. Vessel Delay (MV Titanic delayed 48h)
    3. Congestion (Paradip berth blocked)
    """
    now = datetime.now()
    
    return {
        "plants": {
            "Rourkela": {
                "id": "Rourkela",
                "inventory": {"Coal": 100.0}, # Low stock
                "processing_rate": 100.0,
                "buffer_capacity": 50000.0
            }
        },
        "vessels": [
            {
                "id": "V_RISK_001",
                "name": "MV High Risk",
                "eta": (now - timedelta(hours=2)).isoformat(), # Already arrived/late
                "original_eta": (now - timedelta(hours=50)).isoformat(), # 48h late
                "draft": 14.5,
                "cargo_type": "Coal", # Needed for Rourkela
                "capacity": 75000,
                "status": "waiting",
                "demurrage_rate": 5000.0 # High cost
            }
        ],
        "ports": {
            "Paradip": {
                "id": "Paradip",
                "berths": {
                    "B1": {"id": "B1", "status": "maintenance"}, # Blocked
                    "B2": {"id": "B2", "status": "operational", "current_vessel_id": "V_BLOCKER"}
                }
            }
        }
    }
