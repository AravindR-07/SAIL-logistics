# Comprehensive Technical Specifications
**Project: Digital Twin Supply Chain with Self-Healing Capabilities**

## 1. System Overview
This project implements a Resilient Supply Chain Digital Twin for SAIL (Steel Authority of India Limited). It integrates a real-time simulation engine with advanced optimization (MILP), Reinforcement Learning (RL), and Generative AI (LLM) to predict delays, assess risks, and autonomously "heal" the supply chain by rescheduling resources.

---

## 2. Technology Stack & Justification

| Components | Technology | Version | Reason for Choice |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | **Flask (Python)** | 3.0+ | Lightweight, easy integration with Python's rich data science/AI ecosystem (Pandas, OR-Tools, Stable Baselines). |
| **Optimization** | **Google OR-Tools** | 9.8+ | Industry-standard for solving MILP/CSP problems. faster and more flexible than PuLP for complex routing constraints. |
| **Reinforcement Learning** | **Stable Baselines 3** | 2.0+ | Provides reliable implementations of PPO/DQN. Uses PyTorch backend. Standard for RL research and deployment. |
| **RL Environment** | **Gymnasium** | 0.29+ | The standard API for defining RL environments (Observation/Action spaces), ensuring compatibility with SB3. |
| **LLM Service** | **Gemini 1.5 Flash** | API | High-speed, low-latency reasoning suitable for generating real-time explanations of optimization results. |
| **Orchestration** | **Manus AI** | API | Used for complex agentic workflows involving multi-step reasoning (e.g., "Analyze -> Consult -> Decide"). |
| **Frontend** | **React + Vite** | 18+ | Fast HMR (Hot Module Replacement), component-based architecture for complex dashboards (Recharts, Framer Motion). |
| **State Management** | **React State** | N/A | Simple local state management sufficient for this prototype; easily scalable to Redux/Zustand. |

---

## 3. High-Level Architecture & Data Flow

1.  **Event Ingestion**: Front-end or External Systems trigger events (e.g., `vessel_delay`) via `/api/event`.
2.  **Digital Twin Simulation (`backend/simulation`)**:
    *   Receives event.
    *   Creates a "Sandbox" clone of the current state.
    *   Simulates the event's specific impact (e.g., adds 24h to ETA).
    *   Calculates Impact Metrics (Cost Delta, Risk Score).
3.  **Self-Healing Logic (`backend/api_handlers.py`)**:
    *   **Layer 1 (MILP)**: Feeds the perturbed state to the MILP Solver (`backend/solver`) to find a mathematical optimal schedule.
    *   **Layer 2 (RL)**: (Optional) The RL Agent evaluates the strategic long-term impact of the MILP solutions.
    *   **Layer 3 (LLM)**: Resulting schedule is passed to Gemini 1.5 to generate a human-readable "Why is this optimal?" text.
4.  **Response**: The system returns the *Impact Analysis*, *Propsoed Actions*, and *Explanation* to the UI.

---

## 4. Module-by-Module Detailed Analysis

### A. Digital Twin Engine (`backend/simulation/digital_twin.py`)
**Role**: The "Source of Truth". Maintains the state of Vessels, Ports, Rakes, and Plants.

**Mathematical Logic (KPIs)**:
*   **Demurrage Cost ($D$)**:
    *   $D = \sum_{v \in Vessels} \max(0, (ETA_{current} - ETA_{original}) \times Rate_v)$
    *   Threshold: Delays < 1 hour are ignored to avoid noise.
*   **Risk Score**:
    *   Composite linear combination: $Risk = 10 \times N_{delayed} + (Cost_{demurrage} / 1000)$

**Algorithms**:
*   **Queue Simulation**: Naive FIFO queue for vessels arriving at port. `port_congestion` event adds constant delay $\Delta t$ to all $v$ in queue.

### B. MILP Optimization Engine (`backend/solver/milp_scheduler.py`)
**Role**: Solves the "Berth Allocation & Rake Assignment" problem.

**Algorithm**: Mixed Integer Linear Programming (Branch & Cut).
**Solver**: CBC (Coin-OR Branch and Cut) via OR-Tools wrapper.

**Mathematical Formulation**:
*   **Decision Variables**:
    *   $x_{v,b} \in \{0,1\}$: Vessel $v$ assigned to Berth $b$.
    *   $y_{r,v} \in \{0,1\}$: Rake $r$ assigned to Vessel $v$.
*   **Objective**: Maximize Assignments (weighted).
    *   $\max Z = 1000 \sum x_{v,b} + 100 \sum y_{r,v}$
    *   *Interpretation*: Valid berthing is priority #1, Rake connection is #2.
*   **Constraints**:
    1.  $\sum_b x_{v,b} \le 1$ (Vessel assigned to max 1 berth).
    2.  $\sum_v x_{v,b} \le 1$ (Berth accommodates max 1 vessel).
    3.  $Draft_v \le MaxDraft_b$ (Physical draft limit).
    4.  $y_{r,v} \le \sum_b x_{v,b}$ (Rake can only serve berthed vessels).

### C. Reinforcement Learning Agent (`backend/agents/rl_agent.py`)
**Role**: Strategic decision-making beyond immediate MILP cost (e.g., long-term inventory health).

**Algorithm**: PPO (Proximal Policy Optimization).
*   **Why PPO?**: Handles discrete action spaces well, stable convergence compared to DQN, requires less hyperparameter tuning.

**Environment (`SAILTwinEnv`)**:
*   **Observation Space**: Box(5). Feature vector: `[Current_Demurrage, Avg_Delay_Hours, Plant_Inventory, Buffer_Space, Queue_Len]`.
*   **Action Space**: Discrete(5). Abstract actions like "Prioritize Coal", "Prioritize Iron Ore", "Maximize Throughput", "Minimize Cost".
*   **Reward Function**: $R = -Cost_{step} + Penalty_{stockout}$. (Currently simplified in prototype).

### D. LLM Explainability Service (`backend/llm_service.py`)
**Role**: Translating JSON optimization results into English.

**Logic**:
1.  Takes `solver_result` dictionary.
2.  Constructs a prompt: *"You are a logistics expert... Explain why this plan is optimal..."*.
3.  Calls Gemini 1.5 Flash API.
4.  Returns text explanation used in UI tooltips/cards.

### E. Manus Connector (`backend/manus_connector.py`)
**Role**: Integration with Manus AI for advanced agentic workflows (e.g., "Self-Healing Chain").

**Logic**:
*   REST API Client accessing `https://api.manus.ai`.
*   Triggers predefined workflows (e.g., `self_healing_chain`) passing the full context (Event, Twin State, Candidates).
*   Allows the system to offload complex reasoning ("Should we declare force majeure?") to a specialized agentic workflow.

---

## 5. Security & Error Handling
*   **API Key Validation**: Middleware checks `X-API-KEY` header against `backend/config.py`.
*   **Fallback Logic**:
    *   If **MILP** fails (timeout), the system returns the original state (No-Op).
    *   If **LLM** fails (network/quota), a heuristic string builder generates a basic explanation locally.
    *   If **RL** model is missing, it resets to a rule-based default (Action 0).
