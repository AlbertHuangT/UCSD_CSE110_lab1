import { LemonadeStand } from "./lemonadeStand";
import { Day } from "./day";

// quick test
const stand = new LemonadeStand(20);
const day = new Day();
const order = { cups: 10, lemons: 10, sugar: 10, ice: 30 };
console.log(day.temperature, day.weather(), day.prices);
console.log(day.costOf(order));
console.log(stand.buy(order, day.costOf(order)));
console.log(stand.sellCups(day.customerCount()));
console.log(stand);
