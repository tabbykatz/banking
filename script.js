
//   _______                       __                         ______         ________         __        __    __      __
//  /       \                     /  |                       /      \       /        |       /  |      /  |  /  |    /  |
//  $$$$$$$  |  ______   _______  $$ |   __         ______  /$$$$$$  |      $$$$$$$$/______  $$ |____  $$/  _$$ |_   $$ |____    ______
//  $$ |__$$ | /      \ /       \ $$ |  /  |       /      \ $$ |_ $$/          $$ | /      \ $$      \ /  |/ $$   |  $$      \  /      \
//  $$    $$<  $$$$$$  |$$$$$$$  |$$ |_/$$/       /$$$$$$  |$$   |             $$ | $$$$$$  |$$$$$$$  |$$ |$$$$$$/   $$$$$$$  | $$$$$$  |
//  $$$$$$$  | /    $$ |$$ |  $$ |$$   $$<        $$ |  $$ |$$$$/              $$ | /    $$ |$$ |  $$ |$$ |  $$ | __ $$ |  $$ | /    $$ |
//  $$ |__$$ |/$$$$$$$ |$$ |  $$ |$$$$$$  \       $$ \__$$ |$$ |               $$ |/$$$$$$$ |$$ |__$$ |$$ |  $$ |/  |$$ |  $$ |/$$$$$$$ |
//  $$    $$/ $$    $$ |$$ |  $$ |$$ | $$  |      $$    $$/ $$ |               $$ |$$    $$ |$$    $$/ $$ |  $$  $$/ $$ |  $$ |$$    $$ |
//  $$$$$$$/   $$$$$$$/ $$/   $$/ $$/   $$/        $$$$$$/  $$/                $$/  $$$$$$$/ $$$$$$$/  $$/    $$$$/  $$/   $$/  $$$$$$$/
class Account {
    constructor(name, status, balance, creditLine, debt) {
        this.name = name;
        this.isOpen = status || true;


        this.balance = balance;
        this.creditLine = creditLine || 0;

        // debt represents how much of the credit line the account is using/ owes
        this.debt = debt || 0;

        //TODO messages and display have not been integrated to local storage
        // welcome message
        this.message = (`Welcome to the Bank of Tabitha, ${this.name}!\n`) || "";
        this.display = `Accountholder: ${this.name} Balance: ${this.balance} Credit Line: ${this.creditLine}`


        // upon creation account is added to local storage
        this.localStore = function() {
            localStorage.setItem(this.name, JSON.stringify(this));
            return true
        }
        // not sure why I store this but hey might need it later
        this.inStorage = this.localStore() || false;

        // we also want to be able to close accounts

        // TODO isOpen is super weaksauce right now and was just a bandaid, so pay no attention to it.
        this.closeAccount = function() {
            if (!this.isOpen) {
                this.message = `Your account is already closed.`;
                return false;
            }
            if (this.debt) {
                this.message = `Account closure failed. Please pay your credit card debt of ${this.debt} before closing your account.\n`;
                return false;
            }
            this.message = `Sorry to see you go, ${this.name}.\n`;

            if (this.balance > 0) {
                this.message = `First, let's withdraw your balance of ${this.balance}.\n`;
                this.withdraw(this.balance);
            }
            this.message = `Farewell from Bank of Tabitha.\n`;
            this.localStore();
            this.isOpen = false;
        };
        // starting credit line,
        // credit can max out, card declined.
        // TODO we should also be able to increase a creditline.
        // open a line of credit if you don't have one already
        this.openCredit = function (amount) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (!this.creditLine) {
                this.creditLine += amount;
                this.message = `Congrats ${this.name}! You have a credit line of ${this.creditLine}.\n`;
                this.localStore();
                return true;
            }
            this.message = `Hello, ${this.name}. Your account already has a credit line of ${this.creditLine}.\n`;
            return false;
        };

        // using a credit card
        this.useCredit = function (amount) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (this.debt + amount <= this.creditLine) {
                this.debt += amount;
                this.message = `Purchase approved. You are using ${this.debt} of your ${this.creditLine} credit line.\n`;
                this.localStore();
                return true;
            }
            this.message = `Card declined.\n`;
            return false;
        };

        // pay your credit card bill
        this.payCreditCardBill = function (amount) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (amount <= this.debt) {
                this.debt -= amount;
                this.message = `Thanks for paying your bill, ${this.name}. Your new credit card balance is ${this.debt}.\n`;
                this.localStore();
                return true;
            }
            this.message = `Payment failed. Your balance is only ${this.debt}. Please pay that amount or less.\n`;
            return false;
        };

        // deposit
        this.deposit = function (amount) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (this._isPositive(amount)) {
                this.balance += amount;
                this.message = `Deposit successful. ${this.name}, your new balance is ${this.balance}.\n`;
                this.localStore();;
                return true;
            }
            return false;
        };

        // withdraw
        this.withdraw = function (amount) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (this._isAllowed(amount)) {
                this.balance -= amount;
                this.message = `Withdrawal successful. ${this.name}, your new balance is ${this.balance}.\n`;
                this.localStore();
                return true;
            }
            return false;
        };

        // we need to be sure both the withdrawal and deposit are successful to confirm the transfer
        this.transfer = function (amount, account) {
            if (!this.isOpen) {
                this.message = `This account is closed.\n`;
                return false;
            }
            if (this.withdraw(amount) && account.deposit(amount)) {
                this.message = `Transfer successful. ${amount} has been transferred from ${this.name} to ${account.name}.\n`;
                this.localStore();
                return true;
            }
            return false;
        };

        // these methods keep illegal actions from taking place.
        // Not 100% neccesary, but perhaps extensible
        this._isPositive = function (amount) {
            const isPositive = amount > 0;
            if (!isPositive) {
                this.message = `Amount must be positive! Are you trying to make a withdrawal? Use ${this.name}.withdraw().\n`;
                return false;
            }
            return true;
        };

        // reusing/ expanding these makes sense in the future, for creditLine stuff. adding parameters, etc
        this._isAllowed = function (amount) {
            if (!this._isPositive(amount))
                return false;

            const isAllowed = this.balance - amount >= 0;
            if (!isAllowed) {
                this.message = `${this.name}, you have insufficent funds! Your current balance is ${this.balance}.\n`;
                return false;
            }
            return true;
        };

        // Get some info about the account
        this.describe = function () {
            if (!this.isOpen) {
                return `This account is closed.\n`;
            }
            return `${this.name}\'s account:\nBalance: ${this.balance}\nCreditline: ${this.creditLine}\nCredit Card Balance: ${this.debt}\n`;

        };
    }
};


let Tabitha = new Account('Tabitha', true, 1000, 500, 0 );
let Wheatley = new Account("Wheatley", true, 1000, 550, 0);
let Kevin = new Account("Kevin", true, 1000, 550, 0);

//DISPLAY ACCOUNTS

        function allStorage() {
            let values = [],
                keys = Object.keys(localStorage),
                i = keys.length;
            while ( i-- ) {
                values.push(JSON.parse((localStorage.getItem(keys[i]))));
            }
            return values;
        }

        let listAccounts = []
        for (let item of allStorage()) {
            listAccounts.push(revivifyAccount(item['name']))
        }


        listAccounts.map(account => {
        let description = account.describe()
        console.log(description)
        let display = document.querySelector('#display_ul');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(description));
        display.appendChild(li)
        })




let createButton = document.querySelector('#create_button');
createButton.addEventListener('click', function(event) {
    let form = document.querySelector('#new_account_name')
    let accountName = form.value;
    const name = new Account(accountName);
    let messageP = document.querySelector('#create_account_msg');
    let msg = document.createElement('span')
    messageP.appendChild(document.createTextNode(name.message));
    event.preventDefault();
  })

// TRANSACTIONS

const transactButton = document.querySelector('#transact_button');

transactButton.addEventListener('click', function(event) {
    let formAccount = document.querySelector('#formAccount')
    let formTransact = document.querySelector('#formTransact')
    let formOther = document.querySelector('#formOther')
    let formAmount = document.querySelector('#formAmount')
    let accountName = formAccount.value;
    let accountTransact = formTransact.value;
    let accountOther = formOther.value;
    let accountAmount = formAmount.value;
    let transaction;
    if (accountTransact === "balance") {

        let transactMsg = document.querySelector('#transact_account_msg');
        transactMsg.appendChild(document.createTextNode(revivifyAccount(accountName).balance));
        return;
    }
    else if (accountTransact === "withdraw") {
        transaction = revivifyAccount(accountName).withdraw(accountAmount)
    }
    else if (accountTransact === "deposit") {
        transaction = revivifyAccount(accountName).deposit(accountAmount)
    }
    else if (accountTransact === "transfer") {
        let recipient = revivifyAccount(accountOther)
        transaction = revivifyAccount(accountName).transfer(recipient, accountAmount)
    } else {
        transaction= null;
        console.log(accountName, accountTransact, accountOther, accountAmount)
    }
    let transactMsg = document.querySelector('#transact_account_msg');
    transactMsg.appendChild(document.createTextNode(revivifyAccount(accountName).message));
    event.preventDefault();
  })

  // localStorage abuse

function revivifyAccount(accountName) {
    let corpse = JSON.parse(localStorage.getItem(accountName));
    let account = corpse.name
    let accountStatus = corpse.isOpen
    let accountBalance = corpse.balance;
    let accountCreditLine = corpse.creditLine;
    let accountDebt = corpse.debt;
    return new Account(account, accountStatus, accountBalance, accountCreditLine, accountDebt)
}

function localStore(account) {
    localStorage.setItem(account.name, JSON.stringify(account));

}
