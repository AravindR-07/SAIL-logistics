
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = ENV == 'development'
    PORT = int(os.getenv('PORT', 8000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-please-change')
    
    # API Security
    API_KEY = os.getenv('API_KEY', 'dev-api-key-123')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URL', 'sqlite:///sail_twin.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Integration Flags
    USE_MANUS = os.getenv('USE_MANUS', 'false').lower() == 'true'
    MANUS_API_KEY = os.getenv('MANUS_API_KEY')
    MANUS_ENDPOINT = os.getenv('MANUS_ENDPOINT', 'https://api.manus.ai/v1')
    
    # Optimization Settings
    SOLVER_TIMEOUT = int(os.getenv('SOLVER_TIMEOUT', 30))
    ENABLE_GUROBI = os.getenv('ENABLE_GUROBI', 'false').lower() == 'true'
