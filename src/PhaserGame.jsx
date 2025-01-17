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

  //TABLEAUX

  function create() {
    // Create a deck of cards and tableaux layout
    const deck = []; // start with an empty deck; fill with cards per below 
    //initialize STOCKPILE
    const stockpile = [];
    const rows = 7; // number of rows
    const cols = 7; // number of columns
    const spacingX = 70; // Horizontal spacing
    const spacingY = 40; // Vertical spacing
    const startX = 80; // Starting X position
    const startY = 300; // Starting Y position
  
    // Stockpile spacing
    const stockpileX = 80; // X position for the stockpile
    const stockpileY = 190; // Y position for the stockpile

    for (let i = 0; i < 24; i++) {
      // Create 24 cards for the stockpile
      const card = this.add.graphics({ x: stockpileX, y: stockpileY - i * 5 }); // Offset each card slightly
      card.fillStyle(0xffffff, 1); // White fill
      card.lineStyle(1, 0x000000, 1); // Black outline
      card.fillRect(-30, -45, 60, 90); // Card size
      card.strokeRect(-30, -45, 60, 90); // Outline

      card.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);
      card.setData('index', i); // Store index for reference

      stockpile.push(card);
    }

    // Tableaux layout
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (col >= row) {
          const x = startX + col * spacingX;
          const y = startY + row * spacingY;

          const card = this.add.graphics({ x, y });
          card.fillStyle(0xffffff, 1);
          card.lineStyle(1, 0x000000, 1);
          card.fillRect(-30, -45, 60, 90);
          card.strokeRect(-30, -45, 60, 90);

          card.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);
          card.setData('index', row * cols + col);

          this.input.setDraggable(card);
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

      // Example: Snap back to stockpile if dropped near stockpile
      const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, stockpileX, stockpileY);
      if (distance < 50) {
        gameObject.setPosition(stockpileX, stockpileY);
      }
    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return <div id="phaser-container" />;
};

export default PhaserGame;