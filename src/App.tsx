import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import GamePlaceholder from './components/GamePlaceholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games/memory" element={<GamePlaceholder gameName="memory" displayName="Memory Matching" />} />
        <Route path="/games/tictactoe" element={<GamePlaceholder gameName="tictactoe" displayName="Tic Tac Toe" />} />
        <Route path="/games/sudoku" element={<GamePlaceholder gameName="sudoku" displayName="Sudoku" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
