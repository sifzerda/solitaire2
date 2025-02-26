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

// Function to cycle stockpile cards
function cycleStockpile(scene) {
  if (stockpile.length > 0) {
    const topCard = stockpile.pop(); // Remove the top card

    // Move the top card to the revealed area
    topCard.setPosition(revealedX, revealedY); // Position it to the right
    topCard.setInteractive(); // Make it draggable
    scene.input.setDraggable(topCard); // Enable dragging
    revealedCards.push(topCard); // Add to revealed cards array

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
    
    // Create tableaux layout
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (col >= row) {
          const x = startX + col * spacingX;
          const y = startY + row * spacingY;
          const card = createCard(this, x, y, row * cols + col);
          this.input.setDraggable(card);
          deck.push(card);
        }
      }
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

    // 
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
                console.log(`Card dropped into foundation ${index + 1} in correct order.`);
                box.setData('card', gameObject); // Place the card in the foundation
                gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
              } else {
                console.log(`Card cannot be placed in foundation ${index + 1}. Incorrect rank or suit.`);
                gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY); // Return to original position
              }
            }
          }
        }
      });

      if (!droppedInFoundation) {
        console.log('Card not dropped in a foundation');
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