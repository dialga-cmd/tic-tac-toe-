import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Optional: you can style further

const emptyBoard = Array(9).fill(null);

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [playersSet, setPlayersSet] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [allPlayers, setAllPlayers] = useState([]);

const getPlayerList = async () => {
  try {
    const res = await axios.get('http://localhost:3001/players');
    setAllPlayers(res.data);
  } catch (err) {
    console.error('Failed to fetch players list', err);
  }
};



  useEffect(() => {
  if (winner && winner !== 'draw') {
    const winnerUsername = winner === 'X' ? player1 : player2;
    const loserUsername = winner === 'X' ? player2 : player1;

    const updateStats = async () => {
      await axios.post('http://localhost:3001/player/result', {
        username: winnerUsername,
        result: 'win'
      });

      await axios.post('http://localhost:3001/player/result', {
        username: loserUsername,
        result: 'loss'
      });

      const [res1, res2] = await Promise.all([
        axios.get(`http://localhost:3001/player/${player1}`),
        axios.get(`http://localhost:3001/player/${player2}`)
      ]);

      setPlayerData({
        [player1]: res1.data,
        [player2]: res2.data
      });
    };

    updateStats();
  }
  getPlayerList();
}, [winner]);


  const checkWinner = (board) => {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

  const handleClick = (idx) => {
  if (board[idx] || winner) return;
  const newBoard = [...board];
  newBoard[idx] = xIsNext ? 'X' : 'O';
  setBoard(newBoard);

  const newWinner = checkWinner(newBoard);
  if (newWinner) {
    setWinner(newWinner);
  } else if (!newBoard.includes(null)) {
    setWinner('draw');
  } else {
    setXIsNext(!xIsNext);
  }
};


  const handleStartGame = async () => {
    if (!player1.trim() || !player2.trim()) return;

    const p1 = await axios.get(`http://localhost:3001/player/${player1}`);
    const p2 = await axios.get(`http://localhost:3001/player/${player2}`);

    setPlayerData({
      [player1]: p1.data,
      [player2]: p2.data
    });

    setPlayersSet(true);
  };

  const restartGame = () => {
    setBoard(emptyBoard);
    setWinner(null);
    setXIsNext(true);
  };

  const exitGame = () => {
  const p1Data = playerData[player1];
  const p2Data = playerData[player2];

  if (p1Data && p2Data) {
    setAllPlayers(prev => {
      const existing = prev.filter(p => p.username !== player1 && p.username !== player2);
      return [...existing, p1Data, p2Data];
    });
    getPlayerList();
  }

  setPlayersSet(false);
  setPlayer1('');
  setPlayer2('');
  setPlayerData({});
  setBoard(emptyBoard);
  setXIsNext(true);
  setWinner(null);
};


  if (!playersSet) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>Start New Game</h1>
        <input
          placeholder="Player 1 Name (X)"
          value={player1}
          onChange={e => setPlayer1(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Player 2 Name (O)"
          value={player2}
          onChange={e => setPlayer2(e.target.value)}
        />
        <br /><br />
        <button onClick={handleStartGame}>Start Game</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>Tic Tac Toe</h1>
      <p>
        {winner
          ? winner === 'draw'
            ? "It's a draw!"
            : `🏆 Winner: ${winner === 'X' ? player1 : player2}`
          : `Turn: ${xIsNext ? `${player1} (X)` : `${player2} (O)`}`}
      </p>


      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 60px)',
        gap: '10px',
        justifyContent: 'center',
        margin: '20px auto'
      }}>
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: '60px',
              height: '60px',
              lineHeight: '60px',
              fontSize: '24px',
              border: '1px solid #555',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
            }}
          >
            {cell}
          </div>
        ))}
      </div>

      {winner && (
        <div>
          <button onClick={restartGame} style={{ marginRight: 10 }}>Restart</button>
          <button onClick={exitGame}>Exit</button>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h2>{player1}'s Record (X):</h2>
        <p>Wins: {playerData[player1]?.wins ?? '-'}</p>

        <h2>{player2}'s Record (O):</h2>
        <p>Wins: {playerData[player2]?.wins ?? '-'}</p>
      </div>
      {allPlayers.length > 0 && (
  <div style={{ marginTop: 40 }}>
    <h2>All Player Stats:</h2>
    <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Username</th>
          <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Wins</th>
          <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Losses</th>
        </tr>
      </thead>
      <tbody>
        {allPlayers.map((p, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{p.username}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{p.wins}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{p.losses}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
    
  );
}

export default App;
// Note: Ensure that your backend server is running and accessible at http://localhost:3001