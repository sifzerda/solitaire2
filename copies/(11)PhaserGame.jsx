// top stockpile card is draggable
// next card button cycles other stockpile cards

// PhaserGame.js
import { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { createFoundationBox } from './components/foundations'; // Import the foundation functions

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
        this.load.image(`${rank}_${suit}`, `/assets/cards/${rank}_${suit}.png`);
      });
    });
  }

  // Card creation logic
  function createCard(scene, x, y, index) {
    const rank = ranks[index % ranks.length]; // Assign rank based on index
    const suit = suits[Math.floor(index / ranks.length)]; // Assign suit based on index

    // Create a container to group card elements
    const cardContainer = scene.add.container(x, y);

    // Add the card background (rectangle)
    const card = scene.add.graphics();
    card.fillStyle(0xffffff, 1); // White fill
    card.lineStyle(1, 0x000000, 1); // Black outline
    card.fillRect(-30, -45, 60, 90); // Card size
    card.strokeRect(-30, -45, 60, 90); // Outline
    cardContainer.add(card); // Add the card background to the container

    // Add image to the card
    const cardImage = scene.add.image(0, 0, `${rank}_${suit}`).setOrigin(0.5);
    cardContainer.add(cardImage); // Add the image to the container

    // Add the rank and suit text to the card
    const label = scene.add.text(0, -25, `${rank} of ${suit}`, {
      fontSize: '14px',
      color: 'black',
      align: 'center',
    }).setOrigin(0.5);
    cardContainer.add(label); // Add the label to the container

    // Set interactive on the container to make the entire card draggable
    cardContainer.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);

    // Store card data
    cardContainer.setData('rank', rank); // Store rank in card data
    cardContainer.setData('suit', suit); // Store suit in card data
    cardContainer.setData('index', index); // Store index for reference

    return cardContainer; // Return the container instead of just the card
  }

  function create() {
    const deck = []; // Deck for tableaux
    const stockpile = []; // Stockpile
    const foundations = []; // Foundations for the game

    const rows = 7;
    const cols = 7;
    const spacingX = 70;
    const spacingY = 40;
    const startX = 80;
    const startY = 300;

    // Stockpile spacing
    const stockpileX = 80;
    const stockpileY = 190;

    // Create stockpile cards
    for (let i = 0; i < 24; i++) {
      const card = createCard(this, stockpileX, stockpileY - i * 5, i);
      stockpile.push(card);
    }

    function updateStockpileInteractivity() {
      stockpile.forEach((card) => {
        card.disableInteractive();
      });

      const topCard = stockpile[stockpile.length - 1];
      if (topCard) {
        topCard.setInteractive();
        this.input.setDraggable(topCard);
      }
    }

    updateStockpileInteractivity.call(this);

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

    /// SPECIAL DEBUG DROP ALL ZONE -------------------------////

      // Create the fifth foundation box
  const fifthFoundationX = foundationX + 400; // Adjust position as needed
  const fifthFoundation = createFoundationBox(this, fifthFoundationX, foundationY, 4);
  fifthFoundation.setData('bounds', new Phaser.Geom.Rectangle(fifthFoundationX, foundationY, 70, 100));
  foundations.push(fifthFoundation);

  // --------------------------------------------------------///

 // Button to cycle stockpile cards
 const cycleButton = this.add.text(500, 800, 'Next Card', {
  fontSize: '18px',
  color: 'black',
  backgroundColor: 'white',
  padding: { x: 10, y: 5 },
  borderRadius: 5,
  align: 'center',
}).setOrigin(0.5).setInteractive();

cycleButton.on('pointerdown', () => {
  const topCard = stockpile.pop(); // Remove the top card
  stockpile.unshift(topCard); // Add the removed card to the bottom

  // Update the card's position
  stockpile.forEach((card, index) => {
    card.setPosition(stockpileX, stockpileY - index * 5);
  });

  updateStockpileInteractivity.call(this);
});

  // --------------------------------------------------------///

    // Drag events
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
            console.log('Card dropped into the fifth foundation.');
            box.setData('card', gameObject); // Place the card in the foundation
            gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
          } else {



          const draggedRank = gameObject.getData('rank');
          const draggedSuit = gameObject.getData('suit');

          // If foundation is empty, only allow Ace to be placed
          if (!currentCard) {
            if (draggedRank === 'A') {
              console.log(`Card dropped into foundation ${index + 1} as Ace.`);
              box.setData('card', gameObject); // Place the Ace in the foundation
              gameObject.setPosition(bounds.centerX, bounds.centerY); // Snap to foundation
            } else {
              console.log(`Card cannot be placed in foundation ${index + 1}. Only Ace allowed.`);
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