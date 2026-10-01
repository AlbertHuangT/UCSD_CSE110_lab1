import { type Supplies, SUPPLY_NAMES, roundCents } from "./supplies";

export class Day {
    temperature: number;
    prices: Supplies;

    constructor() {
        this.temperature = randomInt(50, 100);
        this.prices = {
            cups: randomPrice(0.03, 0.08),
            lemons: randomPrice(0.2, 0.4),
            sugar: randomPrice(0.05, 0.15),
            ice: randomPrice(0.01, 0.03),
        };
    }

    weather(): string {
        if (this.temperature >= 90) {
            return "hot and sunny";
        } else if (this.temperature >= 75) {
            return "warm";
        } else if (this.temperature >= 60) {
            return "mild";
        } else {
            return "cool and cloudy";
        }
    }

    costOf(order: Supplies): number {
        let total = 0;
        for (const name of SUPPLY_NAMES) {
            total += order[name] * this.prices[name];
        }
        return roundCents(total);
    }

    // hotter day -> more customers: about 5 at 50°F up to 30 at 100°F, plus 0~10 random
    customerCount(): number {
        return Math.round((this.temperature - 40) / 2) + randomInt(0, 10);
    }
}

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function randomPrice(min: number, max: number): number {
    return roundCents(min + Math.random() * (max - min));
}
