import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import TestApi from "../pages/TestApi";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/test-api" element={<TestApi />} />
      </Routes>
    </BrowserRouter>
  );
}
