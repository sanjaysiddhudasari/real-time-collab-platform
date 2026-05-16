import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/register" element={<Register/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/room" element= {<Room/>}/>
      <Route path="/forgot-password" element= {<ForgotPassword/>}/>
      <Route path ='/room/:roomId' element={<Room/>} />
    </Routes>
  );
}

export default App;

