type Supplies = {
    cups: number;
    lemons: number;
    sugar: number;
    ice: number;
};

class LemonadeStand {
    cash: number;
    inventory: Supplies;
    recipe: Supplies;
    pricePerCup: number;

   constructor(startingCash: number){
        this.cash = startingCash;
        this.inventory = { cups: 0, lemons: 0, sugar: 0, ice: 0};
        this.recipe = {cups: 1, lemons: 0.5, sugar: 0.2, ice: 1};      // recipe of lemonade
        this.pricePerCup = 2;                                          // price of lemonade
    }

    canMakeCup(): boolean {
        return this.inventory.cups&&this.inventory.lemons&&this.inventory.sugar&&this.inventory.ice;
    }
}


//test
//TODO delete
const stand = new LemonadeStand(20);
console.log(stand);
console.log(stand.canMakeCup());
