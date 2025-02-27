const readline = require('readline');
const fs = require('fs');

let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUser = null;
let transactionHistory = [];

function clearScreen() {
    for (let x = 0; x <= 100; x++) {
        console.log();
    }
}

function showMainMenu() {
    console.log(`\n==============================`);
    console.log(`🏦 Main Menu`);
    console.log(`==============================`);
    console.log(`1. Check Balance`);
    console.log(`2. Deposit Money`);
    console.log(`3. Withdraw Money`);
    console.log(`4. Transfer Money`);
    console.log(`5. Mini Statement`);
    console.log(`6. Logout`);
    rl.question(`Choose an option: `, handleMenuSelection);
}

function handleMenuSelection(choice) {
    switch (choice) {
        case '1': checkBalance(); break;
        case '2': depositMoney(); break;
        case '3': withdrawMoney(); break;
        case '4': transferMoney(); break;
        case '5': viewMiniStatement(); break;
        case '6': logout(); break;
        default:
            console.log(`❌ Invalid option! Try again.`);
            showMainMenu();
    }
}

function login() {
    clearScreen();
    console.log(`\n==============================`);
    console.log(`🏦 Welcome to CLI ATM System`);
    console.log(`==============================`);

    rl.question(`Enter Account Number: `, (accountNumber) => {
        let user = users.find(u => u.accountNumber === accountNumber);
        if (!user) {
            console.log(`❌ Account not found!`);
            return login();
        }
        rl.question(`Enter PIN: `, (pin) => {
            if (user.pin === pin) {
                console.log(`✅ Login Successful! Welcome, ${user.name}`);
                currentUser = user;
                showMainMenu();
            } else {
                console.log(`❌ Incorrect PIN!`);
                login();
            }
        });
    });
}

function checkBalance() {
    clearScreen();
    console.log(`\n💰 Your Current Balance: $${currentUser.balance}`);
    showMainMenu();
}

function depositMoney() {
    clearScreen();
    rl.question(`\nEnter amount to deposit: `, (amount) => {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            console.log(`❌ Invalid amount!`);
            return depositMoney();
        }
        currentUser.balance += amount;
        saveUserData();
        transactionHistory.push(`Deposited $${amount}`);
        console.log(`✅ Deposit Successful! New Balance: $${currentUser.balance}`);
        showMainMenu();
    });
}

function withdrawMoney() {
    clearScreen();
    rl.question(`\nEnter amount to withdraw: `, (amount) => {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            console.log(`❌ Invalid amount!`);
            return withdrawMoney();
        }
        if (amount > currentUser.balance) {
            console.log(`❌ Insufficient Funds!`);
            return withdrawMoney();
        }
        currentUser.balance -= amount;
        saveUserData();
        transactionHistory.push(`Withdrew $${amount}`);
        console.log(`✅ Withdrawal Successful! New Balance: $${currentUser.balance}`);
        showMainMenu();
    });
}

function transferMoney() {
    clearScreen();
    rl.question(`\nEnter recipient account number: `, (recipientAccount) => {
        let recipient = users.find(u => u.accountNumber === recipientAccount);
        if (!recipient) {
            console.log(`❌ Recipient account not found!`);
            return showMainMenu();
        }
        rl.question(`Enter amount to transfer: `, (amount) => {
            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0 || amount > currentUser.balance) {
                console.log(`❌ Invalid amount!`);
                return showMainMenu();
            }
            currentUser.balance -= amount;
            recipient.balance += amount;
            saveUserData();
            transactionHistory.push(`Transferred $${amount} to ${recipient.accountNumber}`);
            console.log(`✅ Transfer Successful! New Balance: $${currentUser.balance}`);
            showMainMenu();
        });
    });
}

function viewMiniStatement() {
    clearScreen();
    console.log(`\n📜 Mini Statement (Last 5 Transactions)`);
    transactionHistory.slice(-5).forEach((t, index) => console.log(`${index + 1}. ${t} ✅`));
    console.log(`💰 Current Balance: $${currentUser.balance}`);
    showMainMenu();
}

function logout() {
    clearScreen();
    console.log(`\n🔒 Logging Out...`);
    currentUser = null;
    transactionHistory = [];
    login();
}

function saveUserData() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

login();