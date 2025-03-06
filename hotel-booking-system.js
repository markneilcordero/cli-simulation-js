const fs = require("fs");
const readline = require("readline");

class MinHeap {
    constructor() {
        this.heap = [];
    }

    getParentIndex(index) { return Math.floor((index - 1) / 2); }
    getLeftChildIndex(index) { return 2 * index + 1; }
    getRightChildIndex(index) { return 2 * index + 2; }

    swap(index1, index2) {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    insert(reservation) {
        this.heap.push(reservation);
        this.heapifyUp(this.heap.length - 1);
    }

    heapifyUp(index) {
        let parentIndex = this.getParentIndex(index);
        while (index > 0 && this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
            this.swap(index, parentIndex);
            index = parentIndex;
            parentIndex = this.getParentIndex(index);
        }
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }

    heapifyDown(index) {
        let smallest = index;
        let left = this.getLeftChildIndex(index);
        let right = this.getRightChildIndex(index);

        if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
            smallest = left;
        }
        if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
            smallest = right;
        }
        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }

    compare(a, b) {
        if (a.isVIP && !b.isVIP) return -1;
        if (!a.isVIP && b.siVIP) return 1;
        return new Date(a.checkInDate) - new Date(b.checkInDate);
    }

    getReservations() {
        return [...this.heap].sort((a, b) => this.compare(a, b));
    }

    isEmpty() {
        return this.heap.lenght === 0;
    }
}

function loadReservations() {
    try {
        const data = fs.readFileSync("reservations.json");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveReservations() {
    fs.writeFileSync("reservations.json", JSON.stringify(heap.getReservations(), null, 2));
}

const heap = new MinHeap();
loadReservations().forEach(reservation => heap.insert(reservation));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log("\nHotel Booking System");
    console.log("1. Add Reservation");
    console.log("2. Process Next Reservation");
    console.log("3. View Pending Reservations");
    console.log("4. Cancel Reservation");
    console.log("5. Exit");
    rl.question("\nChoose an option: ", handleMenu);
}

function handleMenu(option) {
    switch (option) {
        case "1":
            addReservation();
            break;
        case "2":
            processReservation();
            break;
        case "3":
            viewReservation();
            break;
        case "4":
            cancelReservation();
            break;
        case "5":
            exitSystem();
            break;
        default:
            console.log("Invalid choice. Try again.");
            showMenu();
    }
}

function addReservation() {
    rl.question("Enter Guest Name: ", name => {
        rl.question("Enter Check-in Date (YYYY-MM-DD): ", date => {
            rl.question("Is VIP? (yes/no): ", vip => {
                const reservation = {
                    name,
                    checkInDate: date,
                    isVIP: vip.toLowerCase() === "yes"
                };
                heap.insert(reservation);
                saveReservations();
                console.log("Reservation added successfully!");
                showMenu();
            });
        });
    });
}

function processReservation() {
    if (heap.isEmpty()) {
        console.log("No reservations to process.");
    } else {
        const reservation = heap.extractMin();
        saveReservations();
        console.log(`Processed Reservation: ${reservation.name}, Check-in: ${reservation.checkInDate}, VIP: ${reservation.isVIP}`);
    }
    showMenu();
}

function viewReservation() {
    const reservations = heap.getReservations();
    if (reservations.length === 0) {
        console.log("No pending reservations.");
    } else {
        console.log("Pending Reservations:");
        reservations.forEach((res, index) => {
            console.log(`${index + 1}. ${res.name} - Check-in: ${res.checkInDate} - VIP: ${res.isVIP ? "Yes" : "No"}`);
        });
    }
    showMenu();
}

function cancelReservation() {
    rl.question("Enter Guest Name to Cancel: ", name => {
        const reservations = heap.getReservations();
        const index = reservations.findIndex(r => r.name === name);

        if (index === -1) {
            console.log("Reservation not found.");
        } else {
            heap.heap.splice(index, 1);
            saveReservations();
            console.log("Reservation cancelled.");
        }
        showMenu();
    });
}

function exitSystem() {
    saveReservations();
    console.log("Goodbye!");
    rl.close();
}

showMenu();