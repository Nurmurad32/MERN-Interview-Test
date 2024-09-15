import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import { Link, useParams } from 'react-router-dom';
import baseURL from '../hooks/baseURL';

const ViewDrawing = () => {
  const [drawing, setDrawing] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchDrawing = async () => {
      try {
        const response = await axios.get(`${baseURL}/drawings/drawings/${params.id}`);
        setDrawing(response.data);
      } catch (error) {
        console.error('Error fetching drawing:', error);
      }
    };
    fetchDrawing();
  }, [params.id]);

  console.log(drawing)
  return (
    <div>
      <div className='font-semibold p-4 text-right bg-slate-200 w-full'>
        <p>
          <Link to={"/drawings"} className='text-blue-500 px-8 py-2 rounded-lg  hover:text-blue-900'>All Drawings</Link>
          <Link to={"/"} className='text-blue-500 px-8 py-2 rounded-lg hover:text-blue-900'>WhiteBoard</Link>
        </p>
      </div>
      {
        !drawing
          ? <div className='text-center'>Loading...</div>
          : <div>
            <div className='w-[600px] mx-auto flex justify-around items-center bg-gray-200 my-8 rounded-lg'>
              <p className='text-center text-4xl font-bold m-0 p-0'>{drawing?.title}</p>
              {/* Edit Button to redirect to Whiteboard with the drawing ID */}
              <p className='text-center font-semibold text-orange-500 underline hover:text-orange-700'><Link to={`/whiteboard/${drawing?._id}`}>Edit Drawing</Link></p>
            </div>

            {/* Display the drawing */}
            <div className='mb-12' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
              <Stage width={450} 
                height={450}
                style={{ border: "2px solid black", backgroundColor: "white" }}
              >
                <Layer>
                  {drawing?.shapes.map((shape, i) => {
                    if (shape.type === 'line') {
                      return <Line key={i} points={shape.points} stroke={shape.color} strokeWidth={2} />;
                    }
                    if (shape.type === 'rect') {
                      return <Rect key={i} x={shape.points[0]} y={shape.points[1]} width={shape.width} height={shape.height} stroke={shape.color} />;
                    }
                    if (shape.type === 'circle') {
                      return <Circle key={i} x={shape.points[0]} y={shape.points[1]} radius={shape.radius} stroke={shape.color} />;
                    }
                    if (shape.type === 'text') {
                      return <Text key={i} x={shape.points[0]} y={shape.points[1]} text={shape.text} fontSize={24} fill={shape.color} />;
                    }
                    return null;
                  })}
                </Layer>
              </Stage>
            </div>
          </div>
      }
    </div>
  );
};

export default ViewDrawing;
