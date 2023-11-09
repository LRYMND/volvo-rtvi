import './App.css'

import Carplay from './carplay/Carplay'
import Home from './content/pages/home/Home'
import React, { useState, useEffect } from 'react';

import { io } from "socket.io-client";

const socket = io("ws://localhost:4001")

function testSocket() {
  console.log("click")
  socket.emit("FRONTEND_MESSAGE", "HELLO FROM FRONTEND");
}


function App() {

  useEffect(() => {
    socket.on("BACKEND_MESSAGE", (args) => {
      console.log(args);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
    });
  }, [])

  return (
    <>
    <button type="button" onClick={() => testSocket()}>
        Click me
      </button>
    <Carplay />
    </>
  )
}

export default App
