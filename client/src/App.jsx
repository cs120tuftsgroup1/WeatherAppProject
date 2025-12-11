import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/navbar.jsx";

import Home from "./Pages/home.jsx";
import Login from "./Pages/login.jsx";
import Signup from "./Pages/signup.jsx";

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Add more pages here later... */}
      </Routes>
    </Router>
  );
}
