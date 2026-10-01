// how many of each supply, used for inventory, recipe, prices and orders
export type Supplies = {
    cups: number;
    lemons: number;
    sugar: number;
    ice: number;
};

// lets us loop over the four supplies instead of writing each one out
export const SUPPLY_NAMES: (keyof Supplies)[] = ["cups", "lemons", "sugar", "ice"];

// money is a floating point number, so round to whole cents after doing math on it
export function roundCents(amount: number): number {
    return Math.round(amount * 100) / 100;
}
