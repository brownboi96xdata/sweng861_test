import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DeleteGame = () => {
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const deleteGame = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/games`);
      alert(response.data.message); // Show alert on success
      setMessage(null); // Clear message on success
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response?.data?.error || "No games to delete.");
      } else {
        setMessage('Error deleting games');
      }
    }
  };

  return (
    <div>
      <h2>Delete Game</h2>
      <button onClick={deleteGame}>Delete All Games</button><br />
      {message && <div style={{ color: 'red' }}> {message}</div>}
      <br /><button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded mt-4">
        Home
      </button>
    </div>
  );
};

export default DeleteGame;