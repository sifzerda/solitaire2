// tableaux free dnd
// stockpile dnd of topcard only
// no foundation
// no solitaire dnd rules

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

  function preload() {
    // You can load images, audio, spritesheets, etc. here
  }

  // Utility function to create a card
  function createCard(scene, x, y, index) {
    const card = scene.add.graphics({ x, y });
    card.fillStyle(0xffffff, 1); // White fill
    card.lineStyle(1, 0x000000, 1); // Black outline
    card.fillRect(-30, -45, 60, 90); // Card size
    card.strokeRect(-30, -45, 60, 90); // Outline

    card.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);
    card.setData('index', index); // Store index for reference

    return card;
  }

  function create() {
    const deck = []; // Deck for tableaux
    const stockpile = []; // Stockpile

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

    // Function to update interactivity for the topmost stockpile card
    function updateStockpileInteractivity() {
      stockpile.forEach((card) => {
        card.disableInteractive(); // Disable interactivity for all cards
      });

      const topCard = stockpile[stockpile.length - 1];
      if (topCard) {
        topCard.setInteractive(); // Enable interactivity for the topmost card
        this.input.setDraggable(topCard); // Make it draggable
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
          this.input.setDraggable(card); // Make tableaux cards draggable
          deck.push(card);
        }
      }
    }

    // Event: Drag start
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setScale(1.1);
      gameObject.setDepth(1);
    });

    // Event: Dragging
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setPosition(dragX, dragY);
    });

    // Event: Drag end
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1);
      gameObject.setDepth(0);

      // Check if the card belongs to the stockpile
      if (stockpile.includes(gameObject)) {
        // Remove the card from the stockpile
        stockpile.pop();
        updateStockpileInteractivity.call(this); // Update the topmost card
      }
    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return <div id="phaser-container" />;
};

export default PhaserGame;