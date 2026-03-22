import * as React from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import PlaceIcon from "@mui/icons-material/Place";
import NavigationIcon from "@mui/icons-material/Navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { fetchStations, type StationResponse } from "../api/stations";
import { fetchVehicles, type VehicleResponse } from "../api/vehicles";
import type { RootState } from "../store/store";
import ReservationDialog from "../components/ReservationDialog";
import { navigateToStation } from "../services/navigationService";

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
  const [loading, setLoading] = React.useState(true);
  const [reserveVehicle, setReserveVehicle] = React.useState<VehicleResponse | null>(null);
  const [navigationError, setNavigationError] = React.useState<string | null>(null);

  const loadStations = React.useCallback(async () => {
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (err) {
      console.error("Failed to load stations:", err);
    }
  }, []);

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
    } else {
      setSelectedStationId(id);
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
      {/* Stations Panel */}
      <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column",
          height: "100%",
          pt: "80px",
          px: 3,
          bgcolor: "background.default"
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              📍 Mobility Stations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a station to view available vehicles and get directions
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
            overflow: "auto",
            flex: 1,
            pb: 2
          }}>
            {stations.map((station) => (
              <Card 
                key={station.id}
                elevation={selectedStationId === station.id ? 4 : 1}
                sx={{ 
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  border: selectedStationId === station.id ? 2 : 1,
                  borderColor: selectedStationId === station.id ? "primary.main" : "divider",
                  "&:hover": {
                    elevation: 3,
                    transform: "translateY(-2px)",
                    borderColor: "primary.light"
                  }
                }}
                onClick={() => handleStationClick(station)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PlaceIcon 
                        sx={{ 
                          fontSize: 28,
                          color: selectedStationId === station.id ? "primary.main" : "error.main" 
                        }} 
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        {station.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${getStationTotal(station)} available`}
                      size="small"
                      color={getStationTotal(station) > 0 ? "success" : "default"}
                      variant={getStationTotal(station) > 0 ? "filled" : "outlined"}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                        <DirectionsCarIcon fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {station.availableCars ?? 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Cars
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                        <PedalBikeIcon fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {station.availableBikes ?? 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Bikes
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                        <ElectricScooterIcon fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {station.availableScooters ?? 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Scooters
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant={selectedStationId === station.id ? "contained" : "outlined"}
                    startIcon={<NavigationIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToStation(station);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Navigate to Station
                  </Button>
                </CardContent>
              </Card>
            ))}
            {stations.length === 0 && (
              <Box sx={{ 
                gridColumn: "1 / -1", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                py: 8 
              }}>
                <Typography color="text.secondary" variant="h6">
                  No stations available.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
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
          <Button size="small" onClick={() => setSelectedStationId(null)}>
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
