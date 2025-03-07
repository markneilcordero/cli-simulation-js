const readline = require("readline");
const fs = require("fs");

const DATA_FILE = "traffic_stats.json";

const STATES = ["RED", "GREEN", "YELLOW"];
const TIMINGS = { RED: 5000, GREEN: 4000, YELLOW: 2000 };

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let statistics = loadStatistics();

class TrafficLight {
    constructor() {
        this.state = "RED";
        this.running = false;
    }    

    nextState() {
        const currentIndex = STATES.indexOf(this.state);
        this.state = STATES[(currentIndex + 1) % STATES.length];
        statistics[this.state] += 1;
        saveStatistics();
    }

    async autoMode() {
        this.running = true;
        console.log("Auto Mode Activated.");
        while (this.running) {
            console.log(`\nTraffic Light: ${this.state}`);
            await this.sleep(TIMINGS[this.state]);
            this.nextState();
        }
    }

    stopAutoMode() {
        this.running = false;
        console.log("Auto Mode Stopped.");
    }

    pedestrianCrossing() {
        console.log("Pedestrian Crossing Activated! Changing to RED...");
        this.state = "RED";
        statistics["pedestrianRequests"] += 1;
        saveStatistics();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

function loadStatistics() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return { RED: 0, GREEN: 0, YELLOW: 0, pedestrianRequests: 0 };
}

function saveStatistics() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(statistics, null, 2));
}

async function mainMenu(trafficLight) {
    console.clear();
    console.log("\n Traffic Light Simulation (CLI) ");
    console.log("1. Show Current Traffic Light");
    console.log("2. Change Light Manually");
    console.log("3. Start Auto Mode");
    console.log("4. Stop Auto Mode");
    console.log("5. Pedestrian Crossing");
    console.log("6. View Statistics");
    console.log("7. Exit");

    rl.question("\nChoose an option: ", async (choice) => {
        switch (choice) {
            case "1":
                console.log(`\nCurrent Light: ${trafficLight.state}`);
                break;
            case "2":
                trafficLight.nextState();
                console.log(`\nManual Change: Light is now ${trafficLight.state}`);
                break;
            case "3":
                if (!trafficLight.running) trafficLight.autoMode();
                else console.log("Auto Mode already running.");
                break;
            case "4":
                trafficLight.stopAutoMode();
                break;
            case "5":
                trafficLight.pedestrianCrossing();
                break;
            case "6":
                console.log("\nTraffic Light Statistics:");
                console.log(statistics);
                break;
            case "7":
                console.log("Exiting simulation. Goodbye!");
                rl.close();
                return;
            default:
                console.log("Invalid choice. Try again.");
        }
        setTimeout(() => mainMenu(trafficLight), 1000);
    });
}

const trafficLight = new TrafficLight();
mainMenu(trafficLight);