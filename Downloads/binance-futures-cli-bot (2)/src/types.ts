export interface UnifiedFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  timestamp: string;
}

export interface OrderItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'NEW' | 'FILLED' | 'CANCELED';
  avgPrice?: number;
  timestamp: number;
}

export interface LogLine {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARNING';
  message: string;
}
