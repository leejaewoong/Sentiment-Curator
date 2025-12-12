"""
Logging configuration
"""
import logging
import sys
from pathlib import Path

from app.config import settings


def setup_logger(name: str = "sentiment-curator") -> logging.Logger:
    """Setup application logger"""
    logger = logging.getLogger(name)

    # Set log level based on environment
    if settings.ENVIRONMENT == "development":
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)

    # Add handler
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger


# Create default logger
logger = setup_logger()
