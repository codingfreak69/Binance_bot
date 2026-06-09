# Binance USDT-M Futures Testnet CLI Trading Bot

A robust, modular, and fully tested Python CLI trading bot designed to safely place Market, Limit, and Stop-Limit orders on the Binance USDT-M Futures Testnet. It compiles high-integrity parameter validation, unified structured logging (`logs/bot.log`), connection health tests, and detailed CLI execution summaries in a "risk-free" simulated testnet environment.

---

## 📂 Project Structure

The project maintains a clean separation of concerns, dividing core initialization, API adapters, input checks, logging protocols, and the CLI execution layer:

```text
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
```

- **`bot/client.py`**: Initializes the Binance backend, checks connectivity, handles authentications, and targets the real `https://testnet.binancefuture.com` gateway.
- **`bot/orders.py`**: Converts system inputs into specific API payloads, handling error catching.
- **`bot/validators.py`**: Enforces strict typing, numeric safeguards, symbol patterns, and positive bounds on quantities and prices before reaching Binance.
- **`bot/logging_config.py`**: Directs records into `logs/bot.log` in exact time-stamped structures (`YYYY-MM-DD HH:MM:SS | LEVEL | Message`).

---

## 🛠️ Step-by-Step Installation

### 1. Requirements
Ensure you have **Python 3.9+** installed on your workstation.

### 2. Standard Virtual Environment Layout
Set up a clean virtual environment to isolate the project dependencies:
```bash
# Clone or navigate into the python_bot project folder
cd trading_bot

# Create the virtual environment
python3 -m venv venv

# Activate active scripts
# On Linux/macOS:
source venv/bin/activate
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
```

### 3. Install Package Dependencies
Install the required list of libraries using `pip`:
```bash
pip install -r requirements.txt
```

---

## ⚙️ Configuration Setup

Never program credentials inside code modules. Create a file named `.env` in the root of the project:

```bash
touch .env
```

Open `.env` in your editor and provide your simulated API credentials generated via your Binance Futures Testnet Account:

```ini
BINANCE_API_KEY=your_binance_testnet_key_here
BINANCE_API_SECRET=your_binance_testnet_secret_here
```

*Note: The bot checks for these variables at launch and will fail early with an educational exit signal if they correspond to blank strings.*

---

## 🚀 Usage Examples

Run commands via the unified CLI command-line controller (`cli.py`). The bot automatically checks testnet connectivity, runs input validations, formats trading inputs, places the live order, and prints an elegant receipt:

### 1. Execute a MARKET Order (BUY)
Places a market order for $0.001 \text{ BTC}$ immediately:
```bash
python cli.py --symbol BTCUSDT --side BUY --order-type MARKET --quantity 0.001
```

### 2. Execute a LIMIT Order (BUY)
Places a limit order for $0.001 \text{ BTC}$ booked at an entry price of $\$40,000.00$ with Good-Til-Cancelled (GTC) behavior:
```bash
python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 40000
```

### 3. Execute a STOP_LIMIT Order (SELL - Bonus)
Triggers a Stop-Limit order on market price crosses:
```bash
python cli.py --symbol BTCUSDT --side SELL --order-type STOP_LIMIT --quantity 0.002 --price 44500 --stop-price 44600
```

### 4. Input Validation Error (Price missing for LIMIT)
If you run a LIMIT order without a price:
```bash
python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.005
```
**Output:**
```text
Validation Error: Price is required for LIMIT orders.
```

---

## 📝 Logging Output

Every single transaction is written to `logs/bot.log` in real time. This allows audit checks of API requests, connection confirmations, response payloads, or error outputs.

### Example Logs (`logs/bot.log`)
```text
2026-06-09 05:15:02 | INFO | Starting Trading Bot CLI...
2026-06-09 05:15:02 | INFO | Initializing BinanceClient wrapper (Testnet: True)
2026-06-09 05:15:03 | INFO | BinanceClient client instance created successfully.
2026-06-09 05:15:03 | INFO | Verifying connectivity and API keys against Binance Futures service...
2026-06-09 05:15:04 | INFO | Connection check PASSED. Verified API communication. walletBalance USDT: 15420.5000
2026-06-09 05:15:10 | INFO | Placing MARKET order: BUY 0.001 BTCUSDT
2026-06-09 05:15:11 | INFO | MARKET order placed successfully: orderId=98274510, status=FILLED, avgPrice=68120.45, executedQty=0.001
2026-06-09 05:22:45 | INFO | Placing LIMIT order: BUY 0.001 BTCUSDT @ price 65000.0
2026-06-09 05:22:46 | INFO | LIMIT order placed successfully: orderId=98274902, status=NEW, avgPrice=0.0, executedQty=0.000
```

---

## 🎓 Key Design Decisions & Assumptions

1. **Testnet Authoritative**: The wrapper is strictly focused on simulated USDT-M Futures to guarantee risk-free testing of algorithm implementations.
2. **Explicit Dependency Injection**: No hardcoded API keys exist inside classes, which allows test frameworks to pass credentials mock values natively.
3. **Fail Fast Strategy**: If network errors or validation exceptions occur, the script terminates immediately with status code `1`, avoiding sending malformed calls to trading servers.
4. **Clean Code Integrity**: Relies only on standard standard library elements (`argparse`, `logging`, `re`) combined with the official `python-binance` library.
