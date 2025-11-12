import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import MemoryMatching from './components/MemoryMatching';
import TicTacToe from './components/TicTacToe';
import Sudoku from './components/Sudoku';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games/memory" element={<MemoryMatching />} />
        <Route path="/games/tictactoe" element={<TicTacToe />} />
        <Route path="/games/sudoku" element={<Sudoku />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
