// tableaux free dnd
// stockpile dnd of topcard only
// foundations
// no solitaire dnd rules
// card images and labels
// can only DnD card to foundations boxes
// drops to foundation in correct order

import { useRef, useEffect } from 'react';
import Phaser from 'phaser';

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

  // Preload card images
  function preload() {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

    ranks.forEach(rank => {
      suits.forEach(suit => {
        // Load each card image dynamically
        this.load.image(`${rank}_${suit}`, `/assets/cards/${rank}_${suit}.png`);
      });
    });
  }

  function createCard(scene, x, y, index) {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
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

  // FOUNDATIONS

  // Function to create foundation boxes
  function createFoundationBox(scene, x, y, index) {
    const box = scene.add.graphics({ x, y });
    box.fillStyle(0xeeeeee, 1); // Light gray fill
    box.lineStyle(2, 0xffffff, 1); // Black outline
    //box.fillRect(0, 0, 70, 100); // Box size: 0,0, w, h
    box.strokeRect(0, 0, 70, 100); // Outline

    // Add a label to indicate foundation (optional)
    const label = scene.add.text(x + 35, y + 10, `F${index + 1}`, {
      fontSize: '16px',
      color: 'white',
      align: 'center',
    }).setOrigin(0.5);

    return box;
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