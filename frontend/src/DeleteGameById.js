import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DeleteGameById = () => {
  const { id } = useParams();
  const [message, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const deleteGameById = async () => {
    if (!id) {
      setErrorMessage('No game ID provided');
      return;
    }

    try {
      const deleteURL = `${API_BASE_URL}/games/${id}`;
      const response = await axios.delete(deleteURL);
      alert(response.data.message); // Show alert on success
      setErrorMessage(null); // Clear any previous error message
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response?.data?.error || "Game not found.");
      } else {
        setErrorMessage('Error deleting game');
      }
    }
  };

  return (
    <div>
      <h2>Delete Game</h2>
      <button onClick={deleteGameById}>Delete Game</button><br />
      {message && <div style={{ color: 'red' }}>Error: {message}</div>}
      <br /><button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded mt-4">
        Home
      </button>
    </div>
  );
};

export default DeleteGameById;