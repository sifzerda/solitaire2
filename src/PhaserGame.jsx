import { useRef, useEffect } from 'react';
import Phaser from 'phaser';

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: 1200,
      height: 1000,
      backgroundColor: '#87CEEB', // Light blue background for 2D game
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
    // No need to load an image, we'll use a Phaser Graphics object for the card
  }

  function create() {
    // Create a deck of cards
    const deck = [];
    const rows = 7; // Increase number of rows for a more solitaire-like layout
    const cols = 7; // Keep the number of columns consistent for symmetry
    const spacingX = 140; // Horizontal spacing
    const spacingY = 180; // Vertical spacing
    const startX = 100; // Starting X position
    const startY = 150; // Starting Y position
  
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
    <div
      id="phaser-container"
      style={{
        width: '1200px',
        height: '1000px',
        margin: '0 auto',
        border: '2px solid black',
      }}
    />
  );
};

export default PhaserGame;