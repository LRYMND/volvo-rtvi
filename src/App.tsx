import './App.css'
import React, { useState, useEffect } from 'react';

import Carplay from './carplay/Carplay'
import Home from './content/pages/home/Home'
import { io } from "socket.io-client";

const socket = io("ws://localhost:3001")

function testSocket(page) {
  socket.emit("FRONTEND_MESSAGE");
}


function App() {

  const [serverHello, setServerHello] = useState('');

  useEffect(() => {
    // Fetch data when the component mounts
    fetch('/api/v1/hello')
      .then((r) => r.json())
      .then(({ message }) => {
        setServerHello(message);
      });
    console.log(serverHello)
  }, []); // Empty dependency array to fetch data only once

  socket.on("BACKEND_MESSAGE", (args) => {
    console.log(args);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.io connection error:", error);
  });

  return (
    <>
      {serverHello}

      <br />

      <button type="button" onClick={() => testSocket()}>
        Click me
      </button>

      <br />

      <img src="/vite.svg" className="logo" alt="Vite logo" />
      {/* <Home /> */}
    </>
  )
}

export default App
