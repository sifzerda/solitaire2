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
    this.load.image('card_back', 'src/assets/cards/red_joker.png');
    ranks.forEach(rank => {
      suits.forEach(suit => {
        this.load.image(`${rank}_${suit}`, `src/assets/cards/${rank}_${suit}.png`);
      });
    });
  }

  function create() {
    const tableau = []; // Deck for tableau
    const stockpile = []; // Stockpile
    const foundations = []; // Foundations for the game
    const revealedCards = []; // Area to hold revealed cards

    const columns = [[], [], [], [], [], [], []];

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
    const allCards = [...tableau, ...stockpile]; // Combine tableau and stockpile for easy access
    let tableauIndex = 0;

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const isFaceUp = (row === col); // Only the last card in the column is face-up
        const card = createCard(this, x, y, tableauIndex, 60, 90, 0x000000, isFaceUp);

        card.setData('column', col); // Store the column index

        // If the card is face-up, make it draggable
        if (isFaceUp) {
          this.input.setDraggable(card);
        }
        tableau.push(card);
        if (isFaceUp) {
          lastCardsInColumn[col] = card;
        }
        tableauIndex++;
        // Push the card into its respective column
        columns[col].push(card);  // This is the fix
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
      this.children.bringToTop(gameObject); // Ensure dragged card is on top
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setPosition(dragX, dragY);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1);
      this.children.bringToTop(gameObject); // Ensure dragged card gets a new depth value after drop


      let droppedInFoundation = false;
      foundations.forEach((box, index) => {

        const bounds = box.getData('bounds');
        const currentCard = box.getData('card');

        if (Phaser.Geom.Rectangle.Overlaps(bounds, gameObject.getBounds())) {
          droppedInFoundation = true;

          // /////////////////////////////////////

          // Remove card from tableau column
          const prevColumn = gameObject.getData('column');
          if (prevColumn !== undefined) {
            const columnCards = tableau.filter(card => card.getData('column') === prevColumn);
            const cardIndex = columnCards.indexOf(gameObject);
            if (cardIndex > -1) {
              tableau.splice(tableau.indexOf(gameObject), 1);
              const newTopCard = columnCards[cardIndex - 1];
              lastCardsInColumn[prevColumn] = newTopCard || null;
              // AUTO-FLIP NEXT CARD
              // If there's a face-down card below, make it clickable to flip
              if (newTopCard && !newTopCard.getData('isFaceUp')) {
                newTopCard.setInteractive();
                newTopCard.on('pointerdown', function handleFlip() {
                  newTopCard.flipCard();
                  scene.input.setDraggable(newTopCard); // Make it draggable after flipping
                  newTopCard.off('pointerdown', handleFlip); // Remove the listener
                });
              }
              //////////////////////
            }
            gameObject.setData('column', null); // Not in tableau anymore
          }

          // Remove from revealed pile
          const revealedIndex = revealedCards.indexOf(gameObject);
          if (revealedIndex > -1) {
            revealedCards.splice(revealedIndex, 1);
          }

          // Remove from stockpile
          if (gameObject.getData('source') === 'stockpile') {
            const stockIndex = stockpile.indexOf(gameObject);
            if (stockIndex > -1) {
              stockpile.splice(stockIndex, 1);
            }
          }
          //////////////////////////////////

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
          const columnCards = tableau.filter(card => card.getData('column') === col);
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

              // Update the last card in the source and destination columns
              // Update source column's last card (previous top card)
              const sourceColumnIndex = gameObject.getData('column');
              const sourceColumnCards = columns[sourceColumnIndex];
              const movedCardIndex = sourceColumnCards.indexOf(gameObject);
              // Remove the card from its source column
              if (movedCardIndex > -1) {
                sourceColumnCards.splice(movedCardIndex, 1);
              }
              // New top card
              const newTopCard = sourceColumnCards.at(-1); // <- easier and safer than -2 logic
              lastCardsInColumn[sourceColumnIndex] = newTopCard || null;

              // Update destination column's last card (new top card)
              lastCardsInColumn[col] = gameObject;
              gameObject.setData('column', col);  // Update the column data for the dragged card
              lastCardsInColumn[col] = gameObject; // Update the last card in the destination column
              break;
            }
          }
        }

        if (!droppedInTableau) {
          gameObject.setPosition(gameObject.input.dragStartX, gameObject.input.dragStartY);
        }
      }




      // Log the state of the last cards in the tableau columns after the update
      console.log("After Update - Last Cards in Columns:");
      lastCardsInColumn.forEach((card, index) => {
        if (card) {
          const faceStatus = card.isFaceUp ? "Face Up" : "Face Down";
          console.log(`Top card of Column ${index + 1}: ${card.getData('rank')} of ${card.getData('suit')} - ${faceStatus}`);
        } else {
          console.log(`Column ${index + 1}: Empty`);
        }
      });





      // Recycle stockpile if a card is dragged from there
      if (stockpile.length === 0 && revealedCards.length > 0) {
        while (revealedCards.length) {
          const card = revealedCards.pop();
          card.setTexture('card_back');
          card.setPosition(stockpileX, stockpileY - stockpile.length * 5);
          card.setData('source', 'stockpile');
          card.disableInteractive();
          stockpile.push(card);
        }
        updateStockpileInteractivity(this);
      }
    });
  }

  function update() {
    // Game loop (not used here but can be expanded for interactions)
  }

  return <div id="phaser-container" />;
};

export default PhaserGame;
