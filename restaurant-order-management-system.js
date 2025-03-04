const fs = require("fs");
const readline = require("readline");

const DATA_FILE = "orders.json";

class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    parent(index) { return Math.floor((index - 1) / 2); }
    leftChild(index) { return 2 * index + 1; }
    rightChild(index) { return 2 * index + 2; }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    enqueue(order) {
        this.heap.push(order);
        this.heapifyUp(this.heap.length - 1);
    }

    heapifyUp(index) {
        while (index > 0 && this.heap[index].priority < this.heap[this.parent(index)].priority) {
            this.swap(index, this.parent(index));
            index = this.parent(index);
        }
    }

    dequeue() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return root;
    }

    heapifyDown(index) {
        let smallest = index;
        let left = this.leftChild(index);
        let right = this.rightChild(index);

        if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
            smallest = right;
        }

        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    getOrders() {
        return [...this.heap].sort((a, b) => a.priority - b.priority);
    }

    removeById(id) {
        const index = this.heap.findIndex(order => order.id === id);
        if (index === -1) return false;

        this.swap(index, this.heap.length - 1);
        this.heap.pop();
        this.heapifyDown(index);
        return true;
    }
}

const orderQueue = new PriorityQueue();

function loadOrders() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        JSON.parse(data).forEach(order => orderQueue.enqueue(order));
    }
}

function saveOrders() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orderQueue.getOrders(), null, 2));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function showMenu() {
    console.log("\n=== Restaurant Order Management ===");
    console.log("1. Add New Order");
    console.log("2. View Orders");
    console.log("3. Process Next Order");
    console.log("4. Cancel Order");
    console.log("5. Exit");
    rl.question("Choose an option: ", handleUserInput);
}

function handleUserInput(choice) {
    switch (choice.trim()) {
        case "1":
            addOrder();
            break;
        case "2":
            viewOrders();
            break;
        case "3":
            processNextOrder();
            break;
        case "4":
            cancelOrder();
            break;
        case "5":
            console.log("Exiting... Saving data.");
            saveOrders();
            rl.close();
            return;
        default:
            console.log("Invalid choice, please try again.");
            showMenu();
    }
}

function addOrder() {
    rl.question("Enter Customer Name: ", (customer) => {
        rl.question("Enter Order Details: ", (details) => {
            rl.question("Enter Priority (1-5, 1 = Highest): ", (priority) => {
                const order = {
                    id: Date.now(),
                    customer,
                    details,
                    priority: parseInt(priority),
                };
                orderQueue.enqueue(order);
                console.log("Order added successfully!");
                saveOrders();
                showMenu();
            });
        });
    });
}

function viewOrders() {
    console.log("\n=== Pending Orders ===");
    const orders = orderQueue.getOrders();
    if (orders.length === 0) {
        console.log("No pending orders.");
    } else {
        orders.forEach((order, index) => {
            console.log(`${index + 1}. [Priority: ${order.priority}] ${order.customer} - ${order.details}`);
        });
    }
    showMenu();
}

function processNextOrder() {
    const order = orderQueue.dequeue();
    if (!order) {
        console.log("No orders to process.");
    } else {
        console.log(`Processing Order: ${order.customer} - ${order.details}`);
        saveOrders();
    }
    showMenu();
}

function cancelOrder() {
    rl.question("Enter Order ID to Cancel: ", (id) => {
        if (orderQueue.removeById(parseInt(id))) {
            console.log("Order canceled successfully.");
            saveOrders();
        } else {
            console.log("Order not found.");
        }
        showMenu();
    });
}

loadOrders();
showMenu();