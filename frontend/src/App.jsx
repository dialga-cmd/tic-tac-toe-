import React, { useState, useEffect } from 'react';
import axios from 'axios';

const emptyBoard = Array(9).fill(null);

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (winner && userData) {
      const result = winner === 'X' ? 'win' : 'loss';
      axios.post('http://localhost:3001/player/result', { username: userData.username, result });
    }
  }, [winner]);

  const checkWinner = (board) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = board.slice();
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    const newWinner = checkWinner(newBoard);
    if (newWinner) setWinner(newWinner);
    setXIsNext(!xIsNext);
  };

  const handleLogin = async () => {
    const res = await axios.get(`http://localhost:3001/player/${username}`);
    setUserData(res.data);
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setXIsNext(true);
    setWinner(null);
  };

  if (!userData) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl mb-2">Enter your username to play</h1>
        <input className="border p-1" value={username} onChange={e => setUsername(e.target.value)} />
        <button className="ml-2 bg-blue-500 text-white px-3 py-1" onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Tic Tac Toe</h1>
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="w-16 h-16 flex items-center justify-center border text-2xl cursor-pointer"
          >
            {cell}
          </div>
        ))}
      </div>
      <div className="mt-4">
        {winner ? <p>Winner: {winner}</p> : <p>Next: {xIsNext ? 'X' : 'O'}</p>}
        <button onClick={resetGame} className="mt-2 bg-green-500 text-white px-3 py-1">Restart</button>
      </div>
      <div className="mt-6">
        <h2 className="font-bold">{userData.username}'s Record:</h2>
        <p>Wins: {userData.wins}</p>
        <p>Losses: {userData.losses}</p>
      </div>
    </div>
  );
}

export default App;