// CardCreator.js

export function createCard(scene, x, y, index) {
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

  // Add the card image
  const cardImage = scene.add.image(0, 0, `${rank}_${suit}`).setOrigin(0.5);
  cardImage.setDisplaySize(60, 90); // Set a fixed width and height for the card
  cardContainer.add(cardImage);    

  // Optionally add the card back (for face-down cards)
  const cardBack = scene.add.image(0, 0, 'card_back').setOrigin(0.5).setAlpha(0); // Initially hidden
  cardBack.setDisplaySize(60, 90); // Same size as the card front
  cardContainer.add(cardBack); 

  // Set interactive on the container to make the entire card draggable
  cardContainer.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);

  // Store card data (rank, suit, and index for reference)
  cardContainer.setData('rank', rank); 
  cardContainer.setData('suit', suit);
  cardContainer.setData('index', index);
  cardContainer.setData('cardBack', cardBack); // Store reference to card back for flipping

  // Optional: Method to flip the card (face-up / face-down)
  cardContainer.flipCard = function() {
      const isFaceUp = cardImage.alpha === 1;
      cardImage.setAlpha(isFaceUp ? 0 : 1); // Toggle visibility
      cardBack.setAlpha(isFaceUp ? 1 : 0); // Toggle visibility
  };

  return cardContainer; // Return the container instead of just the card
}
  