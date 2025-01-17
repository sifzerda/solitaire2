// tableau cards, 
// no dnd rules
// no stockpile
// no foundation


import { useRef, useEffect } from 'react';
import Phaser from 'phaser';

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: 800,
      height: 700,
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
    const rows = 7; // number of rows
    const cols = 7; // number of columns
    const spacingX = 70; // Horizontal spacing
    const spacingY = 40; // Vertical spacing
    const startX = 300; // Starting X position
    const startY = 300; // Starting Y position
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (col >= row) { // Ensure only to show the correct number of cards in each row
          const x = startX + col * spacingX;
          const y = startY + row * spacingY;
    
          // Create a white card using Phaser.Graphics
          const card = this.add.graphics({ x, y });
    
          // Set outline color and width
          card.lineStyle(1, 0x000000, 1); // Black outline with width of 4
    
          // Draw rectangle (card) with the outline
          card.fillStyle(0xffffff, 1); // White color for the fill
          card.fillRect(-30, -45, 60, 90); // Card dimensions halved (width: 60, height: 90)
          
          // Add outline around the card
          card.strokeRect(-30, -45, 60, 90); // Stroke the same rectangle to add an outline
    
          card.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains); // Set interactivity
    
          card.setData('index', row * cols + col); // Store card index for reference
    
          // Enable dragging
          this.input.setDraggable(card);
          deck.push(card);
        }
      }
    }

    // Event: Drag start
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setScale(1.1); // Scale up for effect
      gameObject.setDepth(1); // Bring to front
    });

    // Event: Dragging
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setPosition(dragX, dragY); // Update position
    });

    // Event: Drag end
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1); // Reset scale
      gameObject.setDepth(0); // Reset depth
    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return (
    <div id="phaser-container"/>
  );
};

export default PhaserGame;