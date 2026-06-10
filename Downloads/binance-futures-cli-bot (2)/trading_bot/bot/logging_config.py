import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    """
    Sets up application-wide logging to both a rotating file (logs/bot.log)
    and the console. The output matches: YYYY-MM-DD HH:MM:SS | LEVEL | Message
    """
    # Determine absolute path for the directory of python-bot/logs
    current_dir = os.path.dirname(os.path.abspath(__file__))
    bot_root = os.path.dirname(current_dir)
    log_dir = os.path.join(bot_root, 'logs')
    
    # Ensure logs directory exists
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'bot.log')
    
    # Formatter mapping: YYYY-MM-DD HH:MM:SS | LEVEL | Message
    formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    
    # Rotating File Handler
    file_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5, encoding='utf-8')
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # Stream Handler for console output
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)
    
    # Get logger
    logger = logging.getLogger('trading_bot')
    logger.setLevel(logging.INFO)
    
    # Clear preexisting handlers to avoid duplicate message logs
    if logger.hasHandlers():
        logger.handlers.clear()
        
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
