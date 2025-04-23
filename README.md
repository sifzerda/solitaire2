# SOLITAIRE IN PHASER

## TO DO:

+ [x] resize boxes to cards
+ [x] add 52 card deck (52 boxes)
+ [x] format boxes into deck of cards (stack)
+ [x] add foundation drop rules
+ [ ] add stockpile -> tableaux drop rules
+ [ ] shuffle cards every page refresh
+ [ ] add button to restart (re-initialize cards) game
+ [ ] track player moves (using phaser system)
+ [x] make sub-level tableaux cards facedown
+ [x] click to cycle stockpile cards and loop
+ [ ] re-position revealed stockpile card and/or foundation cards to remove overlap
+ [ ] issue where if card dropped to foundation, then switched with other spot, prevents cards from dropping into prev. foundation box
+ [ ] add some phaser 'tweens' animations to smooth
+ [ ] when stockpile is all cycled, display btn which resets stockpile (minus cards placed on foundation or tableaux)
+ [ ] clicking the stockpile repeatedly puts revealed card back in stockpile, switching revealed card
+ [ ] add a UI (user interface) showing number of moves, timer, score, etc

+ [x] Make facedown cards non-draggable (and faceup cards draggable), but if a card is topCard and facedown...
+ [ ] ...you can click it and change it to faceup and draggable

### Later:
+ [ ] add card images (later)
+ [ ] create start screen
+ [ ] create end game (show score and moves) page
+ [ ] highscore page

## Tech Used:
+ react-router
+ phaser





Game State Management: It might be helpful to abstract game state management, especially for managing the state of the tableau, stockpile, and foundations, to make future modifications easier.