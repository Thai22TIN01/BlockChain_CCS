import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Verify from "./pages/Verify";
import Issue from "./pages/Issue";
import Revoke from "./pages/Revoke";
import MyCertificates from "./pages/MyCertificates";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-background">
        <Navbar />

        <Routes>
          <Route path="/" element={<Verify />} />
          <Route path="/cap" element={<Issue />} />
          <Route path="/thu-hoi" element={<Revoke />} />
          <Route
            path="/danh-sach-chung-chi"
            element={<MyCertificates />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
