import { Routes, Route } from "react-router";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import MarketingPage from "./MarketingPage";
import VehicleBrowsePage from "./pages/VehicleBrowsePage";
import MyRentalsPage from "./pages/MyRentalsPage";
import AdminStationsPage from "./pages/AdminStationsPage";

export default function App() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/vehicles" element={<VehicleBrowsePage />} />
        <Route path="/rentals" element={<MyRentalsPage />} />
        <Route path="/admin/stations" element={<AdminStationsPage />} />
      </Routes>
    </AppTheme>
  );
}
