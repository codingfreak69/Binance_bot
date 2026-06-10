import logging
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
