import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO"):
    """
    Configure application-wide logging.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Define log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Create handlers
    console_handler = logging.StreamHandler(sys.stdout)
    
    file_handler = logging.FileHandler(
        filename=log_dir / "app.log",
        mode="a",  # append mode
        encoding="utf-8"
    )
    
    error_handler = logging.FileHandler(
        filename=log_dir / "errors.log",
        mode="a",
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)  # Only log errors and above
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        datefmt=date_format,
        handlers=[console_handler, file_handler, error_handler]
    )
    
    # Set specific loggers to different levels
    # Reduce noise from third-party libraries
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logging.info("Logging configured successfully")
