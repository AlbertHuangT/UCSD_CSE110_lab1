import { LemonadeStand } from "./lemonadeStand";

// quick test
const stand = new LemonadeStand(20);
console.log(stand.canMakeCup());                                             // false
console.log(stand.buy({ cups: 10, lemons: 5, sugar: 5, ice: 20 }, 8));       // true
console.log(stand.buy({ cups: 1, lemons: 1, sugar: 1, ice: 1 }, 100));      // false
console.log(stand.sellCups(8));                                              // 5, ran out of lemons
console.log(stand);
