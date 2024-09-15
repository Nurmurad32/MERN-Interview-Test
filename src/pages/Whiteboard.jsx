import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Link, useParams } from 'react-router-dom';
import ColorPalette from '../components/ColorPalette';
import baseURL from '../hooks/baseURL';

const Whiteboard = () => {
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState('line'); // 'line', 'rect', 'circle', 'text'
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [drawingId, setDrawingId] = useState(null); // Drawing ID for editing
  const [title, setTitle] = useState(''); // Title of the drawing
  const [selectedId, setSelectedId] = useState(null);
  const [textValue, setTextValue] = useState('');
  const stageRef = useRef(null);
  const { id } = useParams();  // Get the drawing ID from the URL
  const [selectedColor, setSelectedColor] = useState('black');

  // Fetch the drawing if we are editing
  useEffect(() => {
    if (id) {
      // Fetch existing drawing for editing
      const fetchDrawing = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/drawings/drawings/${id}`);
          const { title, shapes } = response.data;

          // Ensure each shape has a unique ID and proper properties
          const loadedShapes = shapes.map((shape) => {
            return {
              ...shape,
              id: shape.id || uuidv4(), // Ensure each shape has a unique ID
              // draggable: tool === 'move', // Set draggable based on tool
            };
          });

          setTitle(title);
          setShapes(loadedShapes); // Load existing shapes with updated properties
          setDrawingId(id); // Set drawing ID for editing
        } catch (error) {
          console.error('Error loading drawing:', error);
        }
      };
      fetchDrawing();
    }
  }, [id]); // Reload when tool changes
  console.log(shapes)

  // Handle mouse down to start drawing
  const handleMouseDown = (e) => {
    if (tool === 'move') return;  // Skip drawing when in move mode

    if (tool === 'delete') {
      const clickedOnShape = e.target;
      const id = clickedOnShape.id();
      // Remove the shape with the clicked id
      setShapes(shapes.filter((shape) => shape.id !== id));
      return;
    }

    const pos = stageRef.current.getPointerPosition();  // Get the mouse position
    setIsDrawing(true);  // Start the drawing state

    if (tool === 'line') {
      const newLine = { id: uuidv4(), type: 'line', points: [pos.x, pos.y], color: selectedColor };
      setShapes([...shapes, newLine]);  // Append the new line to the existing shapes
      setNewShape(newLine);  // Set the newly drawn shape
    }
    if (tool === 'rect') {
      const newRect = { id: uuidv4(), type: 'rect', points: [pos.x, pos.y], width: 0, height: 0, color: selectedColor };
      setShapes([...shapes, newRect]);  // Append the new rectangle to the existing shapes
      setNewShape(newRect);  // Set the newly drawn shape
    }
    if (tool === 'circle') {
      const newCircle = { id: uuidv4(), type: 'circle', points: [pos.x, pos.y], radius: 0, color: selectedColor };
      setShapes([...shapes, newCircle]);  // Append the new circle to the existing shapes
      setNewShape(newCircle);  // Set the newly drawn shape
    }

    if (tool === 'text') {
      // Prompt user for dynamic text input
      const inputText = prompt('Enter your text:');
      const newText = { id: uuidv4(), type: 'text', points: [pos.x, pos.y], text: inputText || 'Default Text', color: selectedColor };
      setShapes([...shapes, newText]);  // Append the new text to the existing shapes
      setNewShape(newText);  // Set the newly drawn text
    }
  };

  // Handle mouse move to update the shape being drawn
  const handleMouseMove = () => {
    if (!isDrawing || tool === 'move') return;
    const pos = stageRef.current.getPointerPosition();

    const updatedShapes = shapes.map((shape) => {
      if (shape === newShape) {
        if (tool === 'line') {
          const updatedLine = { ...shape, points: [...shape.points, pos.x, pos.y] };
          setNewShape(updatedLine);
          return updatedLine;
        }

        if (tool === 'rect') {
          const updatedRect = {
            ...shape,
            width: pos.x - shape.points[0],
            height: pos.y - shape.points[1],
          };
          setNewShape(updatedRect);
          return updatedRect;
        }
        if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(pos.x - shape.points[0], 2) + Math.pow(pos.y - shape.points[1], 2));
          const updatedCircle = { ...shape, radius };
          setNewShape(updatedCircle);
          return updatedCircle;
        }
        if (tool === 'text') {
          // Text doesn't need updating as it's static
          return shape;
        }
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  // Handle mouse up to finish drawing
  const handleMouseUp = () => {
    setIsDrawing(false);
    setNewShape(null);
  };


  // Function to handle dragging (moving) shapes
  const handleDragMove = (e, id) => {
    if (tool !== 'move') return;

    const { x, y } = e.target.position();  // Get the new position of the dragged element

    const updatedShapes = shapes.map((shape) => {
      if (shape.id === id) {
        if (shape.type === 'line') {
          const dx = x - shape.points[0];
          const dy = y - shape.points[1];
          const updatedPoints = shape.points.map((point, index) => (index % 2 === 0 ? point + dx : point + dy));
          return { ...shape, points: updatedPoints };
        }
        return { ...shape, points: [x, y] };  // For other shapes (rect, circle, text)
      }
      return shape;
    });

    setShapes(updatedShapes);  // Update the shapes array with the new position
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };


  // Save drawing to backend
  const handleSaveDrawing = async () => {
    const promptTitle = prompt('Enter title for the drawing:', title);
    const updatedTitle = promptTitle || title;
    const drawingData = shapes;
    console.log("Before Submit-", drawingData);
    try {
      if (id) {
        // Update drawing if we have an ID
        await axios.put(`${baseURL}/drawings/drawings/${id}`, { title: updatedTitle, shapes: drawingData })
          .then(res => console.log("After Updated -", res))
        alert('Drawing updated!');
      } else {
        // Create new drawing if no ID
        await axios.post(`${baseURL}/drawings/create`, { title: updatedTitle, shapes: drawingData })
          .then(res => console.log("After Created -", res))
        alert('Drawing saved!');
      }
    } catch (error) {
      console.error('Error saving or updating drawing:', error);
    }
  };

  // Reset whiteboard by clearing shapes
  const handleReset = () => {
    setShapes([]); // Clear all shapes
  };

  return (
    <div className='grid grid-cols-5 gap-4 '>
      <div>
        {/* Color Palette */}
        <p className='font-semibold py-2 text-center bg-slate-200'>Shapes</p>
        <hr />
        <div className='grid grid-cols-2 gap-2 my-4'>
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "line" ? "underline" : "none" }} onClick={() => setTool('line')}>Line</button>
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "rect" ? "underline" : "none" }} onClick={() => setTool('rect')}>Rectangle</button>
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "circle" ? "underline" : "none" }} onClick={() => setTool('circle')}>Circle</button>
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "text" ? "underline" : "none" }} onClick={() => setTool('text')}>Text</button>
        </div>
        <hr />
        <p className='font-semibold py-2 text-center bg-slate-200'>Tools</p>
        <hr />
        <div className='flex flex-col my-4'>
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "move" ? "underline" : "none" }} onClick={() => setTool('move')}>Move Element</button> {/* Move button */}
          <button className='text-blue-500 hover:text-blue-900' style={{ textDecoration: tool === "delete" ? "underline" : "none" }} onClick={() => setTool('delete')}>Delete Element</button> {/* Delete button */}
        </div>
        <hr />
        <p className='font-semibold py-2 text-center bg-slate-200'>Colors</p>
        <hr />
        <div className='flex justify-center my-4'>
          <ColorPalette onColorSelect={handleColorChange} />
        </div>
        <hr />
        <hr />
        <p className='font-semibold py-2 text-center bg-slate-200'>Files</p>
        <hr />
        <div className='flex flex-col my-4'>
          <button onClick={handleReset}>Reset</button> {/* Reset button */}
          <button onClick={handleSaveDrawing} className='mt-4 text-blue-500 hover:text-blue-900'>Save Drawing</button>
        </div>
      </div>
      <div className='col-span-4'>
        <div className='font-semibold p-2 text-right w-full'>
          <p>
            <Link to={"/drawings"} className='bg-blue-500 px-8 py-2 rounded-lg text-white hover:bg-blue-900'>View All Drawing</Link>
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
          <Stage
            width={450} // Fixed width
            height={450} // Fixed height
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: "2px solid black", backgroundColor:"white" }} // Added border for visual size indication
          >
            <Layer>
              {shapes.map((shape, i) => {
                if (shape.type === 'line') {
                  return (
                    <Line
                      key={i}
                      id={shape.id}
                      points={shape.points}
                      stroke={shape.color}
                      strokeWidth={2}
                      draggable={tool === 'move'} // Make draggable only when 'Move' tool is selected
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                    />
                  );
                }
                if (shape.type === 'rect') {
                  return (
                    <Rect
                      key={i}
                      id={shape.id}
                      x={shape.points[0]}
                      y={shape.points[1]}
                      width={shape.width}
                      height={shape.height}
                      stroke={shape.color}
                      draggable={tool === 'move'} // Make draggable only when 'Move' tool is selected
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                    />
                  );
                }
                if (shape.type === 'circle') {
                  return (
                    <Circle
                      key={i}
                      id={shape.id}
                      x={shape.points[0]}
                      y={shape.points[1]}
                      radius={shape.radius}
                      stroke={shape.color}
                      draggable={tool === 'move'} // Make draggable only when 'Move' tool is selected
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                    />
                  );
                }
                if (shape.type === 'text') {
                  return (
                    <Text
                      key={i}
                      id={shape.id}
                      x={shape.points[0]}
                      y={shape.points[1]}
                      text={shape.text}
                      fontSize={24}
                      fill={shape.color}
                      draggable={tool === 'move'} // Make draggable only when 'Move' tool is selected
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
