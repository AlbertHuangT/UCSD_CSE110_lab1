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

        console.log(`\nGame over after ${this.dayNumber} days. Final cash: ${money(this.stand.cash)}`);
        this.rl.close();
    }

    async playDay(): Promise<void> {
        const day = new Day();
        const cashAtStart = this.stand.cash;

        console.log(`\n========== Day ${this.dayNumber} ==========`);
        console.log(`Weather: ${day.temperature}°F, ${day.weather()}`);
        console.log(`Cash: ${money(this.stand.cash)}`);
        console.log(`Inventory: ${formatSupplies(this.stand.inventory)}`);
        console.log("Today's prices:");
        for (const name of SUPPLY_NAMES) {
            console.log(`  ${name.padEnd(7)} ${money(day.prices[name])} each`);
        }

        await this.shop(day);

        const customers = day.customerCount();
        const sold = this.stand.sellCups(customers);

        console.log(`\n--- End of Day ${this.dayNumber} ---`);
        console.log(`Customers who wanted lemonade: ${customers}`);
        console.log(`Cups sold: ${sold}${sold < customers ? " (ran out of supplies!)" : ""}`);
        console.log(`Inventory left: ${formatSupplies(this.stand.inventory)}`);
        console.log(`Cash: ${money(this.stand.cash)} (${signedMoney(roundCents(this.stand.cash - cashAtStart))} today)`);
    }

    // keep asking until the player enters an order they can afford
    async shop(day: Day): Promise<void> {
        while (true) {
            const order: Supplies = { cups: 0, lemons: 0, sugar: 0, ice: 0 };
            for (const name of SUPPLY_NAMES) {
                order[name] = await this.askNumber(`How many ${name} to buy? `);
            }

            const cost = day.costOf(order);
            if (this.stand.buy(order, cost)) {
                console.log(`Bought for ${money(cost)}.`);
                return;
            }
            console.log(`That costs ${money(cost)} but you only have ${money(this.stand.cash)}. Try again.`);
        }
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
    return `$${amount.toFixed(2)}`;
}

function signedMoney(amount: number): string {
    return amount < 0 ? `-${money(-amount)}` : `+${money(amount)}`;
}

function formatSupplies(s: Supplies): string {
    return `${s.cups} cups, ${s.lemons} lemons, ${s.sugar} sugar, ${s.ice} ice`;
}
