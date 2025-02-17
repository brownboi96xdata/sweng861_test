import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddGames = () => {
  const [formData, setFormData] = useState({
    title: '',
    gameID: '',
    thumb: '',
    cheapestPrice: '',
    deals: [{ storeID: '', price: '' }]
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDealChange = (index, e) => {
    const newDeals = formData.deals.map((deal, i) => (
      i === index ? { ...deal, [e.target.name]: e.target.value } : deal
    ));
    setFormData({ ...formData, deals: newDeals });
  };

  const addDeal = () => {
    setFormData({
      ...formData,
      deals: [...formData.deals, { storeID: '', price: '' }]
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({}); // Reset previous errors

  try {
    const response = await axios.post(`${API_BASE_URL}/games`, formData);
    
    if (response.data.error) {
      setErrors(response.data.errors || { form: response.data.message });
    } else {
      alert('Game added successfully!');
      setFormData({
        title: '',
        gameID: '',
        thumb: '',
        cheapestPrice: '',
        deals: [{ storeID: '', price: '' }]
      });
    }
  } catch (error) {
    if (error.response) {
      setErrors(error.response.data.errors || { form: error.response.data.message || 'An error occurred.' });
    } else {
      setErrors({ form: 'Failed to connect to the server.' });
    }
  }
};
  
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Add a New Game</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title:</label><br />
          <input
            type="text"
            name="title"
            style={{width: '400px'}}
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.title && <div className="text-red-500">{errors.title}</div>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Game ID:</label><br />
          <input
            type="text"
            name="gameID"
            value={formData.gameID}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Thumb:</label><br />
          <input
            type="text"
            name="thumb"
            style={{width: '400px'}}
            value={formData.thumb}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Cheapest Price:</label><br />
          <input
            type="text"
            name="cheapestPrice"
            value={formData.cheapestPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.cheapestPrice && <div className="text-red-500">{errors.cheapestPrice}</div>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Deals:</label>
          {formData.deals.map((deal, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                name="storeID"
                placeholder="Store ID"
                value={deal.storeID}
                onChange={(e) => handleDealChange(index, e)}
                className="w-full px-3 py-2 border rounded mb-2"
              />
              {errors[`dealStoreID${index}`] && <div className="text-red-500">{errors[`dealStoreID${index}`]}</div>}
              <input
                type="text"
                name="price"
                placeholder="Price"
                value={deal.price}
                onChange={(e) => handleDealChange(index, e)}
                className="w-full px-3 py-2 border rounded"
              />
              {errors[`dealPrice${index}`] && <div className="text-red-500">{errors[`dealPrice${index}`]}</div>}
            </div>
          ))}
          <button type="button" onClick={addDeal} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
            Add Deal
          </button>
        </div>
        <br /><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Game
        </button>
      </form>
      <div style={{ color: 'red' }}>
        {errors.form && <span>Error: {errors.form}</span>}
      </div>
      <br /><button onClick={() => navigate('/')}>Home</button>
    </div>
  );
};

export default AddGames;
