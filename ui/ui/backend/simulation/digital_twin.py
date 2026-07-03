
import json
import logging
import copy
import pandas as pd
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# State Models
# ------------------------------------------------------------------

@dataclass
class Vessel:
    id: str
    name: str
    eta: str  # ISO timestamp
    original_eta: str = field(default="") # For delay calc
    draft: float = 0.0
    cargo_type: str = ""
    capacity: float = 0.0
    current_berth: Optional[str] = None
    status: str = "en_route"  # en_route, at_berth, delayed, completed
    demurrage_rate: float = 1000.0  # Cost per hour

    def __post_init__(self):
        if not self.original_eta:
            self.original_eta = self.eta

@dataclass
class Rake:
    id: str
    scheduled_arrival: str
    current_location: str
    capacity: float
    assigned_vessel_id: Optional[str] = None
    assigned_plant_id: Optional[str] = None
    status: str = "available" # available, loading, transit, maintenance

@dataclass
class Berth:
    id: str
    max_draft: float
    current_vessel_id: Optional[str] = None
    status: str = "operational" # operational, maintenance

@dataclass
class Plant:
    id: str
    inventory: Dict[str, float] = field(default_factory=dict) # material -> tons
    processing_rate: float = 100.0
    buffer_capacity: float = 10000.0

@dataclass
class Event:
    type: str # vessel_delay, rake_breakdown, port_closure, priority_order
    target_id: str
    params: Dict = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

# ------------------------------------------------------------------
# Digital Twin Classes
# ------------------------------------------------------------------

class PortTwin:
    def __init__(self, id: str, name: str = "", coordinates: List[float] = None):
        self.id = id
        self.name = name or id
        self.coordinates = coordinates or [0.0, 0.0]
        self.berths: Dict[str, Berth] = {}
        self.vessel_queue: List[Vessel] = []
        
    def add_berth(self, berth: Berth):
        self.berths[berth.id] = berth
        
    def to_dict(self):
         return {
             "id": self.id,
             "name": self.name,
             "coordinates": self.coordinates,
             "berths": {k: asdict(v) for k, v in self.berths.items()},
             "vessel_queue": [asdict(v) for v in self.vessel_queue]
         }

class PlantTwin:
    def __init__(self, id: str, name: str = "", coordinates: List[float] = None, risk: str = "Low"):
        self.id = id
        self.name = name or id
        self.coordinates = coordinates or [0.0, 0.0]
        self.risk = risk
        self.data: Plant = Plant(id=id)
        
    def update_inventory(self, material: str, delta: float):
        curr = self.data.inventory.get(material, 0.0)
        self.data.inventory[material] = max(0.0, curr + delta)
        
    def to_dict(self):
        d = asdict(self.data)
        # Calculate stock days (Sum of all material / processing_rate)
        total_inv = sum(self.data.inventory.values())
        rate = self.data.processing_rate
        d['stock_days'] = round(total_inv / rate, 2) if rate > 0 else 0
        d['name'] = self.name
        d['coordinates'] = self.coordinates
        d['risk'] = self.risk
        return d

class SAILTwin:
    def __init__(self):
        self.ports: Dict[str, PortTwin] = {}
        self.plants: Dict[str, PlantTwin] = {}
        self.vessels: Dict[str, Vessel] = {}
        self.rakes: Dict[str, Rake] = {}
        self.events_log: List[Event] = []
        self.simulation_time = datetime.now()

    def load_initial_state(self, sample_data_dir: str = None):
        """Loads state from sample files or creates defaults."""
        self.reset_state()
        logger.info("SAILTwin initialized with default state.")

    def reset_state(self):
        """Resets the twin to a clean initial state."""
        self.ports = {}
        self.plants = {}
        self.vessels = {}
        self.rakes = {}
        self.events_log = []
        self.history = [] # For storing time-series data
        self._create_default_state()
        logger.info("SAILTwin state reset.")

    def _create_default_state(self):
        # Create Ports
        # 1. Paradip
        p1 = PortTwin("Paradip", "Paradip Port", [20.26, 86.67])
        p1.add_berth(Berth("PPT-B1", max_draft=14.5))
        p1.add_berth(Berth("PPT-B2", max_draft=12.0))
        self.ports[p1.id] = p1

        # 2. Haldia
        p2 = PortTwin("Haldia", "Haldia Dock", [22.02, 88.06])
        p2.add_berth(Berth("HDC-B1", max_draft=8.5)) # Low draft port
        p2.add_berth(Berth("HDC-B2", max_draft=9.0))
        self.ports[p2.id] = p2

        # 3. Visakhapatnam
        p3 = PortTwin("Visakhapatnam", "Vishakapatnam Port", [17.68, 83.21])
        p3.add_berth(Berth("VPT-B1", max_draft=16.0)) # Deep draft
        p3.add_berth(Berth("VPT-B2", max_draft=14.0))
        self.ports[p3.id] = p3

        # 4. Dhamra (DPCL)
        p4 = PortTwin("Dhamra", "Dhamra Port", [20.79, 86.97])
        p4.add_berth(Berth("DPCL-B1", max_draft=18.0)) # Deepest draft
        p4.add_berth(Berth("DPCL-B2", max_draft=17.0))
        self.ports[p4.id] = p4

        # 5. Gopalpur
        p5 = PortTwin("Gopalpur", "Gopalpur Port", [19.26, 84.90]) # Corrected coords approximately
        p5.add_berth(Berth("GPL-B1", max_draft=13.0)) 
        p5.add_berth(Berth("GPL-B2", max_draft=12.5))
        self.ports[p5.id] = p5

        # 6. Gangavaram (GPL)
        p6 = PortTwin("Gangavaram", "Gangavaram Port", [17.63, 83.24])
        p6.add_berth(Berth("GVPT-B1", max_draft=19.0)) # Deep draft
        p6.add_berth(Berth("GVPT-B2", max_draft=18.0))
        self.ports[p6.id] = p6
        
        # Create Plants (SAIL Integrated Steel Plants)
        # 1. Rourkela (RSP)
        pl1 = PlantTwin("Rourkela", "Rourkela Steel Plant", [22.25, 84.85], risk="High")
        pl1.data.inventory = {"Coal": 15000.0, "IronOre": 25000.0}
        self.plants[pl1.id] = pl1

        # 2. Bhilai (BSP)
        pl2 = PlantTwin("Bhilai", "Bhilai Steel Plant", [21.19, 81.40], risk="Medium")
        pl2.data.inventory = {"Coal": 45000.0, "IronOre": 60000.0}
        self.plants[pl2.id] = pl2

        # 3. Bokaro (BSL)
        pl3 = PlantTwin("Bokaro", "Bokaro Steel Plant", [23.63, 86.13], risk="Low")
        pl3.data.inventory = {"Coal": 38000.0, "IronOre": 52000.0}
        self.plants[pl3.id] = pl3

        # 4. Durgapur (DSP)
        pl4 = PlantTwin("Durgapur", "Durgapur Steel Plant", [23.55, 87.28], risk="Low")
        pl4.data.inventory = {"Coal": 12000.0, "IronOre": 18000.0}
        self.plants[pl4.id] = pl4

        # 5. IISCO Burnpur (ISP)
        pl5 = PlantTwin("Burnpur", "IISCO Steel Plant", [23.67, 86.95], risk="Medium")
        pl5.data.inventory = {"Coal": 9500.0, "IronOre": 14000.0}
        self.plants[pl5.id] = pl5
        
        # Create Vessels
        # Create Vessels
        # V1: Coal, 50k tons, ETA T+2h
        v1 = Vessel(id="V001", name="MV Alpha", eta=(datetime.now() + timedelta(hours=2)).isoformat(), 
                   draft=14.0, cargo_type="Coal", capacity=50000)
                   
        # V2: IronOre, 40k tons, ETA T+5h
        v2 = Vessel(id="V002", name="MV Beta", eta=(datetime.now() + timedelta(hours=5)).isoformat(), 
                   draft=11.5, cargo_type="IronOre", capacity=40000)
                   
        self.vessels[v1.id] = v1
        self.vessels[v2.id] = v2
        p1.vessel_queue.extend([v1, v2]) # simple queueing
        
        # Create Rakes
        r1 = Rake("R001", (datetime.now() + timedelta(hours=4)).isoformat(), "Yard", 3000)
        self.rakes[r1.id] = r1

    def get_state(self):
        return {
            "simulation_time": self.simulation_time.isoformat(),
            "ports": {k: v.to_dict() for k, v in self.ports.items()},
            "plants": {k: v.to_dict() for k, v in self.plants.items()},
            "vessels": {k: asdict(v) for k, v in self.vessels.items()},
            "rakes": {k: asdict(v) for k, v in self.rakes.items()},
            "events_log": self.events_log,
            "history": self.history,
            "kpis": self._calculate_kpis()
        }

    def simulate_event(self, event: Event) -> Dict:
        """
        Simulates impact of an event without permanently applying it.
        Returns impact analysis.
        """
        # Create a sandbox copy
        sandbox = copy.deepcopy(self)
        sandbox.apply_event(event)
        
        # Simple heuristic impact analysis
        # In a real system, this would run forward simulation for N steps
        impact = {
            "original_cost": self._calculate_kpis()["total_cost"],
            "new_cost": sandbox._calculate_kpis()["total_cost"],
            "original_demurrage": self._calculate_kpis()["demurrage"],
            "new_demurrage": sandbox._calculate_kpis()["demurrage"],
            "original_delay": self._calculate_kpis().get("total_delay_hours", 0),
            "new_delay": sandbox._calculate_kpis().get("total_delay_hours", 0),
            "message": f"Simulated {event.type} on {event.target_id}"
        }
        impact["cost_delta"] = impact["new_cost"] - impact["original_cost"]
        impact["demurrage_delta"] = impact["new_demurrage"] - impact["original_demurrage"]
        impact["delay_delta"] = impact["new_delay"] - impact["original_delay"]
        return impact

    def apply_event(self, event: Event):
        """Permanently applies an event to the state."""
        self.events_log.append(event)
        
        if event.type == "vessel_delay":
            v_id = event.target_id
            delay_hours = float(event.params.get("hours", 0))
            if v_id in self.vessels:
                v = self.vessels[v_id]
                eta = datetime.fromisoformat(v.eta)
                v.eta = (eta + timedelta(hours=delay_hours)).isoformat()
                logger.info(f"Updated {v_id} ETA by {delay_hours}h")
                
        elif event.type == "rake_breakdown":
            r_id = event.target_id
            if r_id in self.rakes:
                self.rakes[r_id].status = "maintenance"
                
        elif event.type == "port_congestion":
             # Delay all vessels destined for this port
             p_id = event.target_id
             delay = float(event.params.get("hours", 24))
             # Naive implementation: find vessels in queue
             if p_id in self.ports:
                 for v in self.ports[p_id].vessel_queue:
                     eta = datetime.fromisoformat(v.eta)
                     v.eta = (eta + timedelta(hours=delay)).isoformat()
                 logger.info(f"Congestion at {p_id}: Delayed queue by {delay}h")

        elif event.type == "plant_shutdown":
            pl_id = event.target_id
            if pl_id in self.plants:
                # Reduce processing rate (simulated)
                self.plants[pl_id].data.processing_rate = 0.0
                logger.info(f"Plant {pl_id} shutdown initiated.")
                
        # Add more logic...

    def apply_action(self, action: Dict):
        """Applies a remedial action (from MILP or RL)."""
        logger.info(f"Applying action: {action}")
        # Example action: {"type": "reassign_rake", "rake_id": "R001", "vessel_id": "V002"}
        if action["type"] == "reassign_rake":
            r = self.rakes.get(action["rake_id"])
            if r:
                r.assigned_vessel_id = action.get("vessel_id")
        # Add more...

    def _calculate_kpis(self) -> Dict:
        """Calculates current KPIs: Demurrage, Inventory risks, etc."""
        total_demurrage = 0.0
        active_delays = 0
        total_delay_hours = 0.0
        
        # Simple demurrage calc: if vessel is waiting and past ETA
        now = self.simulation_time
        
        for v in self.vessels.values():
            # 1. Delay Calculation (Current ETA vs Original)
            orig = datetime.fromisoformat(v.original_eta)
            curr = datetime.fromisoformat(v.eta)
            
            delay_hrs = (curr - orig).total_seconds() / 3600
            if delay_hrs > 1.0: # threshold 1 hour
                active_delays += 1
                # Penalty model: $1000 * delay_hours
                total_demurrage += (delay_hrs * v.demurrage_rate)
            
            if delay_hrs > 0:
                total_delay_hours += delay_hrs
        
        # Breakdown Costs
        freight_cost = len(self.vessels) * 3000.0  # Simulated sea freight
        rail_cost = len(self.rakes) * 1500.0       # Simulated rail freight
        
        total_cost = total_demurrage + freight_cost + rail_cost
        risk_score = (active_delays * 10) + (total_demurrage / 1000)

        kpis = {
            "total_cost": round(total_cost, 2),
            "demurrage": round(total_demurrage, 2),
            "freight_cost": round(freight_cost, 2),
            "rail_cost": round(rail_cost, 2),
            "delayed_vessels": active_delays,
            "risk_score": round(risk_score, 2),
            "total_delay_hours": round(total_delay_hours, 2)
        }
        
        # Snapshot for history (keep last 20 points for graphs)
        snapshot = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "demurrage": kpis['demurrage'],
            "freight": kpis['freight_cost'],
            "rail": kpis['rail_cost'],
            "total_cost": kpis['total_cost'],
            "risk_score": kpis['risk_score']
        }
        self.history.append(snapshot)
        if len(self.history) > 20:
             self.history.pop(0)

        return kpis

    def load_state_from_dataframe(self, data_type: str, df: pd.DataFrame):
        """Updates state based on dataframe content."""
        logger.info(f"Loading {data_type} from DataFrame with {len(df)} rows.")
        try:
            if data_type.lower() == "vessels":
                self._update_vessels(df)
            elif data_type.lower() == "rakes":
                self._update_rakes(df)
            else:
                 logger.warning(f"Unknown data type: {data_type}")
        except Exception as e:
            logger.error(f"Error updating {data_type}: {str(e)}")
            raise

    def _update_vessels(self, df: pd.DataFrame):
        # Expected cols: id, name, eta, draft, cargo_type, capacity
        # Optional: status, demurrage_rate
        self.vessels = {} # Reset vessels or merge? "Update" usually implies replacing in this context if it's a bulk upload
        # Im going to Replace all vessels for simplicity as it's a "Load" operation
        
        for _, row in df.iterrows():
            # Handle timestamps carefully
            eta = row.get('eta')
            if isinstance(eta, pd.Timestamp):
                eta = eta.isoformat()
            
            # Basic validation
            if not row.get('id'): continue
            
            v = Vessel(
                id=str(row['id']),
                name=str(row.get('name', f"V_{row['id']}")),
                eta=str(eta),
                draft=float(row.get('draft', 10.0)),
                cargo_type=str(row.get('cargo_type', 'General')),
                capacity=float(row.get('capacity', 0.0)),
                current_berth=row.get('current_berth') if pd.notna(row.get('current_berth')) else None,
                status=str(row.get('status', 'en_route')),
                demurrage_rate=float(row.get('demurrage_rate', 1000.0))
            )
            self.vessels[v.id] = v
        
        # Re-populate port queues if needed (naive)
        for p in self.ports.values():
            p.vessel_queue = []
            for v in self.vessels.values():
                if v.status == 'en_route': # simple logic
                    p.vessel_queue.append(v)
    
    def _update_rakes(self, df: pd.DataFrame):
        self.rakes = {}
        for _, row in df.iterrows():
            if not row.get('id'): continue
            
            arrival = row.get('scheduled_arrival')
            if isinstance(arrival, pd.Timestamp):
                arrival = arrival.isoformat()

            r = Rake(
                id=str(row['id']),
                scheduled_arrival=str(arrival),
                current_location=str(row.get('current_location', 'Yard')),
                capacity=float(row.get('capacity', 0.0)),
                assigned_vessel_id=str(row.get('assigned_vessel_id')) if pd.notna(row.get('assigned_vessel_id')) else None,
                assigned_plant_id=str(row.get('assigned_plant_id')) if pd.notna(row.get('assigned_plant_id')) else None, 
                status=str(row.get('status', 'available'))
            )
            self.rakes[r.id] = r

# Global singleton instance
current_twin = SAILTwin()
current_twin.load_initial_state()
