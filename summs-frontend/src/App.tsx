import { Routes, Route } from "react-router";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import MarketingPage from "./MarketingPage";
import VehicleBrowsePage from "./pages/VehicleBrowsePage";
import MyRentalsPage from "./pages/MyRentalsPage";
import AdminStationsPage from "./pages/AdminStationsPage";
import ParkingPage from "./pages/ParkingPage";
import TransitPage from "./pages/TransitPage";
import ProviderVehiclesPage from "./pages/ProviderVehiclesPage";

export default function App() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/vehicles" element={<VehicleBrowsePage />} />
        <Route path="/rentals" element={<MyRentalsPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/transit" element={<TransitPage />} />
        <Route path="/admin/stations" element={<AdminStationsPage />} />
        <Route path="/provider/vehicles" element={<ProviderVehiclesPage />} />
      </Routes>
    </AppTheme>
  );
}
