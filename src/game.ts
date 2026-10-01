import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LemonadeStand } from "./lemonadeStand";
import { Day } from "./day";
import { type Supplies, SUPPLY_NAMES, roundCents } from "./supplies";

// the only class that talks to the console
export class Game {
    stand: LemonadeStand;
    dayNumber: number;
    rl: readline.Interface;

    constructor() {
        this.stand = new LemonadeStand(20);
        this.dayNumber = 0;
        this.rl = readline.createInterface({ input, output });
    }

    async run(): Promise<void> {
        console.log("Welcome to Lemonade Stand!");
        console.log(`You start with ${money(this.stand.cash)}. Each cup uses ${formatSupplies(this.stand.recipe)}`);
        console.log(`and sells for ${money(this.stand.pricePerCup)}.`);

        let keepPlaying = true;
        while (keepPlaying) {
            this.dayNumber++;
            await this.playDay();
            keepPlaying = await this.askYesNo("Play another day? (y/n) ");
        }

        console.log(`\nGame over after ${this.dayNumber} day${this.dayNumber === 1 ? "" : "s"}. Final cash: ${money(this.stand.cash)}`);
        this.rl.close();
    }

    async playDay(): Promise<void> {
        const day = new Day();
        const cashAtStart = this.stand.cash;

        console.log(`\n========== Day ${this.dayNumber} ==========`);
        console.log(`Weather: ${day.temperature}°F, ${day.weather()}`);
        console.log(`Cash: ${money(this.stand.cash)}`);
        console.log(`Inventory: ${formatSupplies(this.stand.inventory)}`);

        await this.shop(day);

        const customers = day.customerCount();
        const sold = this.stand.sellCups(customers);

        console.log(`\n--- End of Day ${this.dayNumber} ---`);
        console.log(`Customers who wanted lemonade: ${customers}`);
        console.log(`Cups sold: ${sold}${sold < customers ? " (ran out of supplies!)" : ""}`);
        console.log(`Inventory left: ${formatSupplies(this.stand.inventory)}`);
        console.log(`Cash: ${money(this.stand.cash)} (${signedMoney(roundCents(this.stand.cash - cashAtStart))} today)`);
    }

    // keep asking until the player confirms an order they can afford
    async shop(day: Day): Promise<void> {
        while (true) {
            const order: Supplies = { cups: 0, lemons: 0, sugar: 0, ice: 0 };
            for (let i = 0; i < SUPPLY_NAMES.length; i++) {
                this.printShoppingList(day, order, i);
                const name = SUPPLY_NAMES[i];
                order[name] = await this.askNumber(`How many ${name} to buy? `);
            }
            this.printShoppingList(day, order, SUPPLY_NAMES.length);

            // nothing is bought until the player says yes, so saying no is the "undo"
            const cost = day.costOf(order);
            if (!this.stand.canAfford(cost)) {
                console.log(`That costs ${money(cost)} but you only have ${money(this.stand.cash)}. Let's start over.`);
                continue;
            }
            if (!(await this.askYesNo(`Buy all this for ${money(cost)}? (y/n) `))) {
                console.log("OK, let's start over.");
                continue;
            }
            this.stand.buy(order, cost);
            console.log(`Bought for ${money(cost)}.`);
            return;
        }
    }

    // [x] = already entered, [ ] = not entered yet
    printShoppingList(day: Day, order: Supplies, enteredCount: number): void {
        console.log(`\nShopping list (today's prices, cash: ${money(this.stand.cash)})`);
        for (let i = 0; i < SUPPLY_NAMES.length; i++) {
            const name = SUPPLY_NAMES[i];
            const price = money(day.prices[name]);
            if (i < enteredCount) {
                const subtotal = money(roundCents(order[name] * day.prices[name]));
                console.log(`  [x] ${name.padEnd(7)} ${String(order[name]).padStart(4)} x ${price} = ${subtotal}`);
            } else {
                console.log(`  [ ] ${name.padEnd(7)}    - x ${price}`);
            }
        }
        const total = day.costOf(order);
        console.log(`  Total so far: ${money(total)} (cash left: ${money(roundCents(this.stand.cash - total))})`);
    }

    async askNumber(question: string): Promise<number> {
        while (true) {
            const text = (await this.rl.question(question)).trim();
            const n = Number(text);
            if (text !== "" && Number.isInteger(n) && n >= 0) {
                return n;
            }
            console.log("Please enter a whole number (0 or more).");
        }
    }

    async askYesNo(question: string): Promise<boolean> {
        while (true) {
            const text = (await this.rl.question(question)).trim().toLowerCase();
            if (text === "y" || text === "yes") {
                return true;
            }
            if (text === "n" || text === "no") {
                return false;
            }
            console.log("Please enter y or n.");
        }
    }
}

function money(amount: number): string {
    return amount < 0 ? `-$${(-amount).toFixed(2)}` : `$${amount.toFixed(2)}`;
}

function signedMoney(amount: number): string {
    return amount < 0 ? money(amount) : `+${money(amount)}`;
}

function formatSupplies(s: Supplies): string {
    return `${s.cups} cups, ${s.lemons} lemons, ${s.sugar} sugar, ${s.ice} ice`;
}
