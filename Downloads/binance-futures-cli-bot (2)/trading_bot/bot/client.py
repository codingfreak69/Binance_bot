import logging
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
