import re

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
    if not re.match(r'^[A-Z0-9_\-]{3,16}$', symbol_clean):
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
