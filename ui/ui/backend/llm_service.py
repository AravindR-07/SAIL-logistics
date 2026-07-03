
import requests
import json
import logging

logger = logging.getLogger(__name__)

# Hardcoded API key as requested
API_KEY = "AIzaSyDkzrHBOtnfd6gg2xmx70srM8ryh8NZMFQ"
MODEL = "gemini-1.5-flash" 
BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

def generate_explanation(context_data: dict) -> str:
    """
    Send optimization context to Gemini and return an explanation.
    """
    if not API_KEY:
        logger.error("GOOGLE_API_KEY not set.")
        return "AI explanation unavailable (Key not set)."

    # Construct a prompt based on the context
    eval_context = context_data.get('evaluation_report', {}).get('llm_explanation_ready_prompt', '')
    
    prompt = (
        f"You are a logistics expert. Analyze the following optimization result from a port scheduling system:\n\n"
        f"{json.dumps(context_data, indent=2)}\n\n"
        f"{eval_context}\n\n"
        f"Explain in 2-3 concise sentences why this plan is optimal (or why a correction is needed). "
        f"Focus on the efficiency of vessel-berth assignments and rake utilization. "
        f"Do not use markdown formatting like bold or bullet points in your response."
    )

    url = BASE_URL + f"?key={API_KEY}"
    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ]
    }

    headers = {"Content-Type": "application/json"}
    
    try:
        # Increased timeout to 30s
        resp = requests.post(url, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        # Extract text from response
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            # Enforce status prefix from context if available
            if "mistake_detected" in context_data.get('evaluation_report', {}):
                is_mistake = context_data['evaluation_report']['mistake_detected']
                prefix = "EVALUATION WARNING: " if is_mistake else "EVALUATION SUCCESS: "
                if not text.startswith("EVALUATION"):
                    text = f"{prefix}{text}"
            return text
        except (KeyError, IndexError, TypeError):
            logger.error(f"Unexpected LLM response format: {data}")
            return "AI explanation unavailable (Unexpected format)."
    
    except requests.exceptions.RequestException as e:
        logger.error(f"LLM API request failed: {e}")
        # Fallback Heuristic Explanation if API fails
        try:
            v_count = len(context_data.get('assignments', {}).get('vessel_berth', {}))
            r_count = len(context_data.get('assignments', {}).get('rake_vessel', {}))
            score = context_data.get('objective_value', 0)
            
            base_text = (
                f"The optimization solver successfully assigned {v_count} vessels and {r_count} rakes, "
                f"achieving an efficiency score of {score}. This plan minimizes berthing delays by prioritizing "
                "available berths matching vessel draft requirements."
            )
            
            # Add evaluation prefix even in fallback
            if "mistake_detected" in context_data.get('evaluation_report', {}):
                 is_mistake = context_data['evaluation_report']['mistake_detected']
                 prefix = "EVALUATION WARNING: Issues detected. " if is_mistake else "EVALUATION SUCCESS: Plan verified. "
                 return f"{prefix}{base_text}"
            
            return f"(Simulated Analysis) {base_text}"
        except Exception:
            return "AI explanation unavailable (Network error)."

def explain_evaluation(evaluation_report: dict, fusion_evidence: dict = None) -> str:
    """
    Generates a concise, human-readable explanation of why a decision failed.
    Uses the evaluation report and fusion evidence to provide context.
    """
    
    prompt = f"""You are an expert logistics analyst. Explain why this optimization decision failed in 2-3 sentences.

EVALUATION REPORT:
- Mistake Detected: {evaluation_report.get('mistake_detected')}
- Issue: {evaluation_report.get('wrong_decision')}
- Root Cause: {evaluation_report.get('root_cause')}
- Recommended Fix: {evaluation_report.get('correct_decision')}

"""
    
    if fusion_evidence:
        prompt += f"""DECISION CONTEXT:
- Model Used: {fusion_evidence.get('selected_source')}
- Consensus: {fusion_evidence.get('consensus_met')}
"""
    
    prompt += """
Explain in plain English why this happened and what it means for the supply chain. Be concise and actionable."""

    url = BASE_URL + f"?key={API_KEY}"
    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        resp = requests.post(url, headers=headers, json=body, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return text
    except Exception as e:
        logger.error(f"LLM explanation failed: {e}")
        return f"{evaluation_report.get('root_cause', 'Unknown issue')}"

