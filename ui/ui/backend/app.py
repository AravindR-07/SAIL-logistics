import os
import logging
from flask import Flask, jsonify, request, g
from werkzeug.middleware.proxy_fix import ProxyFix
from backend.config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Support proxy headers if behind nginx/gunicorn
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
    
    # Initialize extensions (DB, etc.) here if needed
    
    # Security Middleware
    @app.before_request
    def check_api_key():
        # Allow OPTIONS for CORS and health check without auth
        # Also allow if Authorization header is present (User RBAC handles it)
        if (request.method == 'OPTIONS' or 
            request.endpoint == 'health_check' or 
            request.path == '/api/login' or
            'Authorization' in request.headers):
            return
        
        # Simple API Key check
        key = request.headers.get('X-API-KEY')
        if key != app.config['API_KEY']:
            # For dev convenience, if no key provided in dev mode, we might warn but allow?
            # Sticking to requirements: strict check
            logger.warning(f"Unauthorized access attempt from {request.remote_addr}")
            return jsonify({"error": "Unauthorized"}), 401

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-KEY'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        return response

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok",
            "version": "1.0.0",
            "environment": app.config['ENV']
        })

    # Placeholder for API handlers initialization
    # We will import and register blueprints or attach views here
    
    # --- VISUALIZER LAUNCHER ---
    import subprocess
    import sys
    
    @app.route('/api/launch-visualizer', methods=['POST'])
    def launch_visualizer():
        try:
            # Launch the Pygame script as a subprocess
            # Using sys.executable to ensure we use the same Python env
            subprocess.Popen([sys.executable, 'logistics_visualizer.py'])
            return jsonify({"status": "launched", "message": "Visualizer started"}), 200
        except Exception as e:
            logger.error(f"Failed to launch visualizer: {e}")
            return jsonify({"error": str(e)}), 500

    # Auth Routes
    from backend.auth import init_auth_routes
    init_auth_routes(app)

    from backend.api_handlers import init_api_routes
    init_api_routes(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=app.config['PORT'])
