import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GameTable } from './GameList';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGameById(id);
    }
  }, [id]);

  const fetchGameById = async (_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/games/${_id}`);
      console.log('Fetched game:', response.data); // Debugging line
      setGame(response.data);
    } catch (error) {
      console.error('Error fetching game details:', error);
      setGame(null);
    }
  };

  return (
    <div>
      <h3>Game Details</h3>
     <br /><button onClick={() => navigate('/')}>Home</button>
      {game ? (
        <GameTable games={[game]} />
      ) : (
        <p>No game details available. Please check the ID and try again.</p>
      )}
    </div>
  );
};

export default GameDetails;