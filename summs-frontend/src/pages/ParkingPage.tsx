import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import NavigationIcon from "@mui/icons-material/Navigation";
import EvStationIcon from "@mui/icons-material/EvStation";
import AccessibleIcon from "@mui/icons-material/Accessible";
import GarageIcon from "@mui/icons-material/Garage";
import RoadIcon from "@mui/icons-material/EditRoad";
import { fetchParkingSpots, type ParkingSpotResponse } from "../api/parking";
import { navigateToStation } from "../services/navigationService";
import { SAMPLE_PARKING_SPOTS } from "../utilities/parkingData";

function getParkingIcon(type: string | undefined) {
  switch (type) {
    case "GARAGE": return <GarageIcon />;
    case "STREET": return <RoadIcon />;
    case "LOT": return <LocalParkingIcon />;
    default: return <LocalParkingIcon />;
  }
}

function getStatusColor(status: string | undefined): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "AVAILABLE": return "success";
    case "OCCUPIED": return "error";
    case "RESERVED": return "warning";
    case "MAINTENANCE": return "default";
    default: return "default";
  }
}

function getAvailabilityPercent(available: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((available / total) * 100);
}

function getAvailabilityColor(percent: number): "success" | "warning" | "error" {
  if (percent > 50) return "success";
  if (percent > 20) return "warning";
  return "error";
}

export default function ParkingPage() {
  const [parkingSpots, setParkingSpots] = React.useState<ParkingSpotResponse[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [navigationError, setNavigationError] = React.useState<string | null>(null);

  const loadParkingSpots = React.useCallback(async () => {
    setLoading(true);
    try {
      const type = typeFilter !== "ALL" ? typeFilter : undefined;
      let data = await fetchParkingSpots(type, showAvailableOnly);

      // Use sample data if no data from backend
      if (data.length === 0) {
        data = SAMPLE_PARKING_SPOTS;
        // Apply filters to sample data
        if (type) {
          data = data.filter(spot => spot.parkingType === type);
        }
        if (showAvailableOnly) {
          data = data.filter(spot => (spot.availableSpots ?? 0) > 0);
        }
      }

      setParkingSpots(data);
    } catch (err) {
      console.error("Failed to load parking spots:", err);
      // Use sample data on error
      let data = SAMPLE_PARKING_SPOTS;
      const type = typeFilter !== "ALL" ? typeFilter : undefined;
      if (type) {
        data = data.filter(spot => spot.parkingType === type);
      }
      if (showAvailableOnly) {
        data = data.filter(spot => (spot.availableSpots ?? 0) > 0);
      }
      setParkingSpots(data);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, showAvailableOnly]);

  React.useEffect(() => {
    loadParkingSpots();
  }, [loadParkingSpots]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const handleNavigate = (spot: ParkingSpotResponse) => {
    const result = navigateToStation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      label: spot.name,
    });

    if (!result.success) {
      setNavigationError(result.error || "Failed to open navigation");
    }
  };

  return (
    <Box sx={{ height: "100vh", width: "100%", pt: "80px", px: 3, bgcolor: "background.default" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          🅿️ Parking Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time monitoring of parking availability, pricing, and reservations
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={handleTypeChange}
          size="small"
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="STREET">
            <RoadIcon sx={{ mr: 0.5 }} fontSize="small" /> Street
          </ToggleButton>
          <ToggleButton value="GARAGE">
            <GarageIcon sx={{ mr: 0.5 }} fontSize="small" /> Garage
          </ToggleButton>
          <ToggleButton value="LOT">
            <LocalParkingIcon sx={{ mr: 0.5 }} fontSize="small" /> Lot
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant={showAvailableOnly ? "contained" : "outlined"}
          size="small"
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          Available Only
        </Button>
      </Box>

      {/* Parking Spots Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : parkingSpots.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" variant="h6">
            No parking spots available.
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 2,
          pb: 2
        }}>
          {parkingSpots.map((spot) => {
            const availPercent = getAvailabilityPercent(spot.availableSpots ?? 0, spot.totalSpots ?? 0);
            return (
              <Card
                key={spot.id}
                elevation={1}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: availPercent > 0 ? "success.light" : "error.light",
                        display: "flex"
                      }}>
                        {getParkingIcon(spot.parkingType)}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                          {spot.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {spot.address}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={spot.status}
                      size="small"
                      color={getStatusColor(spot.status)}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Availability */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Availability
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {spot.availableSpots}/{spot.totalSpots} spots
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={availPercent}
                      color={getAvailabilityColor(availPercent)}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  {/* Price & Features */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      ${spot.pricePerHour?.toFixed(2)}/hr
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {spot.hasEvCharging && (
                        <Chip icon={<EvStationIcon />} label="EV" size="small" variant="outlined" />
                      )}
                      {spot.hasDisabledAccess && (
                        <Chip icon={<AccessibleIcon />} label="Accessible" size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  {/* Operating Hours */}
                  {spot.operatingHours && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      🕐 {spot.operatingHours}
                    </Typography>
                  )}

                  {/* Navigate Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<NavigationIcon />}
                    onClick={() => handleNavigate(spot)}
                  >
                    Navigate to Parking
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={!!navigationError}
        autoHideDuration={6000}
        onClose={() => setNavigationError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setNavigationError(null)} severity="error" sx={{ width: "100%" }}>
          {navigationError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
