#!/usr/bin/env python3
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
        print(f"\nFailed to execute order: {reason}", file=sys.stderr)
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

if __name__ == "__main__":
    main()
