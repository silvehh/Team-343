import * as React from "react";
import { useSelector } from "react-redux";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import PlaceIcon from "@mui/icons-material/Place";
import NavigationIcon from "@mui/icons-material/Navigation";
import { fetchStations, type StationResponse } from "../api/stations";
import { fetchVehicles, type VehicleResponse } from "../api/vehicles";
import type { RootState } from "../store/store";
import ReservationDialog from "../components/ReservationDialog";
import { navigateToStation } from "../services/navigationService";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

function vehicleIcon(type: string | undefined): React.ReactNode {
  switch (type) {
    case "CAR": return <DirectionsCarIcon />;
    case "BIKE": return <PedalBikeIcon />;
    case "SCOOTER": return <ElectricScooterIcon />;
    default: return null;
  }
}

export default function VehicleBrowsePage() {
  const { isAuthenticated, accountType } = useSelector((state: RootState) => state.auth);

  const [stations, setStations] = React.useState<StationResponse[]>([]);
  const [vehicles, setVehicles] = React.useState<VehicleResponse[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [selectedStationId, setSelectedStationId] = React.useState<number | null>(null);
  const [popupStation, setPopupStation] = React.useState<StationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reserveVehicle, setReserveVehicle] = React.useState<VehicleResponse | null>(null);
  const [navigationError, setNavigationError] = React.useState<string | null>(null);

  const loadStations = React.useCallback(async () => {
    try {
      const data = await fetchStations();
      setStations(data);
      // Keep popup in sync with fresh data
      setPopupStation((prev) =>
        prev ? data.find((s) => s.id === prev.id) ?? null : null,
      );
    } catch (err) {
      console.error("Failed to load stations:", err);
    }
  }, []);

  // Load vehicles when filters change
  const loadVehicles = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVehicles(
        typeFilter !== "ALL" ? typeFilter : undefined,
        selectedStationId ?? undefined,
      );
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, selectedStationId]);

  // Load both on mount and whenever filters change
  React.useEffect(() => {
    loadStations();
    loadVehicles();
  }, [loadStations, loadVehicles]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const handleStationClick = (station: StationResponse) => {
    const id = station.id ?? null;
    if (selectedStationId === id) {
      setSelectedStationId(null);
      setPopupStation(null);
    } else {
      setSelectedStationId(id);
      setPopupStation(station);
    }
  };

  const canReserve = isAuthenticated && accountType === "USER";

  const getStationTotal = (s: StationResponse) =>
    (s.availableCars ?? 0) + (s.availableBikes ?? 0) + (s.availableScooters ?? 0);

  const handleNavigateToStation = (station: StationResponse) => {
    const result = navigateToStation({
      latitude: station.latitude,
      longitude: station.longitude,
      label: station.name,
    });

    if (!result.success) {
      setNavigationError(result.error || "Failed to open navigation");
    }
  };

  const handleCloseNavigationError = () => {
    setNavigationError(null);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Map Panel */}
      <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
        {MAPBOX_TOKEN ? (
          <Map
            initialViewState={{
              longitude: -73.575,
              latitude: 45.515,
              zoom: 13,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {stations.map((station) => (
              <Marker
                key={station.id}
                longitude={station.longitude ?? 0}
                latitude={station.latitude ?? 0}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleStationClick(station);
                }}
              >
                <Badge
                  badgeContent={getStationTotal(station)}
                  color={getStationTotal(station) > 0 ? "primary" : "default"}
                  sx={{ cursor: "pointer" }}
                >
                  <PlaceIcon
                    sx={{
                      fontSize: 36,
                      color: selectedStationId === station.id ? "primary.main" : "error.main",
                    }}
                  />
                </Badge>
              </Marker>
            ))}

            {popupStation && (
              <Popup
                longitude={popupStation.longitude ?? 0}
                latitude={popupStation.latitude ?? 0}
                anchor="top"
                onClose={() => setPopupStation(null)}
                closeOnClick={false}
              >
                <Box sx={{ color: "#333" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "inherit" }}>
                    {popupStation.name}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: "inherit" }}>
                    Cars: {popupStation.availableCars ?? 0}/{popupStation.carCapacity ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: "inherit" }}>
                    Bikes: {popupStation.availableBikes ?? 0}/{popupStation.bikeCapacity ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: "inherit" }}>
                    Scooters: {popupStation.availableScooters ?? 0}/{popupStation.scooterCapacity ?? 0}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<NavigationIcon />}
                    onClick={() => handleNavigateToStation(popupStation)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    Navigate
                  </Button>
                </Box>
              </Popup>
            )}
          </Map>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography color="text.secondary">
              Set VITE_MAPBOX_TOKEN in .env to enable the map
            </Typography>
          </Box>
        )}
      </Box>

      {/* Sidebar */}
      <Box
        sx={{
          width: 420,
          minWidth: 420,
          overflowY: "auto",
          borderLeft: 1,
          bgcolor: "background.default",
          borderColor: "divider",
          p: 2,
          pt: "90px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">
          {selectedStationId
            ? `Vehicles at ${stations.find((s) => s.id === selectedStationId)?.name ?? "station"}`
            : "All Available Vehicles"}
        </Typography>

        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={handleTypeChange}
          size="small"
          fullWidth
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="CAR">
            <DirectionsCarIcon sx={{ mr: 0.5 }} fontSize="small" /> Car
          </ToggleButton>
          <ToggleButton value="BIKE">
            <PedalBikeIcon sx={{ mr: 0.5 }} fontSize="small" /> Bike
          </ToggleButton>
          <ToggleButton value="SCOOTER">
            <ElectricScooterIcon sx={{ mr: 0.5 }} fontSize="small" /> Scooter
          </ToggleButton>
        </ToggleButtonGroup>

        {selectedStationId && (
          <Button size="small" onClick={() => { setSelectedStationId(null); setPopupStation(null); }}>
            Clear station filter
          </Button>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : vehicles.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No vehicles available{typeFilter !== "ALL" ? ` for type ${typeFilter}` : ""}.
          </Typography>
        ) : (
          vehicles.map((vehicle) => (
            <Box
              key={vehicle.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  flexShrink: 0,
                }}>
                  {vehicleIcon(vehicle.vehicleType)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {vehicle.vehicleType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {vehicle.stationName ?? "Unknown station"} &middot; {vehicle.providerName}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${vehicle.pricePerHour}/hr
                </Typography>
                {canReserve ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setReserveVehicle(vehicle)}
                  >
                    Reserve
                  </Button>
                ) : (
                  <Tooltip title={!isAuthenticated ? "Sign in to reserve" : "Only users can reserve vehicles"}>
                    <span>
                      <Button size="small" variant="outlined" disabled>
                        Reserve
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>

      {reserveVehicle && (
        <ReservationDialog
          open={!!reserveVehicle}
          vehicle={reserveVehicle}
          onClose={() => setReserveVehicle(null)}
          onSuccess={() => {
            setReserveVehicle(null);
            loadStations();
            loadVehicles();
          }}
        />
      )}

      <Snackbar
        open={!!navigationError}
        autoHideDuration={6000}
        onClose={handleCloseNavigationError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNavigationError} severity="error" sx={{ width: "100%" }}>
          {navigationError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
