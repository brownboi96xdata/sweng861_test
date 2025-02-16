const axios = require('axios');
require('dotenv').config();

/**
 * Fetches game data from the CheapShark API using the provided game ID.
 * @param {string} gameId - The ID of the game to fetch.
 * @returns {Promise<Object|null>} - The game data or null if an error occurs.
 */
const fetchGameFromAPI = async (gameId) => {
  try {
    const apiUrl = `${process.env.CHEAPSHARK_API}&id=${gameId}`; // Use env variable
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching game data:', error);
    return null;
  }
};

module.exports = {
  fetchGameFromAPI
};