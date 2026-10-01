# Class design

```
            Game  (the only class that talks to the console)
           /    \
          v      v
 LemonadeStand    Day
 (they don't know about each other, and neither one prints anything)
```

Files: `src/supplies.ts`, `src/lemonadeStand.ts`, `src/day.ts`, `src/game.ts`,
and `src/main.ts` (just creates a Game and runs it).

## Supplies  (shared shape, not a class) — supplies.ts
How many of each item. Reused for inventory / recipe / prices / order.
    - property:
        cups: number
        lemons: number
        sugar: number
        ice: number
    - also in this file:
        SUPPLY_NAMES: (keyof Supplies)[]    ["cups", "lemons", "sugar", "ice"],
                                            so code can loop over the four items
        roundCents(amount): number          round money to whole cents


## LemonadeStand  (the state of the stand) — lemonadeStand.ts
    - property:
        cash: number            current cash balance
        inventory: Supplies     supplies on hand
        recipe: Supplies        supplies used per cup; fixed, kept across days
                                (1 cup, 1 lemon, 1 sugar, 3 ice)
        pricePerCup: number     selling price per cup; fixed ($2)
    - method:
        canAfford(cost: number): boolean
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


## Day  (today's conditions; a new one is created each day) — day.ts
    - property:
        temperature: number     random, 50-100°F
        prices: Supplies        random supply prices for today
    - method:
        weather(): string
            "hot and sunny" / "warm" / "mild" / "cool and cloudy"
        costOf(order: Supplies): number
            total cost of an order at today's prices
        customerCount(): number
            how many people want lemonade today; hotter -> more customers
            (about 5 at 50°F up to 30 at 100°F, plus 0-10 random)


## Game  (game flow + input/output) — game.ts
    - property:
        stand: LemonadeStand
        dayNumber: number
        rl: readline.Interface      reads lines from the console
    - method:
        run()
            main loop: keep calling playDay(); after each day, ask whether
            to continue; print final cash at the end
        playDay()
            1. create a new Day, print the weather, cash, and inventory
            2. shop(day)
            3. sold = stand.sellCups(day.customerCount())
            4. print customers, cups sold, inventory left, and cash
        shop(day)
            ask how many of each supply to buy (showing the shopping list
            before each question), then:
            can't afford -> tell the player and start over
            player says no to "Buy all this?" -> start over
            player says yes -> stand.buy(order, cost)
        printShoppingList(day, order, enteredCount)
            [x] for items already entered, [ ] for items not entered yet,
            with today's prices and the total so far
        askNumber(question): number      whole number >= 0, asks again otherwise
        askYesNo(question): boolean      y/yes or n/no, asks again otherwise
    (every method that reads input is `async` and returns a Promise,
     because waiting for the player to type is asynchronous in Node)


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
    LemonadeStand only decides *whether* a purchase is possible
    (canAfford / buy returns false); Game decides *how* to tell the player.
- How does "undo" work?
    Nothing is bought until the player confirms the whole order. Saying "no"
    just throws the order away and starts over, so there is nothing to undo.
- Why whole-number recipe and rounding money to cents?
    TypeScript has one number type (a double). Fractions like 0.2 pile up
    rounding errors (0.19999999...), so the recipe uses whole numbers and
    money is rounded to cents after every calculation.
- Why one Supplies type instead of four separate numbers everywhere?
    Inventory, recipe, prices, and orders all have the same shape, so they
    share one type. SUPPLY_NAMES + `keyof Supplies` let the code loop over
    the four items, and the compiler checks that every name is a real field.
