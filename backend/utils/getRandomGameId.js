const mongoose = require('mongoose');
const Game = require('../models/gameModel'); // Assuming Game is the Mongoose model for the games collection

/**
 * Fetches a random game ID from the database.
 * @returns {Promise<string>} A promise that resolves to a random game ID.
 */
async function getRandomGameId() {
    try {
        // Count the total number of documents in the collection
        const count = await Game.countDocuments();

        // Generate a random number between 0 and count - 1
        const randomIndex = Math.floor(Math.random() * count);

        // Find one document at the random index
        const randomGame = await Game.findOne().skip(randomIndex).select('_id');

        // Return the _id of the random game
        return randomGame ? randomGame._id.toString() : null;
    } catch (error) {
        console.error('Error fetching random game ID:', error);
        throw error;
    }
}

module.exports = {getRandomGameId};