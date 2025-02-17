import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import GameList from "./GameList";
import GameDetails from "./GameDetails";
import AddGame from "./AddGame";
import FetchGame from "./FetchGame";
import UpdateGame from "./UpdateGame";
import DeleteGame from "./DeleteGame";
import DeleteGameById from "./DeleteGameById";

//const AUTH0_URL = process.env.REACT_APP_AUTH0_URL;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const { logout, user } = useAuth0();
  const [updateId, setUpdateId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const verifyIdExists = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/games/${id}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const handleSearch = async () => {
    if (searchId.trim()) {
      const exists = await verifyIdExists(searchId);
      if (exists) {
        navigate(`/games/${searchId}`);
      } else {
        setError("Game ID not found.");
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId.trim()) {
      const exists = await verifyIdExists(deleteId);
      if (exists) {
        navigate(`/delete-game/${deleteId}`);
      } else {
        setError("Game ID not found.");
      }
    }
  };

  const handleSubmit = async () => {
    if (updateId.trim()) {
      const exists = await verifyIdExists(updateId);
      if (exists) {
        navigate(`/update-game/${updateId}`);
      } else {
        setError("Game ID not found.");
      }
    }
  };

  return (
    <div>
      <h1>Game Management</h1>
      <p>Welcome, {user?.name}</p>
      <div style={{ position: "absolute", top: "20px", right: "20px", textAlign: "center" }}>
        <img
          src={user?.picture}
          alt="User Profile"
          width="40"
          style={{ borderRadius: "50%", display: "block", margin: "0 auto" }}
        />
        <button
          onClick={() => logout({ returnTo: window.location.origin })}
          style={{ marginTop: "10px" }}
        >
          Log out
        </button>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/games">View All Games</Link>
          </li>
          <li>
            <Link to="/add-game">Add Game</Link>
          </li>
          <li>
            <Link to="/fetch-game">Fetch & Store Game</Link>
          </li>
          <li>
            <Link to="/delete-game">Delete All Games</Link>
          </li>
        </ul>
      </nav>
      
      <h2>Search Game by ID</h2>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={searchId}
        style={{ marginRight: "10px" }}
        onChange={(e) => setSearchId(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <h2>Update Game by ID</h2>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={updateId}
        style={{ marginRight: "10px" }}
        onChange={(e) => setUpdateId(e.target.value)}
      />
      <button onClick={handleSubmit}>Update</button>

      <h2>Delete Game by ID</h2>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={deleteId}
        style={{ marginRight: "10px" }}
        onChange={(e) => setDeleteId(e.target.value)}
      />
      <button onClick={handleDelete}>Delete</button><br />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

const App = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  return isAuthenticated ? (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameList />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/add-game" element={<AddGame />} />
        <Route path="/update-game/:id" element={<UpdateGame />} />
        <Route path="/fetch-game" element={<FetchGame />} />
        <Route path="/delete-game" element={<DeleteGame />} />
        <Route path="/delete-game/:id" element={<DeleteGameById />} />
      </Routes>
    </Router>
  ) : null;
};

export default App;
