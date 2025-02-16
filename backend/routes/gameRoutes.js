const express = require('express');
const {
    fetchAndStoreGame,
    addGame,
    updateGame,
    getAllGames,
    getGameById,
    deleteAllGames,
    deleteGameById
} = require('../controllers/gameController');

const router = express.Router();

// Define routes for game operations
router.get('/games', getAllGames);
router.get('/games/:id', getGameById);
router.post('/games', addGame);
router.put('/games/:id', updateGame);
router.delete('/games', deleteAllGames);
router.delete('/games/:id', deleteGameById);
router.post('/games/fetch', fetchAndStoreGame);

module.exports = router;