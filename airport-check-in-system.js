const fs = require("fs");
const readline = require("readline");

const FILE_PATH = "passengers.json";

class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    leftChild(i) {
        return 2 * i + 1;
    }

    rightChild(i) {
        return 2 * i + 2;
    }

    enqueue(passenger) {
        this.heap.push(passenger);
        this.heapifyUp();
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        while (index > 0 && this.heap[this.parent(index)].priority > this.heap[index].priority) {
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

    getQueue() {
        return [...this.heap].sort((a, b) => a.priority - b.priority);
    }
}

const priorityMapping = {
    "First Class": 1,
    "Business Class": 2,
    "Economy Class": 3
};

function loadPassengers() {
    if (fs.existsSync(FILE_PATH)) {
        return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
    }
    return [];
}

function savePassengers(passengers) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(passengers, null, 2));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const checkInQueue = new PriorityQueue();
const passengers = loadPassengers();
passengers.forEach(passenger => checkInQueue.enqueue(passenger));

function showMenu() {
    console.log("\nAirport Check-in System");
    console.log("1. Add Passenger");
    console.log("2. View Check-in Queue");
    console.log("3. Process Next Passenger");
    console.log("4. Exit");
    rl.question("Choose an option: ", handleUserInput);
}

function handleUserInput(option) {
    switch (option) {
        case "1":
            addPassenger();
            break;
        case "2":
            viewQueue();
            break;
        case "3":
            processNextPassenger();
            break;
        case "4":
            console.log("Exiting system...");
            rl.close();
            break;
        default:
            console.log("Invalid choice. Try again.");
            showMenu();
    }
}

function addPassenger() {
    rl.question("Enter passenger name: ", (name) => {
        rl.question("Enter ticket class (First Class, Business Class, Economy Class): ", (ticketClass) => {
            if (!priorityMapping[ticketClass]) {
                console.log("Invalid class. Try again.");
                return addPassenger();
            }
            rl.question("Any special priority? (VIP, Elderly, Medical, None): ", (special) => {
                let priority = priorityMapping[ticketClass];
                if (special.toLowerCase() !== "none") {
                    priority -= 1;
                }

                const passenger = { name, ticketClass, special, priority };
                checkInQueue.enqueue(passenger);
                savePassengers(checkInQueue.getQueue());

                console.log(`Passsenger ${name} added to the queue.`);
                showMenu();
            });
        });
    });
}

function viewQueue() {
    const queue = checkInQueue.getQueue();
    if (queue.length === 0) {
        console.log("No passengers in queue.");
    } else {
        console.log("Check-in Queue:");
        queue.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.ticketClass} (${p.special})`);
        });
    }
    showMenu();
}

function processNextPassenger() {
    const passenger = checkInQueue.dequeue();
    if (!passenger) {
        console.log("No passengers to process.");
    } else {
        console.log(`Processing ${passenger.name} (${passenger.ticketClass}, ${passenger.special})`);
        savePassengers(checkInQueue.getQueue());
    }
    showMenu();
}

showMenu();