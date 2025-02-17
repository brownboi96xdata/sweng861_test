import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FetchGame = () => {
    const navigate = useNavigate();
    const fetchCalled = useRef(false);

    useEffect(() => {
        if (fetchCalled.current) return;
        fetchCalled.current = true;

        fetchAndHandleGame();
    }, []);

    const fetchAndHandleGame = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/games/fetch`);
            
            if (response.status === 201) {
                alert("Game successfully added to the database!");
            }
        } catch (err) {
            if (err.response?.status === 409) {
                alert("Game already exists in the database.");
            } else {
                alert(err.response?.data?.message || "Failed to fetch game. Please try again.");
            }
        }
    };

    return (
        <div>
            <h1>Fetch Game</h1>
            <button onClick={() => navigate('/')}>Home</button>
        </div>
    );
};

export default FetchGame;