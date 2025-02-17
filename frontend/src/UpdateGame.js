import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UpdateGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState({
    title: "",
    gameID: "",
    thumb: "",
    cheapestPrice: "",
    deals: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGameById(id);
    }
  }, [id]);

  const fetchGameById = async (_id) => {
    try {
      const requestURL = `${API_BASE_URL}/games/${_id}`;
      const response = await axios.get(requestURL);
      setGame(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Game not found");
    }
  };

  const handleChange = (e) => {
    setGame({ ...game, [e.target.name]: e.target.value });
  };

  const handleDealChange = (index, e) => {
    const updatedDeals = [...game.deals];
    updatedDeals[index] = { ...updatedDeals[index], [e.target.name]: e.target.value };
    setGame({ ...game, deals: updatedDeals });
  };

  const addDeal = () => {
    setGame({ ...game, deals: [...game.deals, { storeID: "", price: "" }] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/games/${id}`, game);
      alert("Game updated successfully!");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update game.");
    }
  };

  return (
    <div>
      <h1>Update Game</h1>
      {!game && <button onClick={fetchGameById}>Fetch Game</button>}
      {game && (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title:</label><br />
            <input
              type="text"
              name="title"
              value={game.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Game ID:</label><br />
            <input
              type="text"
              name="gameID"
              value={game.gameID}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Thumbnail URL:</label><br />
            <input
              type="text"
              name="thumb"
              value={game.thumb}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Cheapest Price:</label><br />
            <input
              type="number"
              name="cheapestPrice"
              value={game.cheapestPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <br /><label className="text-lg font-bold mb-2">Deals</label><br />
          {game.deals && game.deals.map((deal, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 mb-2">Store ID: </label>
              <input
                type="text"
                name="storeID"
                value={deal.storeID}
                onChange={(e) => handleDealChange(index, e)}
                className="w-full px-3 py-2 border rounded"
              />
              <label className="block text-gray-700 mb-2">  Price: </label>
              <input
                type="number"
                name="price"
                value={deal.price}
                onChange={(e) => handleDealChange(index, e)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          ))}
          <button type="button" onClick={addDeal} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
            Add Deal
          </button><br />
          <br /><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update Game
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded mt-4">
        Home
      </button>
    </div>
  );
};

export default UpdateGame;