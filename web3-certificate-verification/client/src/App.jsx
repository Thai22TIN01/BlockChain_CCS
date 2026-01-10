import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Verify from "./pages/Verify";
import Issue from "./pages/Issue";
import Revoke from "./pages/Revoke";
import MyCertificates from "./pages/MyCertificates";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Verify />} />
        <Route path="/cap" element={<Issue />} />
        <Route path="/thu-hoi" element={<Revoke />} />
        <Route path="/cua-toi" element={<MyCertificates />} />
      </Routes>
    </BrowserRouter>
  );
}
