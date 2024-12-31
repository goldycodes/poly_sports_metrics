const WebSocket = require('ws');
const EventEmitter = require('events');

class PolymarketWebSocket extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.markets = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        try {
            this.ws = new WebSocket('wss://ws-subscriptions-clob.polymarket.com/ws/market');

            this.ws.on('open', () => {
                console.log('[WebSocket] Connected');
                this.reconnectAttempts = 0;
                this.subscribeToMarkets();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.emit('update', message);
                } catch (error) {
                    console.error('[WebSocket] Message parse error:', error);
                }
            });

            this.ws.on('close', () => {
                console.log('[WebSocket] Disconnected');
                this.handleReconnect();
            });

            this.ws.on('error', (error) => {
                console.error('[WebSocket] Error:', error);
            });

        } catch (error) {
            console.error('[WebSocket] Connection error:', error);
            this.handleReconnect();
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`[WebSocket] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
        }
    }

    subscribeToMarkets() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            for (const marketId of this.markets) {
                this.ws.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'market',
                    market: marketId
                }));
            }
        }
    }

    addMarket(marketId) {
        this.markets.add(marketId);
        this.subscribeToMarkets();
    }
}

module.exports = PolymarketWebSocket; 