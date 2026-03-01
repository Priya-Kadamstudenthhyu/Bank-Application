from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'user'), default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    accounts = db.relationship('Account', backref='owner', lazy=True, cascade='all, delete-orphan')
    signature = db.relationship('DigitalSignature', backref='owner', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'has_signature': self.signature is not None
        }


class Account(db.Model):
    __tablename__ = 'accounts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_number = db.Column(db.String(20), nullable=False, unique=True)
    account_type = db.Column(db.Enum('savings', 'checking', 'fixed'), default='savings')
    balance = db.Column(db.Numeric(15, 2), default=0.00)
    status = db.Column(db.Enum('pending', 'active', 'frozen', 'closed'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.from_account_id',
                                        backref='from_account', lazy=True)
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.to_account_id',
                                            backref='to_account', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'account_number': self.account_number,
            'account_type': self.account_type,
            'balance': float(self.balance),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    from_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    to_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    transaction_type = db.Column(db.Enum('deposit', 'withdrawal', 'transfer'), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'approved', 'rejected'), default='pending')
    admin_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'from_account_id': self.from_account_id,
            'to_account_id': self.to_account_id,
            'from_account_number': self.from_account.account_number if self.from_account else None,
            'to_account_number': self.to_account.account_number if self.to_account else None,
            'transaction_type': self.transaction_type,
            'amount': float(self.amount),
            'description': self.description,
            'status': self.status,
            'admin_note': self.admin_note,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DigitalSignature(db.Model):
    __tablename__ = 'digital_signatures'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    signature_data = db.Column(db.Text(length=16777215), nullable=False)  # MEDIUMTEXT
    signature_type = db.Column(db.Enum('drawn', 'uploaded'), default='drawn')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'signature_data': self.signature_data,
            'signature_type': self.signature_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
