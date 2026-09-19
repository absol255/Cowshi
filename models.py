from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy import Numeric

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.BigInteger, primary_key=True)

    username = db.Column(
        db.String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    macho_bucks = db.Column(
        db.Numeric,
        default=0,
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    bank_account_number = db.Column(
        db.BigInteger,
        default=999,
    )

    orders = db.relationship("Order", backref="user", lazy=True)
    positions = db.relationship("Position", backref="user", lazy=True)
    trades = db.relationship("Trade", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "macho_bucks": self.macho_bucks,
            "bank_account_number": self.bank_account_number,
        }


class Admin(UserMixin, db.Model):
    __tablename__ = "admins"

    id = db.Column(db.BigInteger, primary_key=True)

    username = db.Column(
        db.String(64),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(256),
        nullable=False
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(
            self.password_hash,
            password
        )


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.BigInteger, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(40), nullable=False, index=True)
    subtitle = db.Column(db.String(240), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    markets = db.relationship("Market", backref="event", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "category": self.category,
            "subtitle": self.subtitle,
        }


class Market(db.Model):
    __tablename__ = "markets"

    id = db.Column(db.BigInteger, primary_key=True)
    ticker = db.Column(db.String(32), unique=True, nullable=False, index=True)
    event_id = db.Column(db.BigInteger, db.ForeignKey("events.id"), nullable=False)
    title = db.Column(db.String(240), nullable=False)
    rules = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="open", nullable=False, index=True)
    yes_price_cents = db.Column(db.Integer, nullable=False, default=50)
    volume_macho_bucks = db.Column(db.Numeric, default=0, nullable=False)
    close_at = db.Column(db.DateTime, nullable=True)
    resolved_outcome = db.Column(db.String(8), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", backref="market", lazy=True)
    positions = db.relationship("Position", backref="market", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "ticker": self.ticker,
            "event_id": self.event_id,
            "title": self.title,
            "rules": self.rules,
            "status": self.status,
            "yes_price_cents": self.yes_price_cents,
            "no_price_cents": 100 - self.yes_price_cents,
            "volume_macho_bucks": self.volume_macho_bucks,
            "close_at": self.close_at.isoformat() if self.close_at else None,
            "resolved_outcome": self.resolved_outcome,
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    market_id = db.Column(db.BigInteger, db.ForeignKey("markets.id"), nullable=False)
    side = db.Column(db.String(8), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    remaining = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(16), default="open", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "market_id": self.market_id,
            "side": self.side,
            "price_cents": self.price_cents,
            "quantity": self.quantity,
            "remaining": self.remaining,
            "status": self.status,
        }


class Position(db.Model):
    __tablename__ = "positions"

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    market_id = db.Column(db.BigInteger, db.ForeignKey("markets.id"), nullable=False)
    yes_contracts = db.Column(db.Integer, default=0, nullable=False)
    no_contracts = db.Column(db.Integer, default=0, nullable=False)
    avg_yes_cents = db.Column(db.Numeric, default=0, nullable=False)
    avg_no_cents = db.Column(db.Numeric, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "market_id": self.market_id,
            "yes_contracts": self.yes_contracts,
            "no_contracts": self.no_contracts,
            "avg_yes_cents": self.avg_yes_cents,
            "avg_no_cents": self.avg_no_cents,
        }


class Trade(db.Model):
    __tablename__ = "trades"

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    market_id = db.Column(db.BigInteger, db.ForeignKey("markets.id"), nullable=False)
    side = db.Column(db.String(8), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    macho_bucks = db.Column(db.Numeric, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "market_id": self.market_id,
            "side": self.side,
            "price_cents": self.price_cents,
            "quantity": self.quantity,
            "macho_bucks": self.macho_bucks,
        }
