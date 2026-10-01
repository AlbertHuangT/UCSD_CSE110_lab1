import { type Supplies, SUPPLY_NAMES, roundCents } from "./supplies";

export class LemonadeStand {
    cash: number;
    inventory: Supplies;
    recipe: Supplies;
    pricePerCup: number;

    constructor(startingCash: number) {
        this.cash = startingCash;
        this.inventory = { cups: 0, lemons: 0, sugar: 0, ice: 0 };
        this.recipe = { cups: 1, lemons: 1, sugar: 1, ice: 3 };      // recipe of lemonade, whole numbers so no float problems
        this.pricePerCup = 2;                                         // price of lemonade
    }

    canAfford(cost: number): boolean {
        return cost <= this.cash;
    }

    // returns false and changes nothing if there is not enough cash
    buy(order: Supplies, cost: number): boolean {
        if (!this.canAfford(cost)) {
            return false;
        }
        this.cash = roundCents(this.cash - cost);
        for (const name of SUPPLY_NAMES) {
            this.inventory[name] += order[name];
        }
        return true;
    }

    canMakeCup(): boolean {
        for (const name of SUPPLY_NAMES) {
            if (this.inventory[name] < this.recipe[name]) {
                return false;
            }
        }
        return true;
    }

    sellCup(): void {
        for (const name of SUPPLY_NAMES) {
            this.inventory[name] -= this.recipe[name];
        }
        this.cash = roundCents(this.cash + this.pricePerCup);
    }

    // sells one cup at a time until demand is met or supplies run out, returns cups actually sold
    sellCups(demand: number): number {
        let sold = 0;
        while (sold < demand && this.canMakeCup()) {
            this.sellCup();
            sold++;
        }
        return sold;
    }
}
