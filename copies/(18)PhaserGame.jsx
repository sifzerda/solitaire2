// has dragging from stockpile and tableaux, and dropping on foundations and tableaux.

import { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { createFoundationBox } from './foundations'; // Import foundation functions
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

    // Stockpile initialization
    for (let i = 0; i < 24; i++) {
      const card = createCard(this, stockpileX, stockpileY - i * 5, i);
      stockpile.push(card);
      card.setData('source', 'stockpile'); // Mark the source as stockpile
    }

    function updateStockpileInteractivity(scene) {
      stockpile.forEach(card => card.disableInteractive());

      const topCard = stockpile[stockpile.length - 1];
      if (topCard) {
        topCard.setInteractive();
        topCard.on('pointerdown', () => {
          cycleStockpile(scene); // Pass scene to cycle stockpile
        });
      }
    }

    function cycleStockpile(scene) {
      if (stockpile.length > 0) {
        const topCard = stockpile.pop();
        topCard.setPosition(revealedX, revealedY);
        topCard.setInteractive();
        scene.input.setDraggable(topCard);
        revealedCards.push(topCard);
        topCard.flipCard();
        topCard.off('pointerdown');
        stockpile.forEach((card, index) => {
          card.setPosition(stockpileX, stockpileY - index * 5);
        });
        updateStockpileInteractivity(scene);
      }
    }

    updateStockpileInteractivity(this);

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
        this.input.setDraggable(card);
        deck.push(card);
        if (isFaceUp) {
          lastCardsInColumn[col] = card;
        }
        deckIndex++;
      }
    }

    // Create foundation boxes
    const foundationX = 150;
    const foundationY = 90;
    for (let i = 0; i < 4; i++) {
      const box = createFoundationBox(this, foundationX + i * 100, foundationY, i);
      box.setData('bounds', new Phaser.Geom.Rectangle(foundationX + i * 100, foundationY, 70, 100));
      foundations.push(box);
    }

    // Special fifth foundation
    const fifthFoundationX = foundationX + 400;
    const fifthFoundation = createFoundationBox(this, fifthFoundationX, foundationY, 4);
    fifthFoundation.setData('bounds', new Phaser.Geom.Rectangle(fifthFoundationX, foundationY, 70, 100));
    foundations.push(fifthFoundation);

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

      let droppedInFoundation = false;
      foundations.forEach((box, index) => {
        const bounds = box.getData('bounds');
        const currentCard = box.getData('card');

        if (Phaser.Geom.Rectangle.Overlaps(bounds, gameObject.getBounds())) {
          droppedInFoundation = true;

          if (index === 4) {
            box.setData('card', gameObject);
            gameObject.setPosition(bounds.centerX, bounds.centerY);
          } else {
            const draggedRank = gameObject.getData('rank');
            const draggedSuit = gameObject.getData('suit');

            if (!currentCard) {
              if (draggedRank === 'A') {
                box.setData('card', gameObject);
                gameObject.setPosition(bounds.centerX, bounds.centerY);
              } else {
                gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
              }
            } else {
              const currentRank = currentCard.getData('rank');
              const currentSuit = currentCard.getData('suit');

              const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
              const nextRankIndex = rankOrder.indexOf(currentRank) + 1;
              const nextRank = rankOrder[nextRankIndex];

              if (draggedRank === nextRank && draggedSuit === currentSuit) {
                box.setData('card', gameObject);
                gameObject.setPosition(bounds.centerX, bounds.centerY);
              } else {
                gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
              }
            }
          }
        }
      });

      // If card is not dropped on foundation, check for tableau
      if (!droppedInFoundation) {
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
              break;
            }
          }
        }

        if (!droppedInTableau) {
          gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
        }
      }

      // Recycle stockpile if a card is dragged from there
      if (gameObject.getData('source') === 'stockpile') {
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
