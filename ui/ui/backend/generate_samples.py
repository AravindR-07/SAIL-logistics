import pandas as pd
import os
from datetime import datetime, timedelta

def generate_samples():
    base_dir = "c:/Users/Abeshek/Desktop/ui/ui/backend/data"
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # 1. Vessels (CSV)
    vessels_data = [
        {"id": "V_TIMESTAMP_1", "name": "MV Ocean Giant", "eta": (datetime.now() + timedelta(hours=12)).isoformat(), "draft": 14.2, "cargo_type": "Coal", "capacity": 75000, "status": "en_route", "demurrage_rate": 1200},
        {"id": "V_TIMESTAMP_2", "name": "MV Iron Lady", "eta": (datetime.now() + timedelta(hours=4)).isoformat(), "draft": 11.5, "cargo_type": "IronOre", "capacity": 45000, "status": "en_route", "demurrage_rate": 900},
        {"id": "V_TIMESTAMP_3", "name": "MV Pacific Star", "eta": (datetime.now() + timedelta(hours=48)).isoformat(), "draft": 13.8, "cargo_type": "Coal", "capacity": 60000, "status": "en_route", "demurrage_rate": 1100},
    ]
    pd.DataFrame(vessels_data).to_csv(os.path.join(base_dir, "sample_vessels.csv"), index=False)
    print("Created sample_vessels.csv")

    # 2. Rakes (Excel)
    rakes_data = [
        {"id": "R_TIMESTAMP_1", "scheduled_arrival": (datetime.now() + timedelta(hours=6)).isoformat(), "current_location": "Siding_A", "capacity": 3500, "status": "available", "assigned_vessel_id": "V_TIMESTAMP_1"},
        {"id": "R_TIMESTAMP_2", "scheduled_arrival": (datetime.now() + timedelta(hours=14)).isoformat(), "current_location": "Yard_Map", "capacity": 3500, "status": "maintenance", "assigned_vessel_id": ""}
    ]
    pd.DataFrame(rakes_data).to_excel(os.path.join(base_dir, "sample_rakes.xlsx"), index=False)
    print("Created sample_rakes.xlsx")

if __name__ == "__main__":
    generate_samples()
