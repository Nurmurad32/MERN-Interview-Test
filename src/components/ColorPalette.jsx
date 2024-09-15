import React, { useState } from 'react';

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF',  '#FFA500', 
  '#800000', '#808000'
];

const ColorPalette = ({ onColorSelect }) => {
  const [selectedColor, setSelectedColor] = useState(null);

  const handleColorClick = (color) => {
    setSelectedColor(color);
    onColorSelect(color); // Pass the selected color to parent component
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', width: '150px' }}>
      {colors.map(color => (
        <div
          key={color}
          onClick={() => handleColorClick(color)}
          style={{
            width: '20px',
            height: '20px',
            margin: '5px',
            backgroundColor: color,
            border: color === selectedColor ? '2px solid black' : 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
