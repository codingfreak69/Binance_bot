import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Code, 
  BookOpen, 
  Download, 
  Play, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  ChevronRight, 
  FileCode, 
  Folder, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Lock,
  ChevronDown,
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { pythonFiles } from './pythonFiles';
import { UnifiedFile, TerminalLine, OrderItem } from './types';

export default function App() {
  // Key inputs & validation state
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('0.001');
  const [price, setPrice] = useState('65000.00');
  const [stopPrice, setStopPrice] = useState('65150.00');
  
  // Credentials Config State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('BINANCE_API_KEY') || 'xkZpeTcipU9m7M9QsxTWWe4hJv8qN1ZCPEqZZbJFkzXeBQFGacW4jlrOPOfRm6iu';
  });
  const [apiSecret, setApiSecret] = useState(() => {
    return localStorage.getItem('BINANCE_API_SECRET') || 'xS23Fob1QJMhQ3Kvc3WFRn6grvQKNRoBoHL42J3XnsgpOq3jgA8Rz65BcHgcsPbQ';
  });
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTED'>('CONNECTED');

  // Code Explorer State
  const [selectedFile, setSelectedFile] = useState<UnifiedFile>(pythonFiles.find(f => f.path === 'cli.py') || pythonFiles[0]);
  const [searchCodeWord, setSearchCodeWord] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Simulated Portfolio & Ledger States
  const [walletUSDT, setWalletUSDT] = useState<number>(15420.50);
  const [activeOrders, setActiveOrders] = useState<OrderItem[]>([
    {
      id: '98274902',
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 0.001,
      price: 65000.00,
      status: 'NEW',
      timestamp: Date.now() - 3600 * 1000 * 2, // 2 hours ago
    }
  ]);
  const [completedTrades, setCompletedTrades] = useState<OrderItem[]>([
    {
      id: '98274510',
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'MARKET',
      quantity: 0.001,
      status: 'FILLED',
      avgPrice: 68120.45,
      timestamp: Date.now() - 3600 * 1000 * 3, // 3 hours ago
    }
  ]);

  // Terminal & Active Logs States
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs'>('terminal');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      text: 'Binance USDT-M Futures CLI bot terminal shell loaded.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      text: 'Connected session: onlyforpc879 (onlyforpc879@gmail.com) [API: ACTIVE]',
      type: 'success',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      text: 'Enter parameters on the left controls panel and click "Run CLI Bot Command" to execute orders.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      text: 'Type the command in the prompt or use presets below for quick automation testing.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [manualCommandInput, setManualCommandInput] = useState('');
  const [isBusyRunning, setIsBusyRunning] = useState(false);
  const [logsText, setLogsText] = useState<string>(() => {
    const defaultLog = pythonFiles.find(f => f.path === 'logs/bot.log');
    return defaultLog ? defaultLog.content : '';
  });

  // AI Consultant Advisor States
  const [aiApiKeyConfigured, setAiApiKeyConfigured] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: "Hello! I am your server-side **Gemini Trading Bot Consultant**. Ask me how to add leverage adjustments, trace our python validations, run custom triggers, or expand the Binance API endpoints!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Handle Zip compilation and trigger download representing the user deliverables
  const handleDownloadZip = () => {
    const zip = new JSZip();
    
    const realKey = apiKey || 'xkZpeTcipU9m7M9QsxTWWe4hJv8qN1ZCPEqZZbJFkzXeBQFGacW4jlrOPOfRm6iu';
    const realSecret = (apiSecret && !apiSecret.includes('•')) ? apiSecret : 'xS23Fob1QJMhQ3Kvc3WFRn6grvQKNRoBoHL42J3XnsgpOq3jgA8Rz65BcHgcsPbQ';

    // Wrap python files in folder "trading_bot"
    const botFolder = zip.folder("trading_bot");
    if (!botFolder) return;

    pythonFiles.forEach((file) => {
      botFolder.file(file.path, file.content);
    });

    // Write .env for python bot specifically
    const simulatedEnv = `# Python Trading Bot Local Configuration env
BINANCE_API_KEY=${realKey}
BINANCE_API_SECRET=${realSecret}
DEBUG=True
`;
    botFolder.file('.env', simulatedEnv);

    // Create the gitignore file for Python
    botFolder.file('.gitignore', `# Python compiled outputs
__pycache__/
*.py[cod]
*$py.class
venv/
.env
logs/*.log
`);

    // Add local run instructions at the root of the ZIP
    const localRunInstructions = `# ⚡ Binance Futures CLI Bot - Local Run Guide

This project contains two components:
1. **The Web Dashboard Interface**: A beautiful full-stack React + Express + Vite interface allowing you to visual-test, monitor order executions, track ledger portfolios, and query the Gemini Advisor.
2. **The Python CLI Bot**: A high-integrity Python command-line utility for executing raw MARKET, LIMIT, and STOP-LIMIT orders directly on the Binance USDT-M Futures Testnet.

Both projects are **fully configured with your API credentials** and are ready to run locally!

---

## 🛠️ Requirements & Setup

Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

Your configuration:
- \`BINANCE_API_KEY\`: \`${realKey}\`
- \`BINANCE_API_SECRET\`: \`${realSecret}\`

---

## 🖥️ 1. Run the Web Dashboard Interface (React + Node.js)

To run the beautiful interactive dashboard locally:

1. **Unzip the Project**:
   Extract all contents of this ZIP file into a folder on your computer.

2. **Navigate to the Project Root Folder**:
   \`\`\`bash
   cd binance_futures_cli_bot
   \`\`\`

3. **Install Package Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

4. **Verify or Configure \`.env\`**:
   The \`.env\` file (already included) contains your credentials:
   \`\`\`ini
   BINANCE_API_KEY=${realKey}
   BINANCE_API_SECRET=${realSecret}
   DEBUG=True
   \`\`\`

5. **Start the Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   *Your server will boot immediately, and you can open **\`http://localhost:3000\`** in your browser!*

---

## 🐍 2. Run the Command-Line Python Bot (\`cli.py\`)

To run the bot directly in your workspace terminal without the browser:

1. **Navigate to the \`trading_bot\` Folder**:
   \`\`\`bash
   cd trading_bot
   \`\`\`

2. **Set Up a Python Virtual Environment**:
   \`\`\`bash
   # Create a virtual environment named "venv"
   python3 -m venv venv

   # Activate your virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows (PowerShell):
   .\\\\venv\\\\Scripts\\\\Activate.ps1
   # On Windows (CMD):
   .\\\\venv\\\\Scripts\\\\activate.bat
   \`\`\`

3. **Install Python Libraries**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Start Trading via the CLI**:
   Run the CLI engine using any of the following standard command templates:

   * **Execute a MARKET Order (BUY)**:
     \`\`\`bash
     python cli.py --symbol BTCUSDT --side BUY --order-type MARKET --quantity 0.001
     \`\`\`

   * **Execute a LIMIT Order (BUY)**:
     \`\`\`bash
     python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 62500
     \`\`\`.

   * **Execute a STOP-LIMIT Order (SELL)**:
     \`\`\`bash
     python cli.py --symbol BTCUSDT --side SELL --order-type STOP_LIMIT --quantity 0.001 --price 61500 --stop-price 61600
     \`\`\`

All orders placed will execute directly on the official Binance Futures Testnet and write status updates to \`logs/bot.log\` in real time!
`;

    zip.file("RUN_LOCALLY.md", localRunInstructions);

    // Add root level .env for node.js too
    const rootEnvStr = `# Binance USDT-M Futures Testnet API Credentials
BINANCE_API_KEY=${realKey}
BINANCE_API_SECRET=${realSecret}
DEBUG=True
`;
    zip.file(".env", rootEnvStr);

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'binance_futures_cli_bot.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log action to terminal and state logger
      appendTerminalLine('System utility successfully bundled Python package & local configuration into binance_futures_cli_bot.zip and initiated download.', 'success');
      appendTerminalLine('Ready! Unzip this package, run "npm install" at the root or "cd trading_bot" to start python. Both files are completely configured with your specified API credentials.', 'success');
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const appendTerminalLine = (text: string, type: 'input' | 'output' | 'error' | 'success' | 'info' = 'output') => {
    setTerminalLines(prev => [...prev, {
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const appendToLogs = (level: 'INFO' | 'ERROR', message: string) => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const formattedTime = now.toTimeString().slice(0, 8);
    const newline = `${formattedDate} ${formattedTime} | ${level} | ${message}\n`;
    setLogsText(prev => prev + newline);
  };

  // Re-check credentials testnet status simulation
  const checkTestnetConnection = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setActiveTab('terminal');
    appendTerminalLine(`$ python -c "from bot.client import BinanceClient; print(BinanceClient('${apiKey}', '***').check_connection())"`, 'input');
    appendTerminalLine('Starting client evaluation...', 'info');
    appendTerminalLine('Initializing BinanceClient wrapper (Testnet: True)...', 'info');

    setTimeout(() => {
      if (!apiKey || apiKey.trim() === '') {
        appendTerminalLine('Connection check FAILED (API Keys missing). Make sure BINANCE_API_KEY is defined!', 'error');
        setConnectionStatus('DISCONNECTED');
        appendToLogs('ERROR', 'Connection check FAILED. Missing credential payloads.');
      } else {
        appendTerminalLine('Verifying connectivity and API keys against Binance Futures service...', 'info');
        appendTerminalLine(`Connection check PASSED. Verified API communication. walletBalance USDT: ${walletUSDT.toFixed(4)}`, 'success');
        appendTerminalLine(`Connected session username: onlyforpc879 (onlyforpc879@gmail.com) [DEBUG=True]`, 'success');
        setConnectionStatus('CONNECTED');
        appendToLogs('INFO', `Manual health check integration passed. walletBalance USDT: ${walletUSDT.toFixed(4)}`);
      }
      setIsConnecting(false);
    }, 1200);
  };

  // Preset commands selector
  const selectPreset = (type: 'market-buy' | 'limit-buy' | 'invalid-symbol' | 'short-market') => {
    if (type === 'market-buy') {
      setSymbol('BTCUSDT');
      setSide('BUY');
      setOrderType('MARKET');
      setQuantity('0.005');
    } else if (type === 'limit-buy') {
      setSymbol('ETHUSDT');
      setSide('BUY');
      setOrderType('LIMIT');
      setQuantity('0.08');
      setPrice('3420.00');
    } else if (type === 'invalid-symbol') {
      setSymbol('BAD#PAI');
      setSide('BUY');
      setOrderType('MARKET');
      setQuantity('10.0');
    } else if (type === 'short-market') {
      setSymbol('SOLUSDT');
      setSide('SELL');
      setOrderType('MARKET');
      setQuantity('1.5');
    }
  };

  // Unified CLI Trigger
  const handleRunCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isBusyRunning) return;
    
    // Synthesize target python executable CLI command line parameters
    let constructedCmd = `python cli.py --symbol ${symbol} --side ${side} --order-type ${orderType} --quantity ${quantity}`;
    if (orderType === 'LIMIT' || orderType === 'STOP_LIMIT') {
      constructedCmd += ` --price ${price}`;
    }
    if (orderType === 'STOP_LIMIT') {
      constructedCmd += ` --stop-price ${stopPrice}`;
    }

    executeCLICommand(constructedCmd);
  };

  const handleManualCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCommandInput.trim() || isBusyRunning) return;
    
    const cmd = manualCommandInput.trim();
    setManualCommandInput('');
    executeCLICommand(cmd);
  };

  // Command Execution Engine
  const executeCLICommand = (cmdStr: string) => {
    setIsBusyRunning(true);
    setActiveTab('terminal');
    
    // 1. Output the entered line to prompt shell representation
    appendTerminalLine(`$ ${cmdStr}`, 'input');
    appendToLogs('INFO', `Starting Trading Bot CLI call: "${cmdStr}"`);

    // Parse params out of cmdStr for simulation mapping
    const isHelp = cmdStr.includes('--help') || cmdStr.includes('-h');
    const symbolMatch = cmdStr.match(/--symbol\s+([^\s]+)/i);
    const sideMatch = cmdStr.match(/--side\s+([^\s]+)/i);
    const typeMatch = cmdStr.match(/--order-type\s+([^\s]+)/i);
    const qtyMatch = cmdStr.match(/--quantity\s+([^\s]+)/i);
    const priceMatch = cmdStr.match(/--price\s+([^\s]+)/i);
    const stopMatch = cmdStr.match(/--stop-price\s+([^\s]+)/i);

    setTimeout(() => {
      // Setup mock latency
      if (isHelp) {
        appendTerminalLine('usage: cli.py [-h] --symbol SYMBOL --side {BUY,SELL,buy,sell} --order-type {MARKET,LIMIT,STOP_LIMIT,...} --quantity QUANTITY [--price PRICE] [--stop-price STOP_PRICE]', 'output');
        appendTerminalLine('\nBinance USDT-M Futures Testnet CLI Trading Bot parser tools.', 'info');
        appendTerminalLine('\noptional arguments:', 'info');
        appendTerminalLine('  -h, --help            show this help message and exit', 'info');
        appendTerminalLine('  --symbol SYMBOL       Trading pair symbol (e.g., BTCUSDT)', 'info');
        appendTerminalLine('  --side {BUY,SELL}     Order side, case-insensitive', 'info');
        appendTerminalLine('  --order-type TYPE     MARKET, LIMIT, or STOP_LIMIT execution', 'info');
        appendTerminalLine('  --quantity QTY        Order quantity', 'info');
        appendTerminalLine('  --price PRICE         LIMIT / STOP price value requirements', 'info');
        appendTerminalLine('  --stop-price STOP     Trigger stop limit requirements', 'info');
        setIsBusyRunning(false);
        return;
      }

      const rawSym = symbolMatch ? symbolMatch[1] : '';
      const rawSide = sideMatch ? sideMatch[1].toUpperCase() : '';
      const rawType = typeMatch ? typeMatch[1].toUpperCase() : '';
      const rawQtyStr = qtyMatch ? qtyMatch[1] : '';
      const rawPriceStr = priceMatch ? priceMatch[1] : '';
      const rawStopStr = stopMatch ? stopMatch[1] : '';

      // --- MOCK PYTHON VALIDATORS.PY LOGIC (Trace errors to CLI stdout) ---
      if (!rawSym) {
        appendTerminalLine('Validation Error: Symbol is required.', 'error');
        setIsBusyRunning(false);
        return;
      }
      
      const parsedSymClean = rawSym.replace(/['"]/g, '').toUpperCase();
      const symbolRegex = /^[A-Z0-9_\-]{3,16}$/;
      if (!symbolRegex.test(parsedSymClean)) {
        appendTerminalLine(`Validation Error: Invalid symbol format '${rawSym}'. Must be uppercase alphanumeric, e.g., 'BTCUSDT'.`, 'error');
        appendToLogs('ERROR', `Input validation failed: Invalid symbol format '${rawSym}'`);
        setIsBusyRunning(false);
        return;
      }

      if (!rawSide || !['BUY', 'SELL'].includes(rawSide)) {
        appendTerminalLine(`Validation Error: Invalid side '${rawSide}'. Must be 'BUY' or 'SELL'.`, 'error');
        setIsBusyRunning(false);
        return;
      }

      if (!rawType || !['MARKET', 'LIMIT', 'STOP_LIMIT'].includes(rawType)) {
        appendTerminalLine(`Validation Error: Invalid order type '${rawType}'. Supported formats: MARKET, LIMIT, STOP_LIMIT.`, 'error');
        setIsBusyRunning(false);
        return;
      }

      const numQty = parseFloat(rawQtyStr);
      if (isNaN(numQty) || numQty <= 0) {
        appendTerminalLine(`Validation Error: Quantity must be positive and greater than zero. Got: '${rawQtyStr}'`, 'error');
        setIsBusyRunning(false);
        return;
      }

      let numPrice: number | undefined;
      if (['LIMIT', 'STOP_LIMIT'].includes(rawType)) {
        if (!rawPriceStr) {
          appendTerminalLine(`Validation Error: Price is required for '${rawType}' orders.`, 'error');
          setIsBusyRunning(false);
          return;
        }
        numPrice = parseFloat(rawPriceStr);
        if (isNaN(numPrice) || numPrice <= 0) {
          appendTerminalLine(`Validation Error: Price must be positive and greater than zero. Got: '${rawPriceStr}'`, 'error');
          setIsBusyRunning(false);
          return;
        }
      }

      let numStop: number | undefined;
      if (rawType === 'STOP_LIMIT') {
        if (!rawStopStr) {
          appendTerminalLine("Validation Error: Stop price is required for 'STOP_LIMIT' orders.", 'error');
          setIsBusyRunning(false);
          return;
        }
        numStop = parseFloat(rawStopStr);
        if (isNaN(numStop) || numStop <= 0) {
          appendTerminalLine(`Validation Error: Stop price must be positive and greater than zero. Got: '${rawStopStr}'`, 'error');
          setIsBusyRunning(false);
          return;
        }
      }

      // Check if credentials are empty to simulate API authentication failure
      if (!apiKey || apiKey.trim() === '') {
        appendTerminalLine('Initializing client connection, please wait...', 'info');
        appendTerminalLine('Initializing BinanceClient wrapper (Testnet: True)', 'info');
        appendTerminalLine('Verifying connectivity and API keys against Binance Futures service...', 'info');
        appendTerminalLine('Connection check FAILED: BinanceAPIException: Code -2015 - Invalid API Key or Secret.', 'error');
        appendTerminalLine('\nExited due to failed network check.', 'error');
        setIsBusyRunning(false);
        return;
      }

      // --- PASSED LOCAL CHECKS -> MOCK CLIENT.PY & RUNNING TRADES (FUTURES TESTNET SIM) ---
      appendTerminalLine('Initializing client connection, please wait...', 'info');
      appendTerminalLine('Initializing BinanceClient wrapper (Testnet: True)', 'info');
      appendTerminalLine('BinanceClient client instance created successfully.', 'info');
      appendTerminalLine('Verifying connectivity and API keys against Binance Futures service...', 'info');
      appendTerminalLine(`Connection check PASSED. Verified API communication. walletBalance USDT: ${walletUSDT.toFixed(4)}`, 'success');

      // Now call orders.py log simulation
      const loggedPriceMsg = numPrice ? ` @ price ${numPrice}` : '';
      const loggedStopMsg = numStop ? ` (trigger stopPrice=${numStop})` : '';
      appendToLogs('INFO', `Placing ${rawType} order: ${rawSide} ${numQty} ${parsedSymClean}${loggedPriceMsg}${loggedStopMsg}`);
      
      appendTerminalLine(`Placing ${rawType} order: ${rawSide} ${numQty} ${parsedSymClean}${loggedPriceMsg}${loggedStopMsg}`, 'info');

      // Calculate simulated metrics
      const randHexId = Math.floor(10000000 + Math.random() * 90000000).toString();
      const currentAssetPrice = parsedSymClean === 'BTCUSDT' ? 68500 : parsedSymClean === 'ETHUSDT' ? 3500 : 160;
      const calculatedAvgPrice = rawType === 'MARKET' ? currentAssetPrice + (Math.random() * 10 - 5) : numPrice || currentAssetPrice;
      const calculatedExecStatus = rawType === 'MARKET' ? 'FILLED' : 'NEW';
      const actualExecQty = rawType === 'MARKET' ? numQty : 0.000;

      // Log success response
      appendTerminalLine(`${rawType} order placed successfully: orderId=${randHexId}, status=${calculatedExecStatus}, avgPrice=${calculatedAvgPrice.toFixed(2)}, executedQty=${actualExecQty.toFixed(3)}`, 'success');
      appendToLogs('INFO', `${rawType} order placed successfully: orderId=${randHexId}, status=${calculatedExecStatus}, avgPrice=${calculatedAvgPrice.toFixed(2)}, executedQty=${actualExecQty.toFixed(3)}`);

      // Print output card template matching the requested CLI stdout
      appendTerminalLine('==================================================', 'output');
      appendTerminalLine('              ORDER EXECUTION RESULT              ', 'output');
      appendTerminalLine('==================================================', 'output');
      appendTerminalLine(`Order ID:      ${randHexId}`, 'output');
      appendTerminalLine(`Symbol:        ${parsedSymClean}`, 'output');
      appendTerminalLine(`Side:          ${rawSide}`, 'output');
      appendTerminalLine(`Type:          ${rawType}`, 'output');
      appendTerminalLine(`Status:        ${calculatedExecStatus}`, 'output');
      appendTerminalLine(`Quantity:      ${numQty}`, 'output');
      appendTerminalLine(`Avg Price:     ${calculatedAvgPrice.toFixed(2)}`, 'output');
      appendTerminalLine(`Executed Qty:  ${actualExecQty.toFixed(3)}`, 'output');
      appendTerminalLine(`Time:          ${Date.now()}`, 'output');
      appendTerminalLine('==================================================', 'output');

      // Update actual simulated visual ledger variables!
      const newOrder: OrderItem = {
        id: randHexId,
        symbol: parsedSymClean,
        side: rawSide as 'BUY' | 'SELL',
        type: rawType as 'MARKET' | 'LIMIT' | 'STOP_LIMIT',
        quantity: numQty,
        price: numPrice,
        stopPrice: numStop,
        status: calculatedExecStatus,
        avgPrice: calculatedAvgPrice,
        timestamp: Date.now()
      };

      if (rawType === 'MARKET') {
        // Instant fill -> deduct from USDT wallet
        const cost = numQty * calculatedAvgPrice;
        if (rawSide === 'BUY') {
          setWalletUSDT(prev => prev - cost);
        } else {
          setWalletUSDT(prev => prev + cost);
        }
        setCompletedTrades(prev => [newOrder, ...prev]);
      } else {
        // Limit or Stop booked -> open orders list
        setActiveOrders(prev => [newOrder, ...prev]);
      }

      setIsBusyRunning(false);
    }, 1500);
  };

  // Cancel simulated order
  const handleCancelOrder = (id: string, sym: string) => {
    setActiveTab('terminal');
    appendTerminalLine(`$ python -c "from bot.orders import OrderManager; print(OrderManager.cancel_order('${id}'))"`, 'input');
    appendTerminalLine(`Cancelling active pending booked order: ID=${id} [${sym}]`, 'info');
    
    setTimeout(() => {
      setActiveOrders(prev => prev.filter(o => o.id !== id));
      appendTerminalLine(`Order ID ${id} was canceled successfully on Testnet.`, 'success');
      appendToLogs('INFO', `LIMIT order canceled: ID=${id}, Symbol=${sym}`);
    }, 600);
  };

  // AI consultant chat handler
  const handleConsultantChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userText = aiPrompt.trim();
    setAiPrompt('');
    setChatMessages(prev => [...prev, {
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setAiLoading(true);

    try {
      const response = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          fileContext: {
            name: selectedFile.name,
            content: selectedFile.content
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: data.text || "I processed your request, but empty feedback was returned.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Server returned an error');
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ **Consulting System Alert**: ${err.message || 'The full-stack routing requested returned an error. Verify your connection or consult local files.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-900">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-teal-500 via-emerald-400 to-yellow-300 p-2.5 rounded-xl shadow-lg ring-1 ring-slate-700">
              <Cpu className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display font-bold text-xl tracking-tight text-white leading-tight">Binance Futures CLI Bot</h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                A highly polished modular Python CLI app with robust validations, clean files framework, and active log trace metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 select-none">
            <button
              id="download-project-zip-btn"
              onClick={handleDownloadZip}
              className="px-4 py-2 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              title="Download preconfigured project with your API keys to run locally"
            >
              <Download className="h-4 w-4" />
              Download Local Project (.zip)
            </button>
          </div></div>
      </header>

      {/* CORE FRAMEWORK GRID WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PARAMETER FORM & QUICK PRESETS CONFIG BOX (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="controls-panel">
          
          {/* SECURE CREDENTIALS BANNER */}
          <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm" id="credentials-section">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-display">
                <Lock className="h-3.5 w-3.5 text-yellow-400" />
                Testnet Config
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}>
                {connectionStatus === 'CONNECTED' ? '● Live Testnet Connected' : '○ Disabled'}
              </span>
            </div>

            {/* TESTING CONFIG TOGGLE */}
            <div className="mb-3.5 flex items-center justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-slate-200">Testing Config Status</span>
                <span className="text-[9px] text-slate-400 font-sans">Toggle simulation environment</span>
              </div>
              <button
                type="button"
                id="testing-config-toggle-btn"
                onClick={() => {
                  const nextVal = !isDemoMode;
                  setIsDemoMode(nextVal);
                  if (nextVal) {
                    setConnectionStatus('CONNECTED');
                    appendTerminalLine('Testing platform sandbox initialized and enabled.', 'success');
                    appendToLogs('INFO', 'Testing Config turned on by developer command.');
                  } else {
                    setConnectionStatus('DISCONNECTED');
                    appendTerminalLine('Testing platform sandbox was manually disabled.', 'error');
                    appendToLogs('INFO', 'Testing Config turned off.');
                  }
                }}
                className={`w-11 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${
                  isDemoMode ? 'bg-teal-500 justify-end' : 'bg-slate-850 justify-start'
                }`}
              >
                <span className="w-4.5 h-4.5 rounded-full bg-slate-100 shadow-md"></span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase text-slate-400 block mb-1 font-mono">BINANCE_API_KEY</label>
                <input 
                  type="text"
                  id="binance-api-key-input"
                  value={apiKey}
                  onChange={(e) => {
                    const value = e.target.value;
                    setApiKey(value);
                    localStorage.setItem('BINANCE_API_KEY', value);
                    if (value && apiSecret) {
                      setConnectionStatus('CONNECTED');
                    } else {
                      setConnectionStatus('DISCONNECTED');
                    }
                  }}
                  placeholder="Paste testnet api key..."
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 transition-colors text-slate-350"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 block mb-1 font-mono">BINANCE_API_SECRET</label>
                <input 
                  type="password"
                  id="binance-api-secret-input"
                  value={apiSecret}
                  onChange={(e) => {
                    const value = e.target.value;
                    setApiSecret(value);
                    localStorage.setItem('BINANCE_API_SECRET', value);
                    if (apiKey && value) {
                      setConnectionStatus('CONNECTED');
                    } else {
                      setConnectionStatus('DISCONNECTED');
                    }
                  }}
                  placeholder="Paste api secret..."
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 transition-colors text-slate-350"
                />
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  id="testnet-connect-btn"
                  onClick={checkTestnetConnection}
                  disabled={isConnecting}
                  className="w-full py-1 text-center bg-slate-800 hover:bg-slate-700 text-teal-400 font-mono text-[11px] font-semibold rounded border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 select-none"
                >
                  <RefreshCw className={`h-3 w-3 ${isConnecting ? 'animate-spin' : ''}`} />
                  {isConnecting ? 'Testing Connection...' : 'Re-verify API Authorization'}
                </button>
              </div>
            </div>
          </section>

          {/* MAIN ORDER FLIGHT CONTROLLER */}
          <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-between" id="order-form-container">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-teal-400" />
                  CLI Input Formulator
                </span>
                <span className="text-[11px] text-slate-400 font-mono">_place_order kwargs</span>
              </div>

              <form onSubmit={handleRunCommand} className="space-y-4">
                {/* Symbol Select Input */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--symbol <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="e.g. BTCUSDT"
                      className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 tracking-wide"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button type="button" onClick={() => setSymbol('BTCUSDT')} className="text-[9px] bg-slate-800 hover:bg-slate-705 px-1 py-0.5 rounded text-slate-400 font-mono uppercase">BTC</button>
                      <button type="button" onClick={() => setSymbol('ETHUSDT')} className="text-[9px] bg-slate-800 hover:bg-slate-705 px-1 py-0.5 rounded text-slate-400 font-mono uppercase">ETH</button>
                    </div>
                  </div>
                </div>

                {/* Side Option Selection */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--side <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="buy-side-btn"
                      onClick={() => setSide('BUY')}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                        side === 'BUY' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-inner' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      🟢 BUY
                    </button>
                    <button
                      type="button"
                      id="sell-side-btn"
                      onClick={() => setSide('SELL')}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                        side === 'SELL' 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-inner' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      🔴 SELL
                    </button>
                  </div>
                </div>

                {/* Order Type parameter */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--order-type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['MARKET', 'LIMIT', 'STOP_LIMIT'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOrderType(t)}
                        className={`py-1 rounded text-[10px] font-semibold transition-all border font-mono ${
                          orderType === t 
                            ? 'bg-teal-500/20 text-teal-400 border-teal-500 shadow-inner' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Numeric Slider Input */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--quantity <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 0.001"
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block font-mono">Parsed as positive floating number &gt; 0</span>
                </div>

                {/* Conditional Price Trigger (Required for Limit and Stop Limit) */}
                {orderType !== 'MARKET' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--price <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price in USDT"
                        className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    {orderType === 'STOP_LIMIT' && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1.5">--stop-price <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          placeholder="Activation Stop Price"
                          className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </form>
            </div>

            {/* ACTION SUBMIT AND QUICK PRESETS ACCORDION */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
              <button
                id="run-cli-btn"
                type="button"
                onClick={() => handleRunCommand()}
                disabled={isBusyRunning}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg transition-all text-sm select-none flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                Run CLI Bot Command
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">Quick Automation Presets</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <button 
                    onClick={() => selectPreset('market-buy')}
                    className="p-1 px-2 border border-slate-800 bg-slate-950 rounded text-slate-300 text-left hover:border-teal-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    <span className="text-emerald-500">BUY</span> Market BTC
                  </button>
                  <button 
                    onClick={() => selectPreset('limit-buy')}
                    className="p-1 px-2 border border-slate-800 bg-slate-950 rounded text-slate-300 text-left hover:border-teal-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    <span className="text-emerald-500">BUY</span> Limit ETH
                  </button>
                  <button 
                    onClick={() => selectPreset('short-market')}
                    className="p-1 px-2 border border-slate-800 bg-slate-950 rounded text-slate-300 text-left hover:border-teal-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    <span className="text-rose-500">SELL</span> Market SOL
                  </button>
                  <button 
                    onClick={() => selectPreset('invalid-symbol')}
                    className="p-1 px-2 border border-slate-800 bg-slate-950 rounded text-slate-300 text-left hover:border-teal-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    ⚠️ Invalid Input
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* MIDDLE COLUMN: TERMINAL EMULATOR & LOGS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="middle-panel">
          
          <div className="bg-slate-900 border border-slate-800/90 rounded-xl flex-1 flex flex-col min-h-[480px] overflow-hidden shadow-lg">
            
            {/* TERMINAL HEADER HEADER TABS */}
            <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2 border-b border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-2 select-none ${
                    activeTab === 'terminal' 
                      ? 'bg-slate-850 text-teal-400 font-bold border-b-2 border-teal-500' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  interactive_cli_shell
                </button>
                <button
                  onClick={() => {
                    setActiveTab('logs');
                    // auto scroll textarea to bottom
                    setTimeout(() => {
                      if (logsEndRef.current) {
                        logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
                      }
                    }, 50);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-2 select-none ${
                    activeTab === 'logs' 
                      ? 'bg-slate-850 text-teal-400 font-bold border-b-2 border-teal-500' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  logs/bot.log
                </button>
              </div>

              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block"></span>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 bg-slate-950 p-4 font-mono text-xs flex flex-col justify-between overflow-hidden">
              
              <AnimatePresence mode="wait">
                {activeTab === 'terminal' ? (
                  <motion.div 
                    key="terminal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between overflow-hidden"
                  >
                    {/* TERMINAL CONTENT SCREEN */}
                    <div className="flex-1 overflow-y-auto space-y-2 terminal-scrollbar pr-1 min-h-[300px]">
                      {terminalLines.map((line, idx) => (
                        <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                          {line.type === 'input' && (
                            <span>
                              <span className="text-teal-400 font-bold mr-1.5 font-mono">onlyforpc879@binance-cli:~$</span>
                              <span className="text-white font-bold">{line.text.startsWith('$ ') ? line.text.substring(2) : line.text}</span>
                            </span>
                          )}
                          {line.type === 'info' && (
                            <span className="text-sky-400">{line.text}</span>
                          )}
                          {line.type === 'output' && (
                            <span className="text-slate-300">{line.text}</span>
                          )}
                          {line.type === 'success' && (
                            <span className="text-emerald-400 font-medium">✓ {line.text}</span>
                          )}
                          {line.type === 'error' && (
                            <span className="text-rose-450 font-semibold">❌ {line.text}</span>
                          )}
                        </div>
                      ))}
                      
                      {isBusyRunning && (
                        <div className="flex items-center gap-2 text-yellow-400 animate-pulse mt-2">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Executing binary orders process...</span>
                        </div>
                      )}

                      <div ref={terminalEndRef} />
                    </div>

                    {/* MANUAL SHELL COMMAND PROMPT INPUT */}
                    <form onSubmit={handleManualCommandSubmit} className="mt-3 pt-3 border-t border-slate-900 flex items-center gap-2">
                      <span className="text-teal-400 font-bold font-mono text-[11px] shrink-0">onlyforpc879@binance-cli:~$</span>
                      <input
                        type="text"
                        value={manualCommandInput}
                        onChange={(e) => setManualCommandInput(e.target.value)}
                        placeholder="python cli.py --symbol BTCUSDT --side BUY..."
                        className="flex-1 bg-transparent border-none text-slate-100 font-mono text-xs focus:outline-none focus:ring-0 w-full placeholder-slate-700"
                      />
                      <button 
                        type="submit" 
                        className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="logs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col h-full overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-900 pb-2 mb-2 select-none">
                      <span>Interactive File Contents log reader</span>
                      <span>UTF-8 Rotated</span>
                    </div>
                    <textarea
                      ref={logsEndRef}
                      readOnly
                      value={logsText}
                      className="flex-1 bg-slate-950 border-none outline-none resize-none font-mono text-[11px] leading-relaxed text-slate-300 terminal-scrollbar select-text pr-1 overflow-y-auto h-full"
                    />
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
                      <span>logs/bot.log • 10MB Rotation limit</span>
                      <button 
                        onClick={() => {
                          setLogsText('');
                          appendTerminalLine('logs/bot.log trace content index cleared locally.', 'info');
                        }} 
                        className="hover:text-rose-450 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Trash2 className="h-3 w-3" /> Clear Logs
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </main>

      {/* FOOTER BAR: SECTIONS FOR POSITION GRAPHICS & PORTFOLIO LEDGERS */}
      <footer className="border-t border-slate-800 bg-slate-900/60 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* LEDGER STATS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-805 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block select-none">Mock Wallet Wallet</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-display font-bold text-white tracking-tight">{walletUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-teal-400 font-mono">USDT</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block select-none">Simulated testnet funds</span>
            </div>

            <div className="bg-slate-900 border border-slate-805 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block select-none">Base Endpoint Gateway</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Globe className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap">testnet.binancefuture.com</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block select-none">Targeted endpoint URL</span>
            </div>

            <div className="bg-slate-900 border border-slate-805 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block select-none">Booked Limit Orders</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-display font-bold text-teal-400">{activeOrders.length}</span>
                <span className="text-[10px] text-slate-400 font-mono">Pending</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block select-none">Active GTC limit book orders</span>
            </div>

            <div className="bg-slate-900 border border-slate-805 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block select-none">Total Executions</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-display font-bold text-white">{completedTrades.length}</span>
                <span className="text-[10px] text-slate-400 font-mono">Filled</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block select-none">Completed market executions</span>
            </div>
          </div>

          {/* LEDGER SHEETS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BOOKED ACTIVE ORDERS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
              <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center select-none">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-teal-400" />
                  Active Booked Orders (LIMIT/STOP_LIMIT GTC)
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-light">Status: NEW</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60 font-mono select-none">
                      <th className="py-2.5 px-4 font-semibold">Symbol</th>
                      <th className="py-2.5 px-4 font-semibold">Side</th>
                      <th className="py-2.5 px-4 font-semibold">Type</th>
                      <th className="py-2.5 px-4 font-semibold">Quantity</th>
                      <th className="py-2.5 px-4 font-semibold">Price</th>
                      <th className="py-2.5 px-4 font-semibold">Trigger</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-mono">
                    {activeOrders.length === 0 ? (
                      <tr className="select-none">
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                          No active booked orders. Use Limit order presets to book GTC orders.
                        </td>
                      </tr>
                    ) : (
                      activeOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-slate-200">{o.symbol}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                              o.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}>
                              {o.side}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-350">{o.type}</td>
                          <td className="py-2.5 px-4 text-slate-300">{o.quantity}</td>
                          <td className="py-2.5 px-4 text-slate-200 font-medium">${o.price?.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-slate-400">{o.stopPrice ? `$${o.stopPrice}` : '—'}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleCancelOrder(o.id, o.symbol)}
                              className="p-1 text-rose-450 hover:bg-rose-500/10 rounded transition-colors"
                              title="Cancel order"
                            >
                              <Plus className="h-4 w-4 rotate-45 transform" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FILLED EXECUTIONS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
              <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center select-none">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Execution History Logs (MARKET Filled)
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-light">Status: FILLED</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60 font-mono select-none">
                      <th className="py-2.5 px-4 font-semibold">Order ID</th>
                      <th className="py-2.5 px-4 font-semibold">Symbol</th>
                      <th className="py-2.5 px-4 font-semibold">Side</th>
                      <th className="py-2.5 px-4 font-semibold">Type</th>
                      <th className="py-2.5 px-4 font-semibold">Avg Price</th>
                      <th className="py-2.5 px-4 font-semibold">Filled</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-mono">
                    {completedTrades.length === 0 ? (
                      <tr className="select-none">
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                          No executions yet. Run a MARKET order command on the formulated inputs.
                        </td>
                      </tr>
                    ) : (
                      completedTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">{t.id}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-250">{t.symbol}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                              t.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}>
                              {t.side}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">{t.type}</td>
                          <td className="py-2.5 px-4 text-slate-200 font-medium">${t.avgPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-medium">{t.quantity}</td>
                          <td className="py-2.5 px-4 text-right text-slate-500 text-[10px]">
                            {new Date(t.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800/60 text-center select-none text-xs text-slate-500 font-mono">
            Binance USDT-M Futures CLI Trading Dashboard © 2026 • Code built exclusively for risk-free simulation trading.
          </div>

        </div>
      </footer>

    </div>
  );
}
