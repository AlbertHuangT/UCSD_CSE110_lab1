# Class design

```
            Game  (the only class that talks to the console)
           /    \
          v      v
 LemonadeStand    Day
 (they don't know about each other, and neither one prints anything)
```

## Supplies  (shared shape, not a class)
How many of each item. Reused for inventory / recipe / prices / order.
    - property:
        cups: number
        lemons: number
        sugar: number
        ice: number


## LemonadeStand  (the state of the stand)
    - property:
        cash: number            current cash balance
        inventory: Supplies     supplies on hand
        recipe: Supplies        supplies used per cup; fixed, kept across days
        pricePerCup: number     selling price per cup; fixed
    - method:
        buy(order: Supplies, cost: number): boolean
            enough cash -> subtract cost, add order to inventory, return true
            not enough  -> change nothing, return false
        canMakeCup(): boolean
            is every item in inventory >= the amount the recipe needs?
        sellCup(): void
            subtract one recipe's worth from inventory, add pricePerCup to cash
        sellCups(demand: number): number
            sell one cup at a time until demand is met or supplies run out
            (canMakeCup() is false); return the number of cups actually sold


## Day  (today's conditions; a new one is created each day)
    - property:
        temperature: number     random, e.g. 50-100°F
        prices: Supplies        random supply prices for today
    - method:
        costOf(order: Supplies): number
            total cost of an order at today's prices
        customerCount(): number
            how many people want lemonade today; hotter -> more customers
            (plus some randomness)


## Game  (game flow + input/output)
    - property:
        stand: LemonadeStand
        dayNumber: number
    - method:
        playDay()
            1. create a new Day, print the weather and prices
            2. ask the player how many of each supply to buy -> build an order
            3. print the order's total cost and ask to confirm (nice-to-have);
               if not confirmed, go back to 2
            4. stand.buy(order, day.costOf(order)); if not enough cash,
               tell the player and go back to 2
            5. sold = stand.sellCups(day.customerCount())
            6. print cups sold, inventory left, and cash
        run()
            main loop: keep calling playDay(); after each day, ask whether
            to continue
        askNumber(question: string): number
            read one line of input and convert it to a number (via readline)


## Design decisions
- Sell one cup at a time, or N cups at once?
    Both: sellCup() sells one cup, and sellCups(n) calls it in a loop.
    The assignment says inventory is updated every time a cup is sold
    according to the recipe; sellCup() maps directly to that sentence.
- What if supplies run out partway through the day?
    sellCups() checks canMakeCup() before each cup and stops when it can't
    make one, returning the number actually sold. So "customers who wanted
    lemonade" and "cups actually sold" can differ.
- What if the player can't afford the order?
    buy() returns false, and Game is responsible for telling the player and
    asking again. LemonadeStand only decides *whether* a purchase is
    possible, not *how* to talk to the player.
