import { useRef, useEffect } from 'react';
import Phaser from 'phaser';
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

  function preload() {
    ranks.forEach(rank => {
      suits.forEach(suit => {
        this.load.image(`${rank}_${suit}`, `src/assets/cards/${rank}_${suit}.png`);
        this.load.image('card_back', 'src/assets/cards/red_joker.png');
      });
    });
  }

  function create() {
    const deck = []; // Deck for tableau
    const stockpile = []; // Stockpile
    const foundations = []; // Foundations for the game
    const revealedCards = []; // Area to hold revealed cards

    const rows = 7;
    const cols = 7;
    const spacingX = 70;
    const spacingY = 40;
    const startX = 80;
    const startY = 300;

    const stockpileX = 80;
    const stockpileY = 190;

    const revealedX = 180;
    const revealedY = 190;

// Deal cards to tableau (7 columns)
const lastCardsInColumn = [];
const allCards = [...deck, ...stockpile]; // Combine deck and stockpile for easy access
let deckIndex = 0;
for (let col = 0; col < 7; col++) {
  for (let row = 0; row <= col; row++) {
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    const isFaceUp = (row === col); // Only the last card in the column is face-up
    const card = createCard(this, x, y, deckIndex, 60, 90, 0x000000, isFaceUp);

    // If the card is face-up, make it draggable
    if (isFaceUp) {
      this.input.setDraggable(card);
    }
    deck.push(card);
    if (isFaceUp) {
      lastCardsInColumn[col] = card;
    }
    deckIndex++;
  }
}

  // Log the state of the last cards in the tableau columns before any updates
  console.log("Before Update - Last Cards in Columns:");
  lastCardsInColumn.forEach((card, index) => {
    if (card) {
      console.log(`top card of Column ${index + 1}: ${card.getData('rank')} of ${card.getData('suit')}`);
    } else {
      console.log(`top card of Column ${index + 1}: Empty`);
    }
  });


    // Drag-and-drop events
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

      // If card is not dropped on foundation, check for tableau
        let droppedInTableau = false;
        for (let col = 0; col < 7; col++) {
          const columnCards = deck.filter(card => card.x === startX + col * spacingX);
          const lastCard = columnCards[columnCards.length - 1];

          if (lastCard && Phaser.Geom.Rectangle.Overlaps(lastCard.getBounds(), gameObject.getBounds())) {
            const draggedRank = gameObject.getData('rank');
            const draggedSuit = gameObject.getData('suit');
            const lastCardRank = lastCard.getData('rank');
            const lastCardSuit = lastCard.getData('suit');

            const isDescendingOrder = (['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].indexOf(draggedRank) === 
                                      ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].indexOf(lastCardRank) - 1);

            const isAlternateColor = (draggedSuit === 'hearts' || draggedSuit === 'diamonds') !== (lastCardSuit === 'hearts' || lastCardSuit === 'diamonds');

            if (isDescendingOrder && isAlternateColor) {
              lastCard.setData('card', gameObject);
              gameObject.setPosition(lastCard.x, lastCard.y + spacingY);
              droppedInTableau = true;
    
              // Log the card movement
              console.log(`Moved card ${gameObject.getData('rank')} of ${gameObject.getData('suit')} to column ${col + 1}`);    
    
              // Update the last card in the source and destination columns
                // Update source column's last card (previous top card)
                const sourceColumnIndex = gameObject.getData('column');
                const sourceColumnCards = deck.filter(card => card.x === startX + sourceColumnIndex * spacingX);
                const newTopCard = sourceColumnCards[sourceColumnCards.length - 2]; // Get the new top card after the move
                lastCardsInColumn[sourceColumnIndex] = newTopCard || null; // If no card left, set null
    
                // Update destination column's last card (new top card)
                lastCardsInColumn[col] = gameObject;
                gameObject.setData('column', col);  // Update the column data for the dragged card

              break;
            }
          }
        }

        if (!droppedInTableau) {
          gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
        }
      

       // Log the state of the last cards in the tableau columns after the update
  console.log("After Update - Last Cards in Columns:");
  lastCardsInColumn.forEach((card, index) => {
    if (card) {
      console.log(`Column ${index + 1}: ${card.getData('rank')} of ${card.getData('suit')}`);
    } else {
      console.log(`Column ${index + 1}: Empty`);
    }
  });

    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return <div id="phaser-container" />;
};

export default PhaserGame;
