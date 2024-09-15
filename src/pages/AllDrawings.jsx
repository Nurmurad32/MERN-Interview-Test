import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import baseURL from '../hooks/baseURL';

const AllDrawings = () => {
  const [drawings, setDrawings] = useState([]);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        const response = await axios.get(`${baseURL}/drawings/all-drawing`);
        setDrawings(response.data);
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    };
    fetchDrawings();
  }, [drawings]);

  const handleDelete = async (id) => {
    console.log(id)
    try {
      await axios.delete(`${baseURL}/drawings/drawings/${id}`)
        .then((res) => {
          console.log("After Response: ", res);
          const restDrawings = drawings.filter(drawing => drawing.id !== id);
          setDrawings(restDrawings);
          alert('Deleted!');
        })
      
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  }

  if (!drawings) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='font-semibold p-2 text-right w-full'>
        <p>
          <Link to={"/"} className='bg-blue-500 px-8 py-2 rounded-lg text-white hover:bg-blue-900'>Back to WhiteBoard</Link>
        </p>
      </div>
      {
        drawings.length == 0
          ? <div className='text-center'>Loading...</div>
          : <div className='flex flex-col justify-center items-center my-8'>
            <table className="table-auto">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Drawing Title</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {drawings.map((drawing, index) => (
                  <tr key={index}>
                    <td>{index + 1}.</td>
                    <td>{drawing.title}</td>
                    <td><Link to={`/drawings/${drawing._id}`} className='hover:text-blue-500'>View</Link></td>
                    <td><Link onClick={() => handleDelete(drawing._id)} style={{ marginLeft: "100px" }} className='hover:text-red-500'>Delete</Link></td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
      }
    </div>
  );
};

export default AllDrawings;