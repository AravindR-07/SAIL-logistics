
import jwt
import datetime
import logging
from functools import wraps
from flask import request, jsonify, g, current_app

logger = logging.getLogger(__name__)

# Mock User Database
# "Real-time" simulations often need quick setup, hence the in-memory store.
# Password is 'password123' for all.
USERS = {
    "admin": {"password": "password123", "role": "admin", "name": "System Admin"},
    "corporate": {"password": "password123", "role": "corporate_logistics", "name": "Corp. Logistics Head"},
    "portmanagerparadip": {"password": "password123", "role": "port_manager", "name": "Paradip Manager", "scope": "Paradip"},
    "portmanagerhaldia": {"password": "password123", "role": "port_manager", "name": "Haldia Manager", "scope": "Haldia"},
    "railofficer": {"password": "password123", "role": "railway_officer", "name": "Chief Rail Officer"},
    "plantheadrourkela": {"password": "password123", "role": "plant_head", "name": "Rourkela Plant Head", "scope": "Rourkela"},
    "finance": {"password": "password123", "role": "finance", "name": "CFO"},
    "aianalyst": {"password": "password123", "role": "ai_analyst", "name": "Data Scientist"},
}

def generate_token(username):
    """Generates a JWT token for the user."""
    user = USERS.get(username)
    if not user:
        return None
        
    payload = {
        'sub': username,
        'role': user['role'],
        'scope': user.get('scope', 'global'),
        'name': user['name'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # 24h validity
    }
    
    # Use app secret key
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    """Decorator to protect routes with JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            g.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(*args, **kwargs)
        
    return decorated

def role_required(allowed_roles):
    """Decorator to enforce role permissions."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not getattr(g, 'current_user', None):
                 return jsonify({'message': 'Authentication required!'}), 401
                 
            user_role = g.current_user.get('role')
            
            # Admin always has access? Or explicit?
            if user_role == 'admin':
                return f(*args, **kwargs)
                
            if user_role not in allowed_roles:
                return jsonify({'message': f'Access Forbidden: Requires {allowed_roles}'}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def init_auth_routes(app):
    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Could not verify', 'error': 'Missing credentials'}), 400
            
        username = data['username']
        password = data['password']
        
        # In a real app, hash check here
        user = USERS.get(username)
        
        if user and user['password'] == password:
            token = generate_token(username)
            return jsonify({
                'token': token,
                'user': {
                    'username': username,
                    'role': user['role'],
                    'name': user['name'],
                    'scope': user.get('scope', 'global')
                }
            })
            
        return jsonify({'message': 'Invalid credentials'}), 401

    @app.route('/api/me', methods=['GET'])
    @token_required
    def get_me():
        """Returns current user info from token."""
        return jsonify(g.current_user)

