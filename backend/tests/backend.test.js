const axios = require('axios');
const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const gameController = require('../controllers/gameController');
const Game = require('../models/gameModel');
const gameRoutes = require('../routes/gameRoutes');
const gameServices = require('../services/gameServices');
const getRandomGameId = require('../utils/getRandomGameId');

const app = express();
app.use(express.json());
app.use('/api', gameRoutes);

jest.mock('axios');

describe('Backend Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Game.deleteMany({});
  });

  // Happy paths
  describe('Happy Paths', () => {
    it('should add a new game', async () => {
        const req = {
          body: {
            title: 'New Game ' + new Date().getTime(),
            gameID: '1234' + new Date().getTime(),
            thumb: 'http://example.com/thumb.jpg',
            cheapestPrice: 9.99,
            deals: [{ storeID: '1', price: 9.99 }]
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
      
        await gameController.addGame(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          title: req.body.title,
          gameID: req.body.gameID,
          thumb: req.body.thumb,
          cheapestPrice: req.body.cheapestPrice,
          deals: req.body.deals,
          message: 'Game added successfully!'
        }));
      });

    it('should update an existing game', async () => {
      // First, add a game to the database
      const newGame = new Game({
        title: 'Game to Update',
        gameID: '5678',
        thumb: 'http://example.com/thumb.jpg',
        cheapestPrice: 19.99,
        deals: [{ storeID: '1', price: 19.99 }]
      });
      const savedGame = await newGame.save();

      const req = {
        params: { id: savedGame._id.toString() }, // Use the saved game's _id
        body: { title: 'Updated Game' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('game');
          expect(data.game).toHaveProperty('_id', savedGame._id.toString());
          expect(data.game).toHaveProperty('title', 'Updated Game');
        })
      };

      await gameController.updateGame(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fetch game data from API', async () => {
      const gameId = '1234';
      const apiUrl = `https://api.example.com/games/${gameId}`;
      const mockData = { data: { gameID: gameId, title: 'Test Game' } };

      axios.get.mockResolvedValue(mockData);

      const result = await gameServices.fetchGameFromAPI(gameId);
      expect(result).toHaveProperty('gameID', gameId);
      expect(result).toHaveProperty('title', 'Test Game');
    });

    it('should get all games', async () => {
      const games = [
        { title: 'Game 1', gameID: '1', thumb: 'http://example.com/thumb1.jpg', cheapestPrice: 9.99, deals: [{ storeID: '1', price: 9.99 }] },
        { title: 'Game 2', gameID: '2', thumb: 'http://example.com/thumb2.jpg', cheapestPrice: 19.99, deals: [{ storeID: '2', price: 19.99 }] }
      ];
      await Game.insertMany(games);

      const res = await request(app).get('/api/games');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should get a game by ID', async () => {
      const newGame = new Game({
        title: 'Game to Get',
        gameID: '5678',
        thumb: 'http://example.com/thumb.jpg',
        cheapestPrice: 19.99,
        deals: [{ storeID: '1', price: 19.99 }]
      });
      const savedGame = await newGame.save();

      const res = await request(app).get(`/api/games/${savedGame._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Game to Get');
    });

    it('should delete a game by ID', async () => {
      const newGame = new Game({
        title: 'Game to Delete',
        gameID: '5678',
        thumb: 'http://example.com/thumb.jpg',
        cheapestPrice: 19.99,
        deals: [{ storeID: '1', price: 19.99 }]
      });
      const savedGame = await newGame.save();

      const res = await request(app).delete(`/api/games/${savedGame._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Game deleted successfully');
    });

    it('should delete all games', async () => {
      const games = [
        { title: 'Game 1', gameID: '1', thumb: 'http://example.com/thumb1.jpg', cheapestPrice: 9.99, deals: [{ storeID: '1', price: 9.99 }] },
        { title: 'Game 2', gameID: '2', thumb: 'http://example.com/thumb2.jpg', cheapestPrice: 19.99, deals: [{ storeID: '2', price: 19.99 }] }
      ];
      await Game.insertMany(games);

      const res = await request(app).delete('/api/games');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', '2 games deleted successfully');
    });

    it('should handle duplicate game addition', async () => {
      const req = {
        body: {
          title: 'Duplicate Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await gameController.addGame(req, res);
      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should handle invalid game ID for update', async () => {
      const req = {
        params: { id: 'invalid' },
        body: { title: 'Updated Game' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Invalid game ID');
        })
      };

      await gameController.updateGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle invalid game ID for deletion', async () => {
      const res = await request(app).delete('/api/games/invalid');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });

    it('should handle empty game title', async () => {
      const req = {
        body: {
          title: '',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Game title is required');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle invalid URL for thumb', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'invalid-url',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Thumb must be a valid URL');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing deals array', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Deals are required for adding a game.');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle empty deals array', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: []
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Deals array cannot be empty');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle duplicate storeID in deals', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 9.99 }, { storeID: '1', price: 19.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Deal at index 1 has a duplicate storeID at index 0');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle invalid price format in deals', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 'invalid-price' }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Price must be a valid amount at index 0 (e.g., 12.50)');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle negative price in deals', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: -9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Price at index 0 cannot be negative');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing storeID in deals', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ price: 9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Deal at index 0 is missing storeID');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing price in deals', async () => {
      const req = {
        body: {
          title: 'New Game',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1' }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Price is required at index 0');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Error handling
  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const gameId = '1234';
      const apiUrl = `https://api.example.com/games/${gameId}`;
      const error = new Error('Network Error');

      axios.get.mockRejectedValue(error);

      const result = await gameServices.fetchGameFromAPI(gameId);
      expect(result).toBeNull();
    });

    it('should handle invalid game ID', async () => {
      const req = {
        params: { id: ' invalid' },
        body: { title: 'Updated Game' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Invalid game ID');
        })
      };

      await gameController.updateGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty game title', async () => {
      const req = {
        body: {
          title: '',
          gameID: '1234',
          thumb: 'http://example.com/thumb.jpg',
          cheapestPrice: 9.99,
          deals: [{ storeID: '1', price: 9.99 }]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(data).toHaveProperty('error', 'Game title is required');
        })
      };

      await gameController.addGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});