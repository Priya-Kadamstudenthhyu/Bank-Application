from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import User, Account, Transaction, DigitalSignature
from app.utils.decorators import admin_required
from datetime import datetime, timedelta
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def dashboard():
    total_users = User.query.filter_by(role='user').count()
    total_accounts = Account.query.count()
    pending_txns = Transaction.query.filter_by(status='pending').count()
    approved_txns = Transaction.query.filter_by(status='approved').count()
    rejected_txns = Transaction.query.filter_by(status='rejected').count()
    active_users = User.query.filter_by(role='user', is_active=True).count()

    # Monthly transaction data for chart (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=31)
        count = Transaction.query.filter(
            Transaction.created_at >= month_start,
            Transaction.created_at < month_end
        ).count()
        monthly_data.append({
            'month': month_start.strftime('%b %Y'),
            'count': count
        })

    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_accounts': total_accounts,
        'pending_transactions': pending_txns,
        'approved_transactions': approved_txns,
        'rejected_transactions': rejected_txns,
        'monthly_data': monthly_data
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')

    query = User.query.filter_by(role='user')
    if search:
        query = query.filter(
            db.or_(
                User.full_name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    users_data = []
    for user in pagination.items:
        ud = user.to_dict()
        ud['account_count'] = len(user.accounts)
        users_data.append(ud)

    return jsonify({
        'users': users_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    data = user.to_dict()
    data['accounts'] = [a.to_dict() for a in user.accounts]
    data['signature'] = user.signature.to_dict() if user.signature else None
    return jsonify({'user': data}), 200


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'error': 'Cannot modify admin status'}), 403
    user.is_active = not user.is_active
    db.session.commit()
    status_text = 'activated' if user.is_active else 'blocked'
    return jsonify({'message': f'User {status_text}', 'user': user.to_dict()}), 200


@admin_bp.route('/accounts', methods=['GET'])
@jwt_required()
@admin_required
def get_accounts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', '')

    query = Account.query
    if status:
        query = query.filter_by(status=status)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'accounts': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages
    }), 200


@admin_bp.route('/accounts/<int:account_id>/activate', methods=['PUT'])
@jwt_required()
@admin_required
def activate_account(account_id):
    account = Account.query.get_or_404(account_id)
    account.status = 'active'
    db.session.commit()
    return jsonify({'message': 'Account activated', 'account': account.to_dict()}), 200


@admin_bp.route('/transactions', methods=['GET'])
@jwt_required()
@admin_required
def get_transactions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', '')
    txn_type = request.args.get('type', '')

    query = Transaction.query
    if status:
        query = query.filter_by(status=status)
    if txn_type:
        query = query.filter_by(transaction_type=txn_type)

    pagination = query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'transactions': [t.to_dict() for t in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages
    }), 200


@admin_bp.route('/transactions/<int:txn_id>/approve', methods=['PUT'])
@jwt_required()
@admin_required
def approve_transaction(txn_id):
    txn = Transaction.query.get_or_404(txn_id)
    data = request.get_json() or {}

    if txn.status != 'pending':
        return jsonify({'error': 'Transaction is not pending'}), 400

    action = data.get('action')  # 'approve' or 'reject'
    if action not in ['approve', 'reject']:
        return jsonify({'error': 'action must be approve or reject'}), 400

    if action == 'approve':
        # Update balances
        amount = float(txn.amount)
        if txn.transaction_type == 'deposit' and txn.to_account_id:
            acc = Account.query.get(txn.to_account_id)
            if acc:
                acc.balance = float(acc.balance) + amount

        elif txn.transaction_type == 'withdrawal' and txn.from_account_id:
            acc = Account.query.get(txn.from_account_id)
            if acc:
                if float(acc.balance) < amount:
                    return jsonify({'error': 'Insufficient balance'}), 400
                acc.balance = float(acc.balance) - amount

        elif txn.transaction_type == 'transfer':
            from_acc = Account.query.get(txn.from_account_id) if txn.from_account_id else None
            to_acc = Account.query.get(txn.to_account_id) if txn.to_account_id else None
            if not from_acc or not to_acc:
                return jsonify({'error': 'Account not found'}), 404
            if float(from_acc.balance) < amount:
                return jsonify({'error': 'Insufficient balance in source account'}), 400
            from_acc.balance = float(from_acc.balance) - amount
            to_acc.balance = float(to_acc.balance) + amount

        txn.status = 'approved'
    else:
        txn.status = 'rejected'

    txn.admin_note = data.get('admin_note', '')
    db.session.commit()

    return jsonify({'message': f'Transaction {txn.status}', 'transaction': txn.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>/signature', methods=['GET'])
@jwt_required()
@admin_required
def get_user_signature(user_id):
    sig = DigitalSignature.query.filter_by(user_id=user_id).first()
    if not sig:
        return jsonify({'signature': None}), 200
    return jsonify({'signature': sig.to_dict()}), 200
