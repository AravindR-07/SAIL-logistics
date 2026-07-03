
import logging
import requests
import json
from dataclasses import asdict

logger = logging.getLogger(__name__)

class ManusConnector:
    def __init__(self, api_key, endpoint_url="https://api.manus.ai/v1"):
        self.api_key = api_key
        self.base_url = endpoint_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def trigger_workflow(self, workflow_name: str, payload: dict):
        """
        Triggers a Manus workflow (e.g., self_healing_chain).
        """
        if not self.api_key:
            logger.warning("Manus API Key missing. Skipping workflow trigger.")
            return None
            
        url = f"{self.base_url}/workflows/{workflow_name}/execute"
        try:
            logger.info(f"Triggering Manus workflow: {workflow_name}")
            resp = requests.post(url, headers=self.headers, json=payload, timeout=5)
            if resp.status_code == 200:
                result = resp.json()
                logger.info(f"Manus workflow started: {result.get('execution_id')}")
                return result
            else:
                logger.error(f"Manus trigger failed: {resp.text}")
                return None
        except Exception as e:
            logger.error(f"Error calling Manus: {e}")
            return None

    def construct_payload(self, event, twin_snapshot, solver_candidates):
        """Constructs the context payload for the AI model."""
        return {
            "event": asdict(event),
            "current_state": twin_snapshot,
            "optimization_candidates": solver_candidates,
            "goal": "Minimize demurrage and maintain inventory levels."
        }
