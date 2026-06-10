# ⚡ Binance Futures CLI Bot - Local Run Guide

This project contains two components:
1. **The Web Dashboard Interface**: A beautiful full-stack React + Express + Vite interface allowing you to visual-test, monitor order executions, track ledger portfolios, and query the Gemini Advisor.
2. **The Python CLI Bot**: A high-integrity Python command-line utility for executing raw MARKET, LIMIT, and STOP-LIMIT orders directly on the Binance USDT-M Futures Testnet.

Both projects are **fully configured with your API credentials** and are ready to run locally!

---

## 🛠️ Requirements & Setup

Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

The workspace has already been set up with your correct API key and secret:
- `BINANCE_API_KEY`: `xkZpeTcip`...
- `BINANCE_API_SECRET`: `xS23Fob1`...

---

## 🖥️ 1. Run the Web Dashboard Interface (React + Node.js)

To run the beautiful interactive dashboard locally:

1. **Navigate to the Project Root Folder**:
   ```bash
   cd binance_futures_cli_bot
   ```

2. **Install Package Dependencies**:
   ```bash
   npm install
   ```

3. **Verify or Configure `.env`**:
   The `.env` file should have the following configurations (already created for you):
   ```ini
   BINANCE_API_KEY=xkZpeTcipU9m7M9QsxTWWe4hJv8qN1ZCPEqZZbJFkzXeBQFGacW4jlrOPOfRm6iu
   BINANCE_API_SECRET=xS23Fob1QJMhQ3Kvc3WFRn6grvQKNRoBoHL42J3XnsgpOq3jgA8Rz65BcHgcsPbQ
   DEBUG=True
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *Your server will boot immediately, and you can open **`http://localhost:3000`** in your browser!*

---

## 🐍 2. Run the Command-Line Python Bot (`cli.py`)

To run the bot directly in your workspace terminal without the browser:

1. **Navigate to the `trading_bot` Folder**:
   ```bash
   cd trading_bot
   ```

2. **Set Up a Python Virtual Environment**:
   ```bash
   # Create a virtual environment named "venv"
   python3 -m venv venv

   # Activate your virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Windows (CMD):
   .\venv\Scripts\activate.bat
   ```

3. **Install Python Libraries**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Check Your Configuration**:
   We have already pre-populated `/trading_bot/.env` with your API key and secret. Verify it has:
   ```ini
   BINANCE_API_KEY=xkZpeTcipU9m7M9QsxTWWe4hJv8qN1ZCPEqZZbJFkzXeBQFGacW4jlrOPOfRm6iu
   BINANCE_API_SECRET=xS23Fob1QJMhQ3Kvc3WFRn6grvQKNRoBoHL42J3XnsgpOq3jgA8Rz65BcHgcsPbQ
   DEBUG=True
   ```

5. **Start Trading via the CLI**:
   Run the CLI engine using any of the following standard command templates:

   * **Execute a MARKET Order (BUY)**:
     ```bash
     python cli.py --symbol BTCUSDT --side BUY --order-type MARKET --quantity 0.001
     ```

   * **Execute a LIMIT Order (BUY)**:
     ```bash
     python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 62500
     ```

   * **Execute a STOP-LIMIT Order (SELL)**:
     ```bash
     python cli.py --symbol BTCUSDT --side SELL --order-type STOP_LIMIT --quantity 0.001 --price 61500 --stop-price 61600
     ```

All orders placed will execute directly on the official Binance Futures Testnet and write status updates to `logs/bot.log` in real time!
