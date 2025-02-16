const { MongoClient } = require('mongodb');
const { ObjectId } = require('bson');
const axios = require('axios');
require('dotenv').config();

const DATABASE_NAME = "gameDB";
const COLLECTION_NAME = "games";

// Connecting to MongoDB database
const connectDB = async () => {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
};

// Validate deals array

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = isValidUrl;

const validateDeals = (deals) => {
    if (!deals) {
        throw new Error("Deals are required for adding a game.");
    }
    validateDealsArray(deals);
    validateDealsContent(deals);
};

const validateDealsArray = (deals) => {
    if (!Array.isArray(deals)) {
        throw new Error("Deals must be an array");
    }
    if (deals.length === 0) {
        throw new Error("Deals array cannot be empty");
    }
};

const validateDealsContent = (deals) => {
    deals.forEach((deal, index) => {
        validateDealStoreId(deal, index, deals);
        validatePrice(deal.price, index);
    });
};


const validateDealStoreId = (deal, index, deals) => {
    if (!deal.storeID) {
        throw new Error(`Deal at index ${index} is missing storeID`);
    }

    // Check for duplicate storeID within the deals array
    const duplicateIndex = deals.findIndex((d, i) => d.storeID === deal.storeID && i !== index);
    if (duplicateIndex !== -1) {
        throw new Error(`Deal at index ${index} has a duplicate storeID at index ${duplicateIndex}`);
    }
};


const validatePrice = (value, index) => {
    validatePresence(value, index);
    validateTypeAndFormat(value, index);
    validateNonNegativity(value, index);
};

const validatePresence = (value, index) => {
    if (!value || value === null){
        if (index == 'cheapestPrice'){
            throw new Error('Cheapest price is required.');
        }
        throw new Error(`Price is required at index ${index}`);
    }
};

const validateTypeAndFormat = (value, index) => {
    // Convert value to string to handle both numbers and strings
    const valueStr = value.toString();

    // Updated regex to ensure only numeric values with optional two decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(valueStr)) {
        if (index === 'cheapestPrice') {
            throw new Error('Cheapest price must be a valid dollar amount (e.g., 12.50).');
        }
        throw new Error(`Price must be a valid amount at index ${index} (e.g., 12.50)`);
    }

    const num = parseFloat(valueStr);
    return num.toFixed(2);
};

const validateNonNegativity = (value, index) => {
    if (value < 0) {
        if (index == 'cheapestPrice'){
            throw new Error('Cheapest price cannot be negative.');
        }
        throw new Error(`Price at index ${index} cannot be negative`);
    }
};

// CRUD Operations
// Fetch and store game data from CheapShark API (POST)
const fetchAndStoreGame = async (req, res) => {
    const API_URL = process.env.CHEAPSHARK_API;
    const collection = await connectDB();

    try {
        // Fetch game data
        const response = await axios.get(API_URL);
        const gameData = response.data;

        if (!gameData || Object.keys(gameData).length === 0) {
            console.log("No valid data received from API.");
            return res.status(404).json({ error: "Invalid API response" });
        }

        // Transform the data to store only relevant fields
        const formattedGame = {
            gameID: gameData.info.gameID,
            title: gameData.info.title,
            thumb: gameData.info.thumb,
            cheapestPrice: gameData.cheapestPriceEver ? parseFloat(gameData.cheapestPriceEver.price) : null,
            deals: gameData.deals
                .filter(deal => deal.storeID != null && deal.price != null)
                .map(deal => ({
                    storeID: deal.storeID,
                    price: deal.price
                }))
        };

        // Check if the game already exists by non-null gameID or title
        const existingGame = await collection.findOne({
            $or: [
                { gameID: { $ne: null, $eq: formattedGame.gameID } },
                { title: formattedGame.title }
            ]
        });

        if (existingGame) {
            console.log("Game already exists in the database. Skipping insertion.");
            console.log("GameID:", existingGame.gameID);
            return res.status(409).json({ message: "Game already exists in the database." });
        }

        // Insert into MongoDB
        const result = await collection.insertOne(formattedGame);
        console.log("Game successfully inserted:", result.insertedId);

        return res.status(201).json({ message: "Game inserted successfully!", id: result.insertedId });
    } catch (error) {
        console.error("Error fetching and storing game data:", error);
        return res.status(500).json({ error: "Failed to fetch/store game data" });
    }
};

//---------------Create a Game (POST)-----------------------------------
const addGame = async (req, res) => {
    const collection = await connectDB();
    try {
        const { title, gameID, thumb, cheapestPrice, deals } = req.body;

        try {
            validateGameData({ title, cheapestPrice, deals, thumb, gameID });
        } catch (validationError) {
            return res.status(400).json({ 
                error: "Validation failed", 
                message: validationError.message 
            });
        }

        // Check if the game already exists by title or gameID
        const existingGame = await collection.findOne({
            $or: [
                { title },
                { gameID: { $ne: null, $eq: gameID } }
            ]
        });
        
        if (existingGame) {
            let duplicateFields = [];
        
            if (existingGame.title === req.body.title) {
                duplicateFields.push("title");
            }
            if (existingGame.gameID === req.body.gameID) {
                duplicateFields.push("gameID");
            }
        
            let message = duplicateFields.length > 1 
                ? `${duplicateFields.join(" and ")} already exist in the database.` 
                : `${duplicateFields[0]} already exists in the database.`;
        
            return res.status(409).json({ 
                message: message
            });
        }

        // Insert new game into the database
        const newGame = { 
            title, 
            thumb: thumb || null, 
            cheapestPrice, 
            deals,
            gameID: gameID || null,
            createdAt: new Date()
        };
        
        const result = await collection.insertOne(newGame);

        console.log("Game successfully added:", result.insertedId);
        res.status(201).json({ 
            message: "Game added successfully!", 
            id: result.insertedId 
        });
    } catch (error) {
        console.error("Error adding game:", error);
        res.status(500).json({ 
            error: "Failed to add game",
            message: error.message 
        });
    }
};

//---------------Update a Game (PUT)-----------------------------------
const validateGameData = ({ title, cheapestPrice, deals, thumb, gameID }) => {
    validateTitle(title);
    validateGameID(gameID);
    validateThumb(thumb);
    validatePrice(cheapestPrice, 'cheapestPrice');
    validateDeals(deals);
};

const validateTitle = (title) => {
    if (!isValidTitle(title)) {
        throw new Error("Title is required and must be a non-empty string");
    }
};

const validateThumb = (thumb) => {
    if (thumb && !isValidUrl(thumb)) {
        throw new Error("Thumb must be a valid URL");
    }
};

const validateGameID = (gameID) => {
    if (gameID && typeof gameID !== 'string') {
        throw new Error("GameID must be a string");
    }
};

const isValidTitle = function(title) {
    return title && typeof title === 'string' && title.trim().length > 0;
};

const updateGame = async (req, res) => {
    const collection = await connectDB();
    try {
        const gameId = new ObjectId(req.params.id);
        const existingGame = await fetchExistingGame(collection, gameId);
        const update = createUpdateObject(req.body);

        // Validate only the fields present in the update object
        validatePartialGameData(update);

        await checkForDuplicateGame(collection, gameId, update);
        await checkForEmptyUpdate(update);

        const result = await updateGameInDB(collection, gameId, update);

        await handleUpdateResult(result, req, res);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// New function to validate only the fields present in the update object
const validatePartialGameData = (update) => {
    if (update.title !== undefined) validateTitle(update.title);
    if (update.cheapestPrice !== undefined) validatePrice(update.cheapestPrice, 'cheapestPrice');
    if (update.deals !== undefined) validateDeals(update.deals);
    if (update.thumb !== undefined) validateThumb(update.thumb);
    if (update.gameID !== undefined) validateGameID(update.gameID);
};

const checkForDuplicateGame = async (collection, gameId, update) => {
    const duplicateConditions = [];
    if (update.title) {
        duplicateConditions.push({ title: update.title, _id: { $ne: gameId } });
    }
    if (update.gameID !== undefined) { // Allow null gameID
        duplicateConditions.push({ gameID: update.gameID, _id: { $ne: gameId } });
    }

    if (duplicateConditions.length > 0) {
        const duplicateGame = await collection.findOne({ $or: duplicateConditions });
        if (duplicateGame) {
            throw new Error("Duplicate title or gameID found.");
        }
    }
};

const checkForEmptyUpdate = (update) => {
    if (Object.keys(update).length === 0) {
        throw new Error("No changes detected. Provide at least one unique update.");
    }
};

const handleUpdateResult = async (result, req, res) => {
    if (result.modifiedCount === 0) {
        throw new Error("Game not found or no changes made.");
    }

    const successMessage = `Game updated with ID: ${req.params.id}`;
    console.log(successMessage);
    res.json({ message: successMessage });
};

const createUpdateObject = (body) => {
    const update = {};
    if (body.gameID !== undefined) update.gameID = body.gameID; // Allow null
    if (body.title) update.title = body.title;
    if (body.thumb) update.thumb = body.thumb;
    if (body.cheapestPrice) update.cheapestPrice = body.cheapestPrice;
    if (body.deals) update.deals = body.deals;
    return update;
};

const fetchExistingGame = async (collection, gameId) => {
    const existingGame = await collection.findOne({ _id: gameId });
    if (!existingGame) {
        throw new Error("Game not found.");
    }
    return existingGame;
};

const updateGameInDB = async (collection, gameId, newGameData) => {
    return await collection.updateOne(
        { _id: gameId },
        { $set: newGameData }
    );
};

//------------- Getting All Games (GET)-------------------------------------
const getAllGames = async (req, res) => {
    const collection = await connectDB();
    try {
        const games = await collection.find().toArray();
        console.log("Fetched all games");
        res.json(games);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch games" });
    }
};

//-------------Getting Game By ID (GET)------------------------------------------
const getGameById = async (req, res) => {
    const collection = await connectDB();
    try {
        const game = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!game) {
            throw new Error("Game not found");
        }
        console.log(`Fetched game with ID: ${req.params.id}`);
        res.json(game);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(404).json({ error: error.message });
    }
};

//---------------Deleting All Games (DELETE)---------------------------------
const deleteAllGames = async (req, res) => {
    try {
        const collection = await connectDB();
        const result = await collection.deleteMany({});
        
        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'No games found to delete' });
            console.log('No games found to delete.');
            return;
        }

        res.status(200).json({ message: `${result.deletedCount} games deleted successfully` });
        console.log('All games deleted.');
    } catch (error) {
        console.error('Error deleting all games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//---------------Deleting a Game By ID (DELETE)------------------------------------
const deleteGameById = async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await connectDB();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    fetchAndStoreGame,
    addGame,
    updateGame,
    getAllGames,
    getGameById,
    deleteAllGames,
    deleteGameById
};