// CardUtils.js
import Phaser from 'phaser';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

// Preload card images
export function preload(scene) {
  ranks.forEach(rank => {
    suits.forEach(suit => {
      scene.load.image(`${rank}_${suit}`, `/assets/cards/${rank}_${suit}.png`);
    });
  });
}

// Card creation logic
export function createCard(scene, x, y, index) {
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