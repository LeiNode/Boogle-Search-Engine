/* import logo from './logo.svg'; */
import './App.css';
import NavigationBar from './NavigationBar';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import AddDBData from './AddDBData';
import KWICIndex from './KWICIndex';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addDBData" element={<AddDBData />} />
          <Route path="/kwicIndex" element={<KWICIndex />} />
        </Routes>
      </>
    </div>
  );
}

export default App;
