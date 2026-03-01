from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from app.models import User


def admin_required(fn):
    """Decorator: only admin users can access"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def active_user_required(fn):
    """Decorator: only active (non-blocked) users can access"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        user = User.query.get(claims.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'error': 'Account is blocked or inactive'}), 403
        return fn(*args, **kwargs)
    return wrapper


def generate_account_number():
    """Generate a unique 12-digit account number"""
    import random
    return 'ACC' + ''.join([str(random.randint(0, 9)) for _ in range(9)])


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    return True, "Valid"
