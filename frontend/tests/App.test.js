import React from 'react'; // Added import
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');
const App = require('../src/App').default;
const GameList = require('../src/GameList').default;
const GameDetails = require('../src/GameDetails').default;
const AddGame = require('../src/AddGame').default;
const FetchGame = require('../src/FetchGame').default;
const UpdateGame = require('../src/UpdateGame').default;
const DeleteGame = require('../src/DeleteGame').default;
const DeleteGameById = require('../src/DeleteGameById').default;

describe('GameList Component', () => {
  test('renders game list table', () => {
    render(<GameList />);
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
  });

  test('displays correct number of games', () => {
    const games = [{ _id: '1', title: 'Game 1' }, { _id: '2', title: 'Game 2' }];
    render(<GameList games={games} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(games.length + 1); // Including header row
  });

  test('displays game title', () => {
    const games = [{ _id: '1', title: 'Game 1' }];
    render(<GameList games={games} />);
    const titleElement = screen.getByText(/Game 1/i);
    expect(titleElement).toBeInTheDocument();
  });
});

describe('GameDetails Component', () => {
  test('renders game details', () => {
    const game = { _id: '1', title: 'Game 1', gameId: '101', thumb: 'url', cheapestPrice: '10.00', deals: [] };
    render(<GameDetails game={game} />);
    const titleElement = screen.getByText(/Game 1/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('displays game thumbnail URL', () => {
    const game = { _id: '1', title: 'Game 1', thumb: 'http://example.com/thumb.jpg' };
    render(<GameDetails game={game} />);
    const thumbElement = screen.getByText(/http:\/\/example.com\/thumb.jpg/i);
    expect(thumbElement).toBeInTheDocument();
  });

  test('displays game cheapest price', () => {
    const game = { _id: '1', title: 'Game 1', cheapestPrice: '10.00' };
    render(<GameDetails game={game} />);
    const priceElement = screen.getByText(/\$10.00/i);
    expect(priceElement).toBeInTheDocument();
  });
});

describe('AddGame Component', () => {
  test('renders add game form', () => {
    render(<AddGame />);
    const formElement = screen.getByRole('form');
    expect(formElement).toBeInTheDocument();
  });

  test('submits form with correct data', () => {
    render(<AddGame />);
    const inputElement = screen.getByLabelText(/title/i);
    fireEvent.change(inputElement, { target: { value: 'New Game' } });
    const submitButton = screen.getByRole('button', { name: /add game/i });
    fireEvent.click(submitButton);
    // Add assertions for form submission
  });

  test('displays error message for empty title', () => {
    render(<AddGame />);
    const submitButton = screen.getByRole('button', { name: /add game/i });
    fireEvent.click(submitButton);
    const errorMessage = screen.getByText(/title is required/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

describe('FetchGame Component', () => {
  test('fetches and displays game data', async () => {
    render(<FetchGame />);
    const fetchButton = screen.getByRole('button', { name: /fetch game/i });
    fireEvent.click(fetchButton);
    // Add assertions for fetched data
  });

  test('displays success message on fetch', async () => {
    render(<FetchGame />);
    const fetchButton = screen.getByRole('button', { name: /fetch game/i });
    fireEvent.click(fetchButton);
    const successMessage = await screen.findByText(/game successfully added to the database/i);
    expect(successMessage).toBeInTheDocument();
  });
});

describe('UpdateGame Component', () => {
  test('renders update game form', () => {
    render(<UpdateGame />);
    const formElement = screen.getByRole('form');
    expect(formElement).toBeInTheDocument();
  });

  test('updates game with correct data', () => {
    render(<UpdateGame />);
    const inputElement = screen.getByLabelText(/title/i);
    fireEvent.change(inputElement, { target: { value: 'Updated Game' } });
    const updateButton = screen.getByRole('button', { name: /update game/i });
    fireEvent.click(updateButton);
    // Add assertions for update action
  });

  test('displays error message for invalid game ID', () => {
    render(<UpdateGame />);
    const inputElement = screen.getByLabelText(/game id/i);
    fireEvent.change(inputElement, { target: { value: 'invalid-id' } });
    const updateButton = screen.getByRole('button', { name: /update game/i });
    fireEvent.click(updateButton);
    const errorMessage = screen.getByText(/invalid game id/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

describe('DeleteGame Component', () => {
  test('renders delete game button', () => {
    render(<DeleteGame />);
    const deleteButton = screen.getByRole('button', { name: /delete game/i });
    expect(deleteButton).toBeInTheDocument();
  });

  test('deletes game on button click', () => {
    render(<DeleteGame />);
    const deleteButton = screen.getByRole('button', { name: /delete game/i });
    fireEvent.click(deleteButton);
    // Add assertions for delete action
  });

  test('displays success message on delete', async () => {
    render(<DeleteGame />);
    const deleteButton = screen.getByRole('button', { name: /delete game/i });
    fireEvent.click(deleteButton);
    const successMessage = await screen.findByText(/game deleted successfully/i);
    expect(successMessage).toBeInTheDocument();
  });
});

describe('DeleteGameById Component', () => {
  test('renders delete by ID form', () => {
    render(<DeleteGameById />);
    const formElement = screen.getByRole('form');
    expect(formElement).toBeInTheDocument();
  });

  test('deletes game by ID', () => {
    render(<DeleteGameById />);
    const inputElement = screen.getByLabelText(/game id/i);
    fireEvent.change(inputElement, { target: { value: '1' } });
    const deleteButton = screen.getByRole('button', { name: /delete by id/i });
    fireEvent.click(deleteButton);
    // Add assertions for delete by ID action
  });

  test('displays success message on delete by ID', async () => {
    render(<DeleteGameById />);
    const inputElement = screen.getByLabelText(/game id/i);
    fireEvent.change(inputElement, { target: { value: '1' } });
    const deleteButton = screen.getByRole('button', { name: /delete by id/i });
    fireEvent.click(deleteButton);
    const successMessage = await screen.findByText(/game deleted successfully/i);
    expect(successMessage).toBeInTheDocument();
  });
});