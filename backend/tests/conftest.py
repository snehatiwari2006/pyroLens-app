"""Pytest configuration for backend tests."""
import pytest


def pytest_configure(config):
    """Initialize database before any tests are collected."""
    from app.database import init_db
    init_db()