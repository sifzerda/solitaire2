// foundations.js
// creates and labels foundations boxes

export function createFoundationBox(scene, x, y, index) {
    const box = scene.add.graphics({ x, y });
    box.fillStyle(0xeeeeee, 1); // Light gray fill
    box.lineStyle(2, 0xffffff, 1); // Black outline
    box.strokeRect(0, 0, 70, 100); // Outline
  
    // Add a label to indicate foundation
    const label = scene.add.text(x + 35, y + 10, `F${index + 1}`, {
      fontSize: '16px',
      color: 'white',
      align: 'center',
    }).setOrigin(0.5);
  
    return box;
  }