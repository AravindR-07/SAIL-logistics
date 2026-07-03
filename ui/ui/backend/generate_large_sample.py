import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_large_dataset():
    # Simulate 1 year of data (approx 2000 vessels)
    start_date = datetime.now()
    
    data = []
    
    cargo_types = ['Coal', 'IronOre', 'Limestone', 'Coking Coal']
    statuses = ['en_route', 'at_berth', 'waiting', 'completed']
    ports = ['Paradip', 'Haldia', 'Vizag', 'Dhamra']
    
    for i in range(2000):
        # Random ETA within the next 365 days
        eta_offset = random.randint(0, 365 * 24)
        eta = start_date + timedelta(hours=eta_offset)
        
        v_id = f"SAP_V_{10000 + i}"
        
        item = {
            "id": v_id,
            "name": f"MV {random.choice(['Titan', 'Giant', 'Star', 'Pearl', 'Wave', 'Ocean', 'Bulk', 'Carrier'])} {i}",
            "eta": eta.isoformat(),
            "draft": round(random.uniform(10.0, 16.0), 2),
            "cargo_type": random.choice(cargo_types),
            "capacity": random.choice([45000, 60000, 75000, 120000]),
            "status": random.choice(statuses),
            "demurrage_rate": random.choice([1000, 1500, 2000]),
            "load_pct": random.randint(50, 100) # Extra SAP field
        }
        data.append(item)
        
    df = pd.DataFrame(data)
    
    # Save to public sample folder
    output_path = "c:/Users/Abeshek/Desktop/ui/ui/public/samples/sap_bulk_export_2024.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {output_path} with {len(df)} rows.")

if __name__ == "__main__":
    generate_large_dataset()
