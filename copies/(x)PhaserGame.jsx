// DND from stockpile to tableau works, but to foundation doesn't

// PhaserGame.js
import { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { createFoundationBox } from './foundations'; // Import the foundation functions
import { createCard } from './CardCreator'; // Import the card creation function

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: 595,
      height: 1000,
      backgroundColor: '#38c940', // green background
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
    };
  }, []);

  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  // Preload card images
  function preload() {
    ranks.forEach(rank => {
      suits.forEach(suit => {
        this.load.image(`${rank}_${suit}`, `src/assets/cards/${rank}_${suit}.png`);
        this.load.image('card_back', 'src/assets/cards/red_joker.png');
      });
    });
  }

  // ------------------------------ CREATE MAIN ELEMENTS ------------------------------//

  function create() {
    const deck = []; // Deck for tableaux
    const stockpile = []; // Stockpile
    const foundations = []; // Foundations for the game
    const revealedCards = []; // Area to hold revealed cards
  
    const rows = 7;
    const cols = 7;
    const spacingX = 70;
    const spacingY = 40;
    const startX = 80;
    const startY = 300;
  
    // Stockpile spacing
    const stockpileX = 80;
    const stockpileY = 190;
  
    // Revealed card position
    const revealedX = 180;
    const revealedY = 190;
  
    // Create stockpile cards
    for (let i = 0; i < 24; i++) {
      const card = createCard(this, stockpileX, stockpileY - i * 5, i);
      stockpile.push(card);
    }

    // STOCKPILE CYCLE AND DND ---------------------------------------------------------//

    function updateStockpileInteractivity(scene) {
      // Disable interactivity for all cards in the stockpile
      stockpile.forEach((card, index) => {
        card.disableInteractive();
      });
  
  // Set the top card as interactive
  const topCard = stockpile[stockpile.length - 1];
  if (topCard) {
    topCard.setInteractive();
    topCard.on('pointerdown', () => {
      cycleStockpile(scene); // Pass the Phaser scene context to cycle the stockpile
    });
  }
}

function cycleStockpile(scene) {
  if (stockpile.length > 0) {
    const topCard = stockpile.pop(); // Remove the top card from stockpile

    // Move the top card to the revealed area
    topCard.setPosition(revealedX, revealedY); // Position it to the right
    topCard.setInteractive(); // Make it draggable
    scene.input.setDraggable(topCard); // Enable dragging
    revealedCards.push(topCard); // Add to revealed cards array

    // Flip the card face-up
    topCard.flipCard(); // Use the flipCard method to make it face-up

    // Disable interactivity for the revealed card (so it doesn't trigger cycling)
    topCard.off('pointerdown');

    // Update the positions of all remaining stockpile cards
    stockpile.forEach((card, index) => {
      card.setPosition(stockpileX, stockpileY - index * 5);
    });

    updateStockpileInteractivity(scene); // Update interactivity for the new top card
  }
}
  
    // Replace `revealTopCard` calls with `cycleStockpile` where necessary
    updateStockpileInteractivity(this); // Correct context here

// ---------------------------------------------------------------------------------//
    
// Create tableaux layout (cards will be face-down initially)
const lastCardsInColumn = []; // Array to track the last face-up card in each column

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    if (col >= row) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // Check if this is the last card in the column (i.e., last row for the current column)
      const isFaceUp = (row === col); // Last card in the column should be face-up, others face-down

      const card = createCard(this, x, y, row * cols + col, 60, 90, 0x000000, isFaceUp);
      this.input.setDraggable(card);
      deck.push(card);
      // Track the last face-up card in each column
      if (isFaceUp) {
        lastCardsInColumn[col] = card; // Set this card as the last card for this column
      }
    }
  }
}

// Function to update the face-up status of the last card in each column
function updateLastCardInColumn(col) {
  const columnCards = deck.filter(card => card.x === startX + col * spacingX); // Get all cards in the column

  // Find the last card in the column
  const lastCard = columnCards[columnCards.length - 1];

  // Update face-up status
  columnCards.forEach(card => {
    if (card === lastCard) {
      card.flipCard(); // Set the last card to face-up
    } else {
      card.setData('isFaceUp', false); // Set other cards face-down
      card.flipCard(); // Flip back to face-down
    }
  });

  // Update the tracked last card
  lastCardsInColumn[col] = lastCard; // Update the last card in this column
}

    // Create foundation boxes with bounds
    const foundationX = 150;
    const foundationY = 90;
    for (let i = 0; i < 4; i++) {
      const box = createFoundationBox(this, foundationX + i * 100, foundationY, i);
      box.setData('bounds', new Phaser.Geom.Rectangle(foundationX + i * 100, foundationY, 70, 100));
      foundations.push(box);
    }

    /// SPECIAL DEBUG DROP ALL ZONE ---------------------------------------------------------////

    // Create the fifth foundation box
    const fifthFoundationX = foundationX + 400; // Adjust position as needed
    const fifthFoundation = createFoundationBox(this, fifthFoundationX, foundationY, 4);
    fifthFoundation.setData('bounds', new Phaser.Geom.Rectangle(fifthFoundationX, foundationY, 70, 100));
    foundations.push(fifthFoundation);

    // ------------------------------------ DRAG EVENTS ------------------------------------///

  // Call this whenever a card is moved (e.g., after dragging or during gameplay)
  // for switching face-up and face-down card status
  this.input.on('dragend', (pointer, gameObject) => {
    if (gameObject && gameObject.input && gameObject.input.dragStartX) {
      const columnIndex = Math.floor((gameObject.x - startX) / spacingX);
      updateLastCardInColumn(columnIndex); // Update last card after drag ends
    }
  });

  // ---------------- TABLEAUX DND -------------//

  this.input.on('dragend', (pointer, gameObject) => {
    if (gameObject && gameObject.input && gameObject.input.dragStartX) {
      // Check if the card was dropped on a tableau column
      let droppedInTableau = false;
      for (let col = 0; col < cols; col++) {
        const bounds = new Phaser.Geom.Rectangle(startX + col * spacingX, startY, 70, (rows * spacingY)); // The column bounds (height adjusted to cover entire column)
        const cardColumn = deck.filter(card => card.x === startX + col * spacingX); // All cards in this column
  
        // Check if card is dropped within the bounds of a tableau column
        if (Phaser.Geom.Rectangle.Overlaps(bounds, gameObject.getBounds())) {
          droppedInTableau = true;
  
          // Validate that the card can be placed on the tableau (following solitaire rules)
          const draggedRank = gameObject.getData('rank');
          const draggedSuit = gameObject.getData('suit');
          const lastCardInColumn = lastCardsInColumn[col];
  
          // If there is a card in the column (not empty), the rank must be one lower and alternating colors in suit
          if (lastCardInColumn) {
            const currentRank = lastCardInColumn.getData('rank');
            const currentSuit = lastCardInColumn.getData('suit');
  
            const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const nextRankIndex = rankOrder.indexOf(currentRank) - 1;
            const nextRank = rankOrder[nextRankIndex];
  
            // Check if the rank is correct and the suit is alternating (red/black)
            if (draggedRank === nextRank && isAlternatingColor(currentSuit, draggedSuit)) {
              // Place the card in the column
              lastCardInColumn.setData('isFaceUp', true); // Set previous card face-up
              lastCardsInColumn[col] = gameObject; // Update the top card of the column
              gameObject.setPosition(startX + col * spacingX, startY + (cardColumn.length - 1) * spacingY); // Position the card correctly
              gameObject.setDepth(cardColumn.length); // Set the depth correctly (stacking cards)
              cardColumn.push(gameObject); // Add the card to the column
  
              // Remove the card from the stockpile
              stockpile.splice(stockpile.indexOf(gameObject), 1);
              updateStockpileInteractivity(scene); // Update the stockpile interactivity
  
              // Update the tableau column’s top card
              updateLastCardInColumn(col);
  
              break; // Exit the loop once a valid drop has been found
            }
          } else if (draggedRank === 'K') {
            // If the column is empty, only a King can be placed
            lastCardsInColumn[col] = gameObject;
            gameObject.setPosition(startX + col * spacingX, startY); // Position the card at the start of the column
            gameObject.setDepth(0); // Set the depth correctly (stacking cards)
            cardColumn.push(gameObject); // Add the card to the column
  
            // Remove the card from the stockpile
            stockpile.splice(stockpile.indexOf(gameObject), 1);
            updateStockpileInteractivity(scene); // Update the stockpile interactivity
  
            break; // Exit the loop once a valid drop has been found
          }
        }
      }
  
      // If not dropped in a valid location, return the card to its original position
      if (!droppedInTableau) {
        gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
      }
    }
  });

  function isAlternatingColor(suit1, suit2) {
    const redSuits = ['hearts', 'diamonds'];
    const blackSuits = ['spades', 'clubs'];
  
    // Return true if one suit is red and the other is black
    return (redSuits.includes(suit1) && blackSuits.includes(suit2)) ||
           (blackSuits.includes(suit1) && redSuits.includes(suit2));
  }

  function updateLastCardInColumn(col) {
    const columnCards = deck.filter(card => card.x === startX + col * spacingX); // Get all cards in the column
    const lastCard = columnCards[columnCards.length - 1]; // Last card is the top card
    lastCardsInColumn[col] = lastCard; // Update the top card for this column
  }






    // -----------------------------//

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setScale(1.1);
      gameObject.setDepth(1);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setPosition(dragX, dragY);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1);
      gameObject.setDepth(0);

      // Check if card overlaps any foundation box
      let droppedInFoundation = false;
      foundations.forEach((box, index) => {
        const bounds = box.getData('bounds');
        const currentCard = box.getData('card'); // Get any card that may be in the foundation

        // Check if the card overlaps with the foundation box
        if (Phaser.Geom.Rectangle.Overlaps(bounds, gameObject.getBounds())) {
          droppedInFoundation = true;

          if (index === 4) {
            // SPECIAL RULE FOR FIFTH FOUNDATION BOX --------------------------------------------//
            box.setData('card', gameObject); // Place the card in the foundation
            gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
          } else {
            const draggedRank = gameObject.getData('rank');
            const draggedSuit = gameObject.getData('suit');

            // If foundation is empty, only allow Ace to be placed
            if (!currentCard) {
              if (draggedRank === 'A') {
                box.setData('card', gameObject); // Place the Ace in the foundation
                gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
              } else {
                gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY); // Return to original position
              }
            } else {
              // Foundation already has a card, check if the rank is correct and suits match
              const currentRank = currentCard.getData('rank');
              const currentSuit = currentCard.getData('suit');

              // Order of ranks in ascending order for valid placement
              const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
              const nextRankIndex = rankOrder.indexOf(currentRank) + 1;
              const nextRank = rankOrder[nextRankIndex];

              // Validate if the next rank matches and the suit is correct
              if (draggedRank === nextRank && draggedSuit === currentSuit) {
                box.setData('card', gameObject); // Place the card in the foundation
                gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
              } else {
                gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY); // Return to original position
              }
            }
          }
        }
      });

      if (!droppedInFoundation) {
        gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY); // Return to original position
      }

      // If the card came from the stockpile
      if (stockpile.includes(gameObject)) {
        stockpile.pop();
        updateStockpileInteractivity.call(this);
      }
    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return <div id="phaser-container" />;
};

export default PhaserGame;