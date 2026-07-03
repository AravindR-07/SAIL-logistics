
# SAIL Digital Twin Self-Healing Supply Chain

A production-grade Python backend for the SAIL Supply Chain Digital Twin. This system provides real-time simulation, MILP optimization for scheduling, and Reinforcement Learning (RL) agents for self-healing decision making.

## 🚀 Features
- **Digital Twin**: Simulates Ports (Paradip), Plants (Rourkela), Vessels, and Rakes.
- **MILP Optimization**: Uses OR-Tools to solve vessel berthing and rake assignment problems.
- **Self-Healing AI**: RL agent (PPO) + Heuristics to resolve delays and breakdowns automatically.
- **Manus AI Integration**: Connects to Manus for advanced cognitive workflows (optional).
- **UI Integration**: Drop-in `backend_connector.js` to power existing UIs.

## 🛠️ Installation

1. **Prerequisites**: Python 3.11+, generic OS dependencies for OR-Tools.
2. **Setup**:
   ```bash
   # Create virtual environment
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   
   # Install dependencies
   pip install -r requirements.txt
   ```
3. **Configuration**:
   Copy `.env.example` to `.env` and adjust settings.
   ```bash
   cp .env.example .env
   ```

## 🏃 Run the Server
```bash
python backend/app.py
```
Server runs at `http://localhost:8000`.

## 🧪 Testing & Verification
run the verification script to simulate a vessel delay and see the self-healing in action:
```bash
python scripts/verify_scenario.py
```

Run unit tests:
```bash
pytest backend/tests/
```

## 🔌 API Endpoints
- `GET /health`: Health check.
- `GET /api/state`: Get current digital twin snapshot.
- `POST /api/event`: Inject failure events (e.g., vessel delay).
- `POST /api/heal`: Apply remedial actions.
- `POST /api/optimize`: Trigger MILP solver.

## 🖥️ UI Integration
1. Include `backend_connector.js` in your HTML/JS references.
2. Ensure your buttons have IDs `simulate-btn` and `heal-btn`, or update the mapping in `backend_connector.js`.

## 🧠 Architecture
- `backend/simulation`: Core state and logic.
- `backend/solver`: MILP implementation (OR-Tools).
- `backend/agents`: RL Agent (Stable Baselines3).
- `backend/manus_connector.py`: Bridge to external AI workflows.
