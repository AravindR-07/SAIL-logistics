
import gymnasium as gym
from gymnasium import spaces
import numpy as np
from stable_baselines3 import PPO
from typing import List
import os
import logging
import json

logger = logging.getLogger(__name__)

class SAILTwinEnv(gym.Env):
    """
    Custom Environment that follows gym interface.
    Connects to the Digital Twin.
    """
    metadata = {'render.modes': ['console']}

    def __init__(self, twin_interface=None):
        super(SAILTwinEnv, self).__init__()
        self.twin = twin_interface
        
        # Action space: Discrete set of remedial actions
        # 0: Do Nothing, 1: Prioritize Vessel A, 2: Prioritize Rake B, etc.
        # Simplified for prototype
        self.action_space = spaces.Discrete(5)
        
        # Observation space: [Demurrage, DelayHours, InventoryLevel, ...]
        self.observation_space = spaces.Box(low=0, high=100000, shape=(5,), dtype=np.float32)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        # In a real scenario, this would reset the twin state
        observation = np.array([0, 0, 5000, 5000, 0], dtype=np.float32)
        return observation, {}

    def step(self, action):
        # Execute action on simulation
        # For now, return random reward step
        
        reward = 1.0 if action == 0 else 0.5 # Dummy reward
        terminated = False
        truncated = False
        observation = np.array([100, 2, 4900, 5100, 0], dtype=np.float32)
        
        return observation, reward, terminated, truncated, {}

    def close(self):
        pass

class RLAgent:
    def __init__(self, model_path="ppo_sail_agent"):
        self.model_path = model_path
        self.model = None
        self.env = SAILTwinEnv()
        
    def train(self, total_timesteps=1000):
        if not self.model:
            self.model = PPO("MlpPolicy", self.env, verbose=1)
        
        logger.info(f"Training agent for {total_timesteps} steps...")
        self.model.learn(total_timesteps=total_timesteps)
        self.model.save(self.model_path)
        logger.info("Training complete and model saved.")

    def load(self):
        if os.path.exists(self.model_path + ".zip"):
            self.model = PPO.load(self.model_path)
            logger.info("Loaded existing RL model.")
        else:
            logger.warning("No model found, creating new untrained model.")
            self.model = PPO("MlpPolicy", self.env, verbose=1)

    def choose_action(self, state_features: List[float]):
        if not self.model:
            self.load()
            
        # Predict
        obs = np.array(state_features, dtype=np.float32)
        action, _states = self.model.predict(obs, deterministic=True)
        return int(action)

# Singleton Agent
agent = RLAgent()
