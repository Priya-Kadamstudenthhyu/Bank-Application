from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import User, Account, Transaction, DigitalSignature
from app.utils.decorators import active_user_required, generate_account_number

user_bp = Blueprint('user', __name__)


@user_bp.route('/profile', methods=['GET'])
@jwt_required()
@active_user_required
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return jsonify({'user': user.to_dict()}), 200


@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
@active_user_required
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    if data.get('full_name'):
        user.full_name = data['full_name'].strip()
    if data.get('phone'):
        user.phone = data['phone'].strip()
    if data.get('address'):
        user.address = data['address'].strip()

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200


@user_bp.route('/accounts', methods=['GET'])
@jwt_required()
@active_user_required
def get_accounts():
    user_id = int(get_jwt_identity())
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify({'accounts': [a.to_dict() for a in accounts]}), 200


@user_bp.route('/accounts/open', methods=['POST'])
@jwt_required()
@active_user_required
def open_account():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    account_type = data.get('account_type', 'savings')
    if account_type not in ['savings', 'checking', 'fixed']:
        return jsonify({'error': 'Invalid account type'}), 400

    # Generate unique account number
    acc_num = generate_account_number()
    while Account.query.filter_by(account_number=acc_num).first():
        acc_num = generate_account_number()

    account = Account(
        user_id=user_id,
        account_number=acc_num,
        account_type=account_type,
        balance=0.00,
        status='pending'
    )
    db.session.add(account)
    db.session.commit()
    return jsonify({'message': 'Account application submitted', 'account': account.to_dict()}), 201


@user_bp.route('/transactions', methods=['GET'])
@jwt_required()
@active_user_required
def get_transactions():
    user_id = int(get_jwt_identity())
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [a.id for a in accounts]

    txns = Transaction.query.filter(
        db.or_(
            Transaction.from_account_id.in_(account_ids),
            Transaction.to_account_id.in_(account_ids)
        )
    ).order_by(Transaction.created_at.desc()).all()

    return jsonify({'transactions': [t.to_dict() for t in txns]}), 200


@user_bp.route('/transactions', methods=['POST'])
@jwt_required()
@active_user_required
def create_transaction():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    txn_type = data.get('transaction_type')
    amount = data.get('amount')
    from_account_id = data.get('from_account_id')
    to_account_number = data.get('to_account_number')
    description = data.get('description', '')

    if not txn_type or not amount:
        return jsonify({'error': 'transaction_type and amount are required'}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({'error': 'Amount must be a positive number'}), 400

    if txn_type not in ['deposit', 'withdrawal', 'transfer']:
        return jsonify({'error': 'Invalid transaction type'}), 400

    # Validate from_account belongs to user
    from_account = None
    to_account = None

    if txn_type in ['withdrawal', 'transfer']:
        if not from_account_id:
            return jsonify({'error': 'from_account_id is required'}), 400
        from_account = Account.query.filter_by(id=from_account_id, user_id=user_id).first()
        if not from_account:
            return jsonify({'error': 'Account not found'}), 404
        if from_account.status != 'active':
            return jsonify({'error': 'Account is not active'}), 400

    if txn_type == 'deposit':
        if not from_account_id:
            return jsonify({'error': 'to_account_id is required for deposit'}), 400
        to_account = Account.query.filter_by(id=from_account_id, user_id=user_id).first()
        if not to_account:
            return jsonify({'error': 'Account not found'}), 404

    if txn_type == 'transfer':
        if not to_account_number:
            return jsonify({'error': 'to_account_number is required for transfer'}), 400
        to_account = Account.query.filter_by(account_number=to_account_number).first()
        if not to_account:
            return jsonify({'error': 'Destination account not found'}), 404
        if to_account.id == from_account.id:
            return jsonify({'error': 'Cannot transfer to same account'}), 400

    txn = Transaction(
        from_account_id=from_account.id if from_account else None,
        to_account_id=to_account.id if to_account else None,
        transaction_type=txn_type,
        amount=amount,
        description=description,
        status='pending'
    )
    db.session.add(txn)
    db.session.commit()
    return jsonify({'message': 'Transaction submitted for approval', 'transaction': txn.to_dict()}), 201


@user_bp.route('/signature', methods=['GET'])
@jwt_required()
def get_signature():
    user_id = int(get_jwt_identity())
    sig = DigitalSignature.query.filter_by(user_id=user_id).first()
    if not sig:
        return jsonify({'signature': None}), 200
    return jsonify({'signature': sig.to_dict()}), 200


@user_bp.route('/signature', methods=['POST'])
@jwt_required()
@active_user_required
def save_signature():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    signature_data = data.get('signature_data')
    signature_type = data.get('signature_type', 'drawn')

    if not signature_data:
        return jsonify({'error': 'signature_data is required'}), 400

    sig = DigitalSignature.query.filter_by(user_id=user_id).first()
    if sig:
        sig.signature_data = signature_data
        sig.signature_type = signature_type
    else:
        sig = DigitalSignature(
            user_id=user_id,
            signature_data=signature_data,
            signature_type=signature_type
        )
        db.session.add(sig)

    db.session.commit()
    return jsonify({'message': 'Signature saved', 'signature': sig.to_dict()}), 200


@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@active_user_required
def dashboard():
    user_id = int(get_jwt_identity())
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [a.id for a in accounts]

    total_balance = sum(float(a.balance) for a in accounts if a.status == 'active')
    pending_txns = Transaction.query.filter(
        db.or_(
            Transaction.from_account_id.in_(account_ids),
            Transaction.to_account_id.in_(account_ids)
        ),
        Transaction.status == 'pending'
    ).count()

    recent_txns = Transaction.query.filter(
        db.or_(
            Transaction.from_account_id.in_(account_ids),
            Transaction.to_account_id.in_(account_ids)
        )
    ).order_by(Transaction.created_at.desc()).limit(5).all()

    return jsonify({
        'total_balance': total_balance,
        'total_accounts': len(accounts),
        'pending_transactions': pending_txns,
        'recent_transactions': [t.to_dict() for t in recent_txns]
    }), 200
