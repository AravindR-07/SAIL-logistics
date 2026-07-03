# Postman Interaction Guide

This guide provides the exact JSON payloads to manipulate the Digital Twin via Postman. All commands use the `"apply": true` flag to permanently update the state, visible on the **Dashboard** and **What-If** pages.

## Environment Setup
- **Base URL**: `http://localhost:8000`
- **Headers**:
  - `X-API-KEY`: `dev-api-key-123`
  - `Content-Type`: `application/json`

---

## 1. Scenario: Operational Disruptions (Delays & Breakdowns)

### A. Minor Vessel Delay (Weather)
Simulates a typical 4-hour delay. Low impact, acts as a warning.
*   **Endpoint**: `POST /api/event`
*   **Body**:
    ```json
    {
      "event_type": "vessel_delay",
      "target_id": "V001",
      "apply": true,
      "payload": { "hours": 4, "reason": "High Swell" }
    }
    ```
    *Observe*: **Dashboard** "Delayed Vessels" = 1. Risk Score rises slightly.

### B. Major Rake Breakdown (Logistics Halt)
Simulates a critical failure of a rake, halting cargo movement.
*   **Endpoint**: `POST /api/event`
*   **Body**:   
    ```json
    {
      "event_type": "rake_breakdown",
      "target_id": "R001",
      "apply": true,
      "payload": { "severity": "critical" }
    }
    ```
    *Observe*: **Railway Dispatch** board updates. **What-If** cost projection spikes.

---

## 2. Scenario: Financial Impact (Demurrage)

### A. Critical Vessel Delay (High Demurrage)
Simulates a massive 72-hour delay (e.g., Cyclone). This triggers immediate high demurrage penalties.
*   **Endpoint**: `POST /api/event`
*   **Body**:
    ```json
    {
      "event_type": "vessel_delay",
      "target_id": "V002",
      "apply": true,
      "payload": { "hours": 72, "reason": "Cyclone Dana" }
    }
    ```
    *Observe*: **Dashboard** "Risk Score" turns RED. "Demurrage Costs" metric increases significantly (Calculation: 72 hours * Rate).

### B. Port Congestion (Cascading Delays)
Simulates congestion at Paradip Port, delaying **ALL** queued vessels.
*   **Endpoint**: `POST /api/event`
*   **Body**:
    ```json
    {
      "event_type": "port_congestion",
      "target_id": "Paradip",
      "apply": true,
      "payload": { "hours": 24 }
    }
    ```
    *Observe*: Multiple vessels show delays. Total system cost jumps drastically due to compounded demurrage.

---

## 3. Scenario: Operations Shutdown

### A. Plant Shutdown
Simulates an emergency shutdown at Rourkela Steel Plant.
*   **Endpoint**: `POST /api/event`
*   **Body**:
    ```json
    {
      "event_type": "plant_shutdown",
      "target_id": "Rourkela",
      "apply": true,
      "payload": { "reason": "Power Failure" }
    }
    ```
    *Observe*: **Railway Dispatch** Plant Requirements panel may show alerts (if implemented) or future stockout risks.

---

## 4. Self-Healing & Recovery

### Run Optimization (Solve Constraints)
Re-calculates the schedule to minimize the impact of the above disruptions.
*   **Endpoint**: `POST /api/optimize`
*   **Body**: `{}`
    *Observe*: **Optimization Engine** shows new logical schedule to mitigate costs.

### Reset System
*   **Endpoint**: `POST /api/event`
*   **Body**: `{"event_type": "reset"}`
