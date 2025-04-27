# SOLITAIRE IN PHASER

## TO DO:

### Main Game Parts:

+ [x] resize boxes to cards
+ [x] add 52 card deck (52 boxes)
+ [x] format boxes into deck of cards (stack)

### Game Rules:

+ [x] add foundation drop rules
+ [ ] add stockpile -> tableaux drop rules
+ [ ] shuffle cards every page refresh
+ [x] make sub-level tableaux cards facedown
+ [x] click to cycle stockpile cards and loop

+ [x] topcard in tableau in each column are tracked by rank and suit
+ [ ] topcard in tableau in each column are tracked by faceup/facedown status
+ [ ] if topcard is facedown, it's a click handler to flip
+ [x] Make facedown cards non-draggable (and faceup cards draggable), but if a card is topCard and facedown...
+ [ ] ...you can click it and change it to faceup and draggable

+ [ ] a full adjusted dragend function that supports multi-card movement and handle dropping the whole stack properly

+ [ ] Highlight valid drop areas: When dragging a card, you could light up the columns or foundations where it can legally be dropped.

+ [ ] Double-click to auto-move to foundation: double-clicking an Ace or next-in-sequence card automatically jumps it to the right foundation.

### UI:

+ [ ] add button to restart (re-initialize cards) game
+ [ ] track player moves (using phaser system)
+ [ ] when stockpile is all cycled, display btn which resets stockpile (minus cards placed on foundation or tableaux)
+ [ ] clicking the stockpile repeatedly puts revealed card back in stockpile, switching revealed card
+ [ ] add a UI (user interface) showing number of moves, timer, score, etc

+ [ ] create start screen
+ [ ] create end game (show score and moves) page
+ [ ] highscore page

### GUI:

+ [ ] re-position revealed stockpile card and/or foundation cards to remove overlap
+ [ ] add some phaser 'tweens' animations to smooth
+ [x] add card images

### Bugs:

+ [ ] issue where if card dropped to foundation, then switched with other spot, prevents cards from dropping into prev. foundation box

## Tech Used:
+ react-router
+ phaser





Game State Management: It might be helpful to abstract game state management, especially for managing the state of the tableau, stockpile, and foundations, to make future modifications easier.