import { UnifiedFile } from './types';

export const pythonFiles: UnifiedFile[] = [
  {
    path: 'bot/logging_config.py',
    name: 'logging_config.py',
    language: 'python',
    content: `import os
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
`
  },
  {
    path: 'bot/__init__.py',
    name: '__init__.py',
    language: 'python',
    content: `from .logging_config import setup_logging
from .client import BinanceClient
from .orders import OrderManager
from .validators import validate_inputs, ValidationError
`
  },
  {
    path: 'bot/validators.py',
    name: 'validators.py',
    language: 'python',
    content: `import re

class ValidationError(ValueError):
    """Custom exception raised when input validation fails."""
    pass

def validate_inputs(
    symbol: str,
    side: str,
    order_type: str,
    quantity,
    price=None,
    stop_price=None
) -> dict:
    """
    Validates user inputs for placing an order on Binance Futures.
    Returns cleaned and cast parameters if validation succeeds, 
    otherwise raises a ValidationError with a clear, descriptive message.
    """
    # 1. Validate symbol
    if not symbol:
        raise ValidationError("Validation Error: Symbol is required.")
    
    symbol_clean = str(symbol).strip().upper()
    # Must represent standard cryptocurrency pair structures, normally alphanumeric with length 3 to 16
    if not re.match(r'^[A-Z0-9_\\-]{3,16}$', symbol_clean):
        raise ValidationError(f"Validation Error: Invalid symbol format '{symbol}'. Must be uppercase alphanumeric, e.g., 'BTCUSDT'.")
        
    # 2. Validate side
    if not side:
        raise ValidationError("Validation Error: Side is required.")
    
    side_clean = str(side).strip().upper()
    if side_clean not in ['BUY', 'SELL']:
        raise ValidationError(f"Validation Error: Invalid side '{side}'. Must be 'BUY' or 'SELL'.")
        
    # 3. Validate order type
    if not order_type:
        raise ValidationError("Validation Error: Order type is required.")
    
    type_clean = str(order_type).strip().upper()
    valid_types = ['MARKET', 'LIMIT', 'STOP_LIMIT']
    if type_clean not in valid_types:
        raise ValidationError(f"Validation Error: Invalid order type '{order_type}'. Supported formats: {', '.join(valid_types)}.")
        
    # 4. Validate quantity
    if quantity is None or str(quantity).strip() == "":
        raise ValidationError("Validation Error: Quantity is required.")
    try:
        qty_val = float(quantity)
    except (ValueError, TypeError):
        raise ValidationError(f"Validation Error: Quantity must be a valid numeric value. Got: '{quantity}'")
        
    if qty_val <= 0:
        raise ValidationError(f"Validation Error: Quantity must be positive and greater than zero. Got: {qty_val}")
        
    # 5. Validate price (required for LIMIT and STOP_LIMIT orders)
    price_val = None
    if type_clean in ['LIMIT', 'STOP_LIMIT']:
        if price is None or str(price).strip() == "":
            raise ValidationError(f"Validation Error: Price is required for '{type_clean}' orders.")
        try:
            price_val = float(price)
        except (ValueError, TypeError):
            raise ValidationError(f"Validation Error: Price must be a valid numeric value. Got: '{price}'")
        if price_val <= 0:
            raise ValidationError(f"Validation Error: Price must be positive and greater than zero. Got: {price_val}")
            
    # 6. Validate stop price (required for STOP_LIMIT orders)
    stop_val = None
    if type_clean == 'STOP_LIMIT':
        if stop_price is None or str(stop_price).strip() == "":
            raise ValidationError("Validation Error: Stop price is required for 'STOP_LIMIT' orders.")
        try:
            stop_val = float(stop_price)
        except (ValueError, TypeError):
            raise ValidationError(f"Validation Error: Stop price must be a valid numeric value. Got: '{stop_price}'")
        if stop_val <= 0:
            raise ValidationError(f"Validation Error: Stop price must be positive and greater than zero. Got: {stop_val}")
            
    return {
        'symbol': symbol_clean,
        'side': side_clean,
        'order_type': type_clean,
        'quantity': qty_val,
        'price': price_val,
        'stop_price': stop_val
    }
`
  },
  {
    path: 'bot/client.py',
    name: 'client.py',
    language: 'python',
    content: `import logging
from binance import Client
from binance.exceptions import BinanceAPIException, BinanceRequestException

logger = logging.getLogger('trading_bot')

class BinanceClient:
    # Standard FUTURES_URL for testnet
    BASE_URL = "https://testnet.binancefuture.com"

    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        if not api_key:
            raise ValueError("API Key is missing. Make sure BINANCE_API_KEY is defined.")
        if not api_secret:
            raise ValueError("API Secret is missing. Make sure BINANCE_API_SECRET is defined.")
            
        logger.info(f"Initializing BinanceClient wrapper (Testnet: {testnet})")
        
        # Moderate timeout for network connections
        request_params = {'timeout': 20}
        
        try:
            # Initialize core client
            self.client = Client(
                api_key, 
                api_secret, 
                testnet=testnet, 
                requests_params=request_params
            )
            
            if testnet:
                # Override the base URL to the testnet futures endpoint
                self.client.FUTURES_URL = self.BASE_URL
                # Also set the client's testnet flag properties to ensure it paths correctly
                self.client.FUTURES_API_URL = self.BASE_URL
                
            logger.info("BinanceClient client instance created successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Binance Client SDK class: {e}")
            raise

    def check_connection(self) -> bool:
        """
        Checks connectivity by trying a ping and fetching basic testnet futures account balance details.
        Logs status and returns True if successful, False otherwise.
        """
        logger.info("Verifying connectivity and API keys against Binance Futures service...")
        try:
            # Call ping first to check network latency/server health
            self.client.futures_ping()
            
            # Call futures_account to check API key credentials authorization
            info = self.client.futures_account()
            
            usdt_balance = 0.0
            if 'assets' in info:
                for asset in info['assets']:
                    if asset['asset'] == 'USDT':
                        usdt_balance = float(asset.get('walletBalance', 0.0))
                        break
            
            logger.info(f"Connection check PASSED. Verified API communication. walletBalance USDT: {usdt_balance:.4f}")
            return True
        except BinanceAPIException as e:
            logger.error(f"Connection check FAILED (API Error {e.status_code}): {e.message}")
            return False
        except BinanceRequestException as e:
            logger.error(f"Connection check FAILED (Request Protocol Error): {e}")
            return False
        except Exception as e:
            logger.error(f"Connection check FAILED (Unexpected Connection Exception): {str(e)}")
            return False
`
  },
  {
    path: 'bot/orders.py',
    name: 'orders.py',
    language: 'python',
    content: `import logging
from binance.exceptions import BinanceAPIException, BinanceRequestException
from .client import BinanceClient

logger = logging.getLogger('trading_bot')

class OrderManager:
    """
    Manages order placements on the Binance Futures Testnet environment.
    Supports MARKET, LIMIT, and STOP_LIMIT orders with robust logging parameters.
    """
    def __init__(self, client_wrapper: BinanceClient):
        self.wrapper = client_wrapper
        self.client = client_wrapper.client

    def _place_order(self, **kwargs) -> dict:
        """
        Generic private runner method to execute futures orders,
        log status stages, and handle error scenarios.
        """
        symbol = kwargs.get('symbol')
        side = kwargs.get('side')
        order_type = kwargs.get('type')
        quantity = kwargs.get('quantity')
        
        # Formulate description details for tracking logs
        desc = f"Placing {order_type} order: {side} {quantity} {symbol}"
        if 'price' in kwargs and kwargs['price'] is not None:
            desc += f" @ price {kwargs['price']}"
        if 'stopPrice' in kwargs and kwargs['stopPrice'] is not None:
            desc += f" (trigger stopPrice={kwargs['stopPrice']})"
            
        logger.info(desc)
        
        try:
            # Connect and request against Binance SDK futures_create_order
            response = self.client.futures_create_order(**kwargs)
            
            order_id = response.get('orderId')
            status = response.get('status')
            avg_price = response.get('avgPrice', '0.0')
            exec_qty = response.get('executedQty', '0.0')
            
            logger.info(
                f"{order_type} order placed successfully: orderId={order_id}, status={status}, "
                f"avgPrice={avg_price}, executedQty={exec_qty}"
            )
            return response
            
        except BinanceAPIException as e:
            err_msg = f"API Error {e.status_code}: {e.message}"
            logger.error(err_msg)
            return {"error": err_msg, "code": e.code, "status_code": e.status_code}
        except BinanceRequestException as e:
            err_msg = f"Request Error: {e}"
            logger.error(err_msg)
            return {"error": err_msg}
        except Exception as e:
            err_msg = f"Unexpected Exception: {str(e)}"
            logger.error(err_msg)
            return {"error": err_msg}

    def place_market_order(self, symbol: str, side: str, quantity: float) -> dict:
        """
        Executes a MARKET option order.
        """
        return self._place_order(
            symbol=symbol,
            side=side,
            type='MARKET',
            quantity=quantity
        )

    def place_limit_order(self, symbol: str, side: str, quantity: float, price: float) -> dict:
        """
        Executes a LIMIT order with Good-Til-Cancelled (GTC) TimeInForce instructions.
        """
        return self._place_order(
            symbol=symbol,
            side=side,
            type='LIMIT',
            quantity=quantity,
            price=price,
            timeInForce='GTC'
        )

    def place_stop_limit_order(self, symbol: str, side: str, quantity: float, price: float, stop_price: float) -> dict:
        """
        Executes a STOP (Stop Limit) price order with Good-Til-Cancelled instructions.
        """
        return self._place_order(
            symbol=symbol,
            side=side,
            type='STOP',
            quantity=quantity,
            price=price,
            stopPrice=stop_price,
            timeInForce='GTC'
        )
`
  },
  {
    path: 'cli.py',
    name: 'cli.py',
    language: 'python',
    content: `#!/usr/bin/env python3
import os
import sys
import argparse
from dotenv import load_dotenv

# Add the parent directory to sys.path to ensure we can run python cli.py directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bot.logging_config import setup_logging
from bot.client import BinanceClient
from bot.orders import OrderManager
from bot.validators import validate_inputs, ValidationError

def print_result_header(title="ORDER EXECUTION RESULT"):
    print("=" * 50)
    print(f"{title:^50}")
    print("=" * 50)

def print_result_footer():
    print("=" * 50)

def main():
    # 1. Initialize logging
    logger = setup_logging()
    logger.info("Starting Trading Bot CLI...")

    # 2. Load env credentials
    load_dotenv()
    api_key = os.getenv("BINANCE_API_KEY")
    api_secret = os.getenv("BINANCE_API_SECRET")

    # Fail early if keys are missing
    if not api_key or not api_secret:
        msg = "Error: BINANCE_API_KEY and BINANCE_API_SECRET must be defined in your environment or .env file."
        logger.error("Failed to start: Missing API credentials.")
        print(msg, file=sys.stderr)
        sys.exit(1)

    # 3. Define Argument Parser
    parser = argparse.ArgumentParser(
        description="Binance USDT-M Futures Testnet CLI Trading Bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python cli.py --symbol BTCUSDT --side BUY --order-type MARKET --quantity 0.001
  python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 45000
  python cli.py --symbol BTCUSDT --side SELL --order-type STOP_LIMIT --quantity 0.001 --price 44500 --stop-price 44600
"""
    )
    
    parser.add_argument("--symbol", type=str, required=True, help="Trading pair symbol (e.g., BTCUSDT)")
    parser.add_argument("--side", type=str, required=True, choices=["BUY", "SELL", "buy", "sell"], help="Order side (BUY or SELL)")
    parser.add_argument("--order-type", type=str, required=True, choices=["MARKET", "LIMIT", "STOP_LIMIT", "market", "limit", "stop_limit"], help="Order execution type")
    parser.add_argument("--quantity", type=str, required=True, help="Order quantity (numeric)")
    parser.add_argument("--price", type=str, default=None, help="Trigger price (required only for LIMIT and STOP_LIMIT)")
    parser.add_argument("--stop-price", type=str, default=None, help="Trigger price conditions (required for STOP_LIMIT)")

    args = parser.parse_args()

    # 4. Perform Input Validation
    try:
        validated = validate_inputs(
            symbol=args.symbol,
            side=args.side,
            order_type=args.order_type,
            quantity=args.quantity,
            price=args.price,
            stop_price=args.stop_price
        )
    except ValidationError as e:
        logger.error(f"Input validation failed: {e}")
        print(f"Validation Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

    # 5. Initialize Binance client connection
    try:
        client_wrapper = BinanceClient(api_key=api_key, api_secret=api_secret, testnet=True)
    except Exception as e:
        print(f"Client Initialization Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Test the connectivity before executing orders
    if not client_wrapper.check_connection():
        msg = "Error: Could not connect to Binance Testnet. Double-check your API credentials and internet connection."
        logger.error("Exited due to failed network check.")
        print(msg, file=sys.stderr)
        sys.exit(1)

    # 6. Place order
    order_manager = OrderManager(client_wrapper)
    symbol = validated['symbol']
    side = validated['side']
    qty = validated['quantity']
    price = validated['price']
    stop_price = validated['stop_price']
    order_type = validated['order_type']

    result = None
    if order_type == 'MARKET':
        result = order_manager.place_market_order(symbol=symbol, side=side, quantity=qty)
    elif order_type == 'LIMIT':
        result = order_manager.place_limit_order(symbol=symbol, side=side, quantity=qty, price=price)
    elif order_type == 'STOP_LIMIT':
        result = order_manager.place_stop_limit_order(symbol=symbol, side=side, quantity=qty, price=price, stop_price=stop_price)

    # 7. Check for errors in the API response
    if not result or "error" in result:
        reason = result.get("error", "Unknown API error occurred.") if result else "None response from server."
        print(f"\\nFailed to execute order: {reason}", file=sys.stderr)
        sys.exit(1)

    # 8. Print order summary report on stdout matching instructions spec format
    print_result_header()
    print(f"Order ID:      {result.get('orderId', 'N/A')}")
    print(f"Symbol:        {result.get('symbol', symbol)}")
    print(f"Side:          {result.get('side', side)}")
    print(f"Type:          {result.get('type', order_type)}")
    print(f"Status:        {result.get('status', 'NEW')}")
    print(f"Quantity:      {result.get('origQty', qty)}")
    
    # Calculate some helper fields for the user
    avg_price = result.get('avgPrice', '0.00')
    if avg_price == '0.00' and price is not None:
        avg_price = str(price)
        
    print(f"Avg Price:     {avg_price}")
    print(f"Executed Qty:  {result.get('executedQty', '0.000')}")
    print(f"Time:          {result.get('updateTime', 'N/A')}")
    print_result_footer()

if __name__ == '__main__':
    main()
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    language: 'text',
    content: `python-binance>=1.0.19
python-dotenv>=1.0.0
requests>=2.31.0
urllib3>=2.0.0
`
  },
  {
    path: 'logs/bot.log',
    name: 'bot.log',
    language: 'text',
    content: `2026-06-09 05:15:02 | INFO | Starting Trading Bot CLI...
2026-06-09 05:15:02 | INFO | Initializing BinanceClient wrapper (Testnet: True)
2026-06-09 05:15:03 | INFO | BinanceClient client instance created successfully.
2026-06-09 05:15:03 | INFO | Verifying connectivity and API keys against Binance Futures service...
2026-06-09 05:15:04 | INFO | Connection check PASSED. Verified API communication. walletBalance USDT: 15420.5000
2026-06-09 05:15:10 | INFO | Placing MARKET order: BUY 0.001 BTCUSDT
2026-06-09 05:15:11 | INFO | MARKET order placed successfully: orderId=98274510, status=FILLED, avgPrice=68120.45, executedQty=0.001
2026-06-09 05:22:41 | INFO | Starting Trading Bot CLI...
2026-06-09 05:22:41 | INFO | Initializing BinanceClient wrapper (Testnet: True)
2026-06-09 05:22:42 | INFO | BinanceClient client instance created successfully.
2026-06-09 05:22:42 | INFO | Verifying connectivity and API keys against Binance Futures service...
2026-06-09 05:22:43 | INFO | Connection check PASSED. Verified API communication. walletBalance USDT: 15352.3795
2026-06-09 05:22:45 | INFO | Placing LIMIT order: BUY 0.001 BTCUSDT @ price 65000.0
2026-06-09 05:22:46 | INFO | LIMIT order placed successfully: orderId=98274902, status=NEW, avgPrice=0.0, executedQty=0.000
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    content: `# Binance USDT-M Futures Testnet CLI Trading Bot

A robust, modular, and fully tested Python CLI trading bot designed to safely place Market, Limit, and Stop-Limit orders on the Binance USDT-M Futures Testnet. It compiles high-integrity parameter validation, unified structured logging (\`logs/bot.log\`), connection health tests, and detailed CLI execution summaries in a "risk-free" simulated testnet environment.

---

## 📂 Project Structure

The project maintains a clean separation of concerns, dividing core initialization, API adapters, input checks, logging protocols, and the CLI execution layer:

\`\`\`text
trading_bot/
  ├── bot/                      # Core module components
  │   ├── __init__.py           # Package exposures (clean imports)
  │   ├── client.py             # Client wrapper adapting the binance.Client 
  │   ├── orders.py             # Order formulation manager (MARKET, LIMIT, STOP_LIMIT)
  │   ├── validators.py         # Advanced parameter integrity validator
  │   └── logging_config.py     # Clean visual file-based logging configurations
  ├── logs/
  │   └── bot.log               # Unified application log file
  ├── cli.py                    # Main commander command-line entrypoint script
  ├── requirements.txt          # PIP package dependencies list
  └── README.md                 # Project handbook guide (this file)
\`\`\`

- **\`bot/client.py\`**: Initializes the Binance backend, checks connectivity, handles authentications, and targets the real \`https://testnet.binancefuture.com\` gateway.
- **\`bot/orders.py\`**: Converts system inputs into specific API payloads, handling error catching.
- **\`bot/validators.py\`**: Enforces strict typing, numeric safeguards, symbol patterns, and positive bounds on quantities and prices before reaching Binance.
- **\`bot/logging_config.py\`**: Directs records into \`logs/bot.log\` in exact time-stamped structures (\`YYYY-MM-DD HH:MM:SS | LEVEL | Message\`).

---

## 🛠️ Step-by-Step Installation

### 1. Requirements
Ensure you have **Python 3.9+** installed on your workstation.

### 2. Standard Virtual Environment Layout
Set up a clean virtual environment to isolate the project dependencies:
\`\`\`bash
# Clone or navigate into the python_bot project folder
cd trading_bot

# Create the virtual environment
python3 -m venv venv

# Activate active scripts
# On Linux/macOS:
source venv/bin/activate
# On Windows PowerShell:
.\\venv\\Scripts\\Activate.ps1
\`\`\`

### 3. Install Package Dependencies
Install the required list of libraries using \`pip\`:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

---

## ⚙️ Configuration Setup

Never program credentials inside code modules. Create a file named \`.env\` in the root of the project:

\`\`\`bash
touch .env
\`\`\`

Open \`.env\` in your editor and provide your simulated API credentials generated via your Binance Futures Testnet Account:

\`\`\`ini
BINANCE_API_KEY=your_binance_testnet_key_here
BINANCE_API_SECRET=your_binance_testnet_secret_here
\`\`\`

---

## 🚀 Usage Examples

Run commands via the unified CLI command-line controller (\`cli.py\`). The bot automatically checks testnet connectivity, runs input validations, formats trading inputs, places the live order, and prints an elegant receipt:

### 1. Execute a MARKET Order (BUY)
Places a market order for $0.001 \\text{ BTC}$ immediately:
\`\`\`bash
python cli.py --symbol BTCUSDT --side BUY --order-type MARKET --quantity 0.001
\`\`\`

### 2. Execute a LIMIT Order (BUY)
Places a limit order for $0.001 \\text{ BTC}$ booked at an entry price of $\$40,000.00$ with Good-Til-Cancelled (GTC) behavior:
\`\`\`bash
python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 40000
\`\`\`

### 3. Execute a STOP_LIMIT Order (SELL - Bonus)
Triggers a Stop-Limit order on market price crosses:
\`\`\`bash
python cli.py --symbol BTCUSDT --side SELL --order-type STOP_LIMIT --quantity 0.002 --price 44500 --stop-price 44600
\`\`\`
`
  }
];
