export function createCard(scene, x, y, cardData, cardWidth = 60, cardHeight = 90, outlineColor = 0x000000, isFaceUp = false) {
  const { rank, suit } = cardData; // Destructure rank and suit from cardData
  // Create a container to group card elements
  const cardContainer = scene.add.container(x, y);

  // Add card background (rectangle)
  const card = scene.add.graphics();
  card.fillStyle(0xffffff, 1); // White fill
  card.lineStyle(1, outlineColor, 1); // Use outlineColor (default black if not passed)
  card.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight); // Rectangle for the card background
  card.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight); // Card border
  cardContainer.add(card);

  // Add the card image (face-up)
  const cardImage = scene.add.image(0, 0, `${rank}_${suit}`).setOrigin(0.5);
  cardImage.setDisplaySize(cardWidth, cardHeight); // Set the size of the card image
  cardContainer.add(cardImage);

  // Add card back (hidden initially)
  const cardBack = scene.add.image(0, 0, 'card_back').setOrigin(0.5).setAlpha(1); // Face-down by default
  cardBack.setDisplaySize(cardWidth, cardHeight); // Same size as the front of the card
  cardContainer.add(cardBack);

  // Set the card as face-up or face-down based on the parameter
  if (isFaceUp) {
    cardImage.setAlpha(1); // Show the front of the card
    cardBack.setAlpha(0);  // Hide the back of the card
  } else {
    cardImage.setAlpha(0);  // Hide the front of the card
    cardBack.setAlpha(1);   // Show the back of the card
  }

  // Make the container interactive (draggable)
  cardContainer.setInteractive(new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
  
  // Store card data (rank, suit, index, and whether it is face-up)
  cardContainer.setData('rank', rank);
  cardContainer.setData('suit', suit);
  cardContainer.setData('cardBack', cardBack);
  cardContainer.setData('isFaceUp', isFaceUp); // Track the face-up/down state

  // Flip the card (animation)
  cardContainer.flipCard = function() {
    if (!cardContainer.getData('isFaceUp')) {
      cardImage.setAlpha(1);     // Show the face
      cardBack.setAlpha(0);      // Hide the back
      cardContainer.setData('isFaceUp', true);
    }
  };

// Add hover effect for face-up cards
cardContainer.on('pointerover', () => {
  if (cardContainer.getData('isFaceUp')) {
    cardContainer.setScale(1.05); // Slightly enlarge on hover
  }
});

cardContainer.on('pointerout', () => {
  // Always reset scale when pointer leaves, even if it wasn’t face-up
  cardContainer.setScale(1);
});

//////////////////

  // Log message when a face-down card is clicked
  cardContainer.on('pointerdown', () => {
    if (!cardContainer.getData('isFaceUp')) {
      console.log(`Clicked on a face-down card: ${rank} of ${suit}`);
      cardContainer.flipCard(); // Flip the card when clicked
    }
  });

///////////////////

  return cardContainer; // Return the container instead of just the card
}
