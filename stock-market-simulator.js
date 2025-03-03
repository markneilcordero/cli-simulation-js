const readline = require('readline');
const fs = require('fs');

class PriorityQueue {
    constructor(compareFn) {
        this.heap = [];
        this.compare = compareFn;
    }

    enqueue(order) {
        this.heap.push(order);
        this.heap.sort(this.compare);
    }

    dequeue() {
        return this.heap.shift();
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    getAll() {
        return this.heap;
    }
}

const buyCompare = (a, b) => b.price - a.price;
const sellCompare = (a, b) => a.price - b.price;

const buyOrders = new PriorityQueue(buyCompare);
const sellOrders = new PriorityQueue(sellCompare);

const DATA_FILE = 'stock_data.json';

function loadOrders() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.buyOrders.forEach(order => buyOrders.enqueue(order));
        data.sellOrders.forEach(order => sellOrders.enqueue(order));
    }
}

function saveOrders() {
    const data = {
        buyOrders: buyOrders.getAll(),
        sellOrders: sellOrders.getAll()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function processOrder(type, ticker, price, quantity) {
    const order = { type, ticker, price, quantity };

    if (type === 'buy') {
        while (!sellOrders.isEmpty() && sellOrders.peek().price <= price && quantity > 0) {
            let match = sellOrders.dequeue();
            let executedQty = Math.min(match.quantity, quantity);
            console.log(`Trade Executed: Bought ${executedQty} ${ticker} at $${match.price}`);

            quantity -= executedQty;
            match.quantity -= executedQty;
            if (match.quantity > 0) sellOrders.enqueue(match);
        }

        if (quantity > 0) {
            order.quantity = quantity;
            buyOrders.enqueue(order);
            console.log(`Buy order placed for ${quantity} ${ticker} at $${price}`);
        }
    } else if (type === 'sell') {
        while (!buyOrders.isEmpty() && buyOrders.peek().price >= price && quantity > 0) {
            let match = buyOrders.dequeue();
            let executedQty = Math.min(match.quantity, quantity);
            console.log(`Trade Executed: Sold ${executedQty} ${ticker} at $${match.price}`);

            quantity -= executedQty;
            match.quantity -= executedQty;
            if (match.quantity > 0) buyOrders.enqueue(match);
        }

        if (quantity > 0) {
            order.quantity = quantity;
            sellOrders.enqueue(order);
            console.log(`Sell order placed for ${quantity} ${ticker} at $${price}`);
        }
    }

    saveOrders();
}

function showOrderBook() {
    console.log("\nOrder Book:");
    console.log("BUY ORDERS:");
    buyOrders.getAll().forEach(order => console.log(`Buy ${order.quantity} ${order.ticker} at $${order.price}`));
    console.log("\nSELL ORDERS:");
    sellOrders.getAll().forEach(order => console.log(`Sell ${order.quantity} ${order.ticker} at $${order.price}`));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function mainMenu() {
    console.log("\nStock Market Simulator");
    console.log("1. Place Buy Order");
    console.log("2. Place Sell Order");
    console.log("3. View Order Book");
    console.log("4. Exit");

    rl.question("Select an option: ", (option) => {
        if (option === '1' || option === '2') {
            rl.question("Enter Ticker Symbol: ", (ticker) => {
                rl.question("Enter Price: ", (price) => {
                    rl.question("Enter Quantity: ", (quantity) => {
                        processOrder(option === '1' ? 'buy' : 'sell', ticker.toUpperCase(), parseFloat(price), parseInt(quantity));
                        mainMenu();
                    });
                });
            });
        } else if (option === '3') {
            showOrderBook();
            mainMenu();
        } else if (option === '4') {
            console.log("Exiting...");
            rl.close();
        } else {
            console.log("Invalid option, try again.");
            mainMenu();
        }
    });
}

loadOrders();
mainMenu();