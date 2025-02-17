import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './GameList.css'; // Import the CSS file for styling

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GameTable = ({ games }) => {
  if (!Array.isArray(games)) {
    games = []; // Ensure games is always an array
  }
  return (
    <table className="game-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Game ID</th>
          <th>ID</th>
          <th>Thumbnail URL</th>
          <th>Cheapest Price</th>
          <th>Deals</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game, index) => (
          <tr key={game._id}>
            <td>{index + 1}</td>
            <td>{game.title}</td>
            <td>{game.gameId ? game.gameId : 'N/A'}</td>
            <td>{game._id}</td>
            <td className="wrap-text">
              {game.thumb ? (
                <a href={game.thumb} target="_blank" rel="noopener noreferrer">
                  {game.thumb}
                </a>
              ) : ("N/A")}
            </td>
            <td>
              {game.cheapestPrice !== null && game.cheapestPrice !== undefined && !isNaN(Number(game.cheapestPrice))
                ? `$${Number(game.cheapestPrice).toFixed(2)}`
                : 'N/A'}
            </td>
            <td>
              <table className="deals-table">
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Store ID</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {game.deals.map((deal, dealIndex) => (
                    <tr key={dealIndex}>
                      <td>{dealIndex}</td>
                      <td>{deal.storeID}</td>
                      <td>${deal.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const GameList = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/games`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <h1>Game List</h1>
      <button onClick={() => navigate('/')}>Home</button><br />
      <br />{Array.isArray(games) && games.length > 0 ? (
        <GameTable games={games} />
      ) : (
        <p>Error: No games found. Please fetch or add games to see them here.</p>
      )}
    </div>
  );
};


export default GameList;
export { GameTable };