import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/HomePage';
import Login from './pages/Login/Login';
import MedicalTests from './pages/doctor/MedicalTests/medicaltests';
import Prescriptions from './pages/doctor/Prescriptions/prescriptions';

function App() {
  useEffect(()=> {

  })
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/MedicalTests" element={<MedicalTests />} />
        <Route path="/Prescriptions" element={<Prescriptions/>} />
        <Route path="/Reports" element={<Reports/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
