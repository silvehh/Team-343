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
import LinearProgress from "@mui/material/LinearProgress";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SubwayIcon from "@mui/icons-material/Subway";
import TrainIcon from "@mui/icons-material/Train";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { fetchTransitRoutes, type TransitRouteResponse } from "../api/transit";

// Hard-coded sample data for demonstration
const SAMPLE_TRANSIT_ROUTES: TransitRouteResponse[] = [
  {
    id: 1,
    routeNumber: "747",
    routeName: "YUL Aéroport Montréal-Trudeau / Centre-Ville",
    transitType: "BUS",
    startStation: "Aéroport Montréal-Trudeau",
    endStation: "Gare d'autocars de Montréal",
    frequencyMinutes: 10,
    currentDelayMinutes: 0,
    currentCapacityPercent: 45,
    reliabilityScore: 92,
    operatingHours: "24/7",
    isActive: true,
  },
  {
    id: 2,
    routeNumber: "Orange",
    routeName: "Ligne Orange",
    transitType: "METRO",
    startStation: "Côte-Vertu",
    endStation: "Montmorency",
    frequencyMinutes: 4,
    currentDelayMinutes: 2,
    currentCapacityPercent: 78,
    reliabilityScore: 88,
    operatingHours: "5:30 AM - 1:00 AM",
    isActive: true,
  },
  {
    id: 3,
    routeNumber: "Green",
    routeName: "Ligne Verte",
    transitType: "METRO",
    startStation: "Angrignon",
    endStation: "Honoré-Beaugrand",
    frequencyMinutes: 5,
    currentDelayMinutes: 0,
    currentCapacityPercent: 65,
    reliabilityScore: 91,
    operatingHours: "5:30 AM - 1:00 AM",
    isActive: true,
  },
  {
    id: 4,
    routeNumber: "A",
    routeName: "REM - Ligne A",
    transitType: "REM",
    startStation: "Gare Centrale",
    endStation: "Bois-Franc",
    frequencyMinutes: 5,
    currentDelayMinutes: 0,
    currentCapacityPercent: 35,
    reliabilityScore: 98,
    operatingHours: "5:00 AM - 12:30 AM",
    isActive: true,
  },
  {
    id: 5,
    routeNumber: "61",
    routeName: "Wellington",
    transitType: "BUS",
    startStation: "Station Angrignon",
    endStation: "Square Victoria",
    frequencyMinutes: 12,
    currentDelayMinutes: 5,
    currentCapacityPercent: 55,
    reliabilityScore: 75,
    operatingHours: "6:00 AM - 11:00 PM",
    isActive: true,
  },
  {
    id: 6,
    routeNumber: "Exo4",
    routeName: "Candiac - Gare Centrale",
    transitType: "TRAIN",
    startStation: "Candiac",
    endStation: "Gare Centrale",
    frequencyMinutes: 30,
    currentDelayMinutes: 8,
    currentCapacityPercent: 42,
    reliabilityScore: 82,
    operatingHours: "6:00 AM - 9:00 PM",
    isActive: true,
  },
  {
    id: 7,
    routeNumber: "Blue",
    routeName: "Ligne Bleue",
    transitType: "METRO",
    startStation: "Snowdon",
    endStation: "Saint-Michel",
    frequencyMinutes: 6,
    currentDelayMinutes: 0,
    currentCapacityPercent: 40,
    reliabilityScore: 94,
    operatingHours: "5:30 AM - 1:00 AM",
    isActive: true,
  },
  {
    id: 8,
    routeNumber: "B",
    routeName: "REM - Rive-Sud",
    transitType: "REM",
    startStation: "Gare Centrale",
    endStation: "Brossard",
    frequencyMinutes: 4,
    currentDelayMinutes: 0,
    currentCapacityPercent: 28,
    reliabilityScore: 97,
    operatingHours: "5:00 AM - 12:30 AM",
    isActive: true,
  },
];

function getTransitIcon(type: string | undefined) {
  switch (type) {
    case "BUS": return <DirectionsBusIcon />;
    case "METRO": return <SubwayIcon />;
    case "TRAIN": return <TrainIcon />;
    case "REM": return <AirportShuttleIcon />;
    default: return <DirectionsBusIcon />;
  }
}

function getTransitColor(type: string | undefined): string {
  switch (type) {
    case "BUS": return "#4CAF50";
    case "METRO": return "#2196F3";
    case "TRAIN": return "#9C27B0";
    case "REM": return "#00BFA5";
    default: return "#757575";
  }
}

function getDelayStatus(delay: number | undefined): { label: string; color: "success" | "warning" | "error" } {
  if (!delay || delay === 0) return { label: "On Time", color: "success" };
  if (delay <= 5) return { label: `${delay} min delay`, color: "warning" };
  return { label: `${delay} min delay`, color: "error" };
}

function getCapacityColor(percent: number): "success" | "warning" | "error" {
  if (percent < 50) return "success";
  if (percent < 80) return "warning";
  return "error";
}

function getReliabilityLabel(score: number | undefined): { label: string; color: "success" | "warning" | "error" } {
  if (!score) return { label: "Unknown", color: "warning" };
  if (score >= 90) return { label: "Excellent", color: "success" };
  if (score >= 70) return { label: "Good", color: "success" };
  if (score >= 50) return { label: "Fair", color: "warning" };
  return { label: "Poor", color: "error" };
}

export default function TransitPage() {
  const [routes, setRoutes] = React.useState<TransitRouteResponse[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [showActiveOnly, setShowActiveOnly] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  const loadRoutes = React.useCallback(async () => {
    setLoading(true);
    try {
      const type = typeFilter !== "ALL" ? typeFilter : undefined;
      let data = await fetchTransitRoutes(type, showActiveOnly);
      
      // Use sample data if no data from backend
      if (data.length === 0) {
        data = SAMPLE_TRANSIT_ROUTES;
        // Apply filters to sample data
        if (type) {
          data = data.filter(route => route.transitType === type);
        }
        if (showActiveOnly) {
          data = data.filter(route => route.isActive);
        }
      }
      
      setRoutes(data);
    } catch (err) {
      console.error("Failed to load transit routes:", err);
      // Use sample data on error
      let data = SAMPLE_TRANSIT_ROUTES;
      const type = typeFilter !== "ALL" ? typeFilter : undefined;
      if (type) {
        data = data.filter(route => route.transitType === type);
      }
      if (showActiveOnly) {
        data = data.filter(route => route.isActive);
      }
      setRoutes(data);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, showActiveOnly]);

  React.useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) setTypeFilter(value);
  };

  return (
    <Box sx={{ height: "100vh", width: "100%", pt: "80px", px: 3, bgcolor: "background.default", overflow: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          🚌 Public Transportation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time transit schedules, delays, and capacity data for better route planning
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
          <ToggleButton value="BUS">
            <DirectionsBusIcon sx={{ mr: 0.5 }} fontSize="small" /> Bus
          </ToggleButton>
          <ToggleButton value="METRO">
            <SubwayIcon sx={{ mr: 0.5 }} fontSize="small" /> Metro
          </ToggleButton>
          <ToggleButton value="TRAIN">
            <TrainIcon sx={{ mr: 0.5 }} fontSize="small" /> Train
          </ToggleButton>
          <ToggleButton value="REM">
            <AirportShuttleIcon sx={{ mr: 0.5 }} fontSize="small" /> REM
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant={showActiveOnly ? "contained" : "outlined"}
          size="small"
          onClick={() => setShowActiveOnly(!showActiveOnly)}
        >
          Active Routes Only
        </Button>
      </Box>

      {/* Routes Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : routes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" variant="h6">
            No transit routes available.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: 2,
          pb: 2
        }}>
          {routes.map((route) => {
            const delayStatus = getDelayStatus(route.currentDelayMinutes);
            const reliabilityStatus = getReliabilityLabel(route.reliabilityScore);
            const capacityPercent = route.currentCapacityPercent ?? 0;
            
            return (
              <Card 
                key={route.id}
                elevation={1}
                sx={{ 
                  transition: "all 0.2s ease-in-out",
                  borderLeft: 4,
                  borderColor: getTransitColor(route.transitType),
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: getTransitColor(route.transitType),
                        color: "white",
                        display: "flex"
                      }}>
                        {getTransitIcon(route.transitType)}
                      </Box>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {route.routeNumber}
                          </Typography>
                          <Chip 
                            label={route.transitType}
                            size="small"
                            sx={{ 
                              bgcolor: getTransitColor(route.transitType),
                              color: "white",
                              fontSize: "0.7rem"
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {route.routeName}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      icon={route.isActive ? <CheckCircleIcon /> : <WarningIcon />}
                      label={route.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={route.isActive ? "success" : "default"}
                      variant="outlined"
                    />
                  </Box>

                  {/* Route Info */}
                  <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Route
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {route.startStation} → {route.endStation}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Stats Grid */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                    {/* Delay Status */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                      </Box>
                      <Chip 
                        label={delayStatus.label}
                        size="small"
                        color={delayStatus.color}
                        variant="filled"
                      />
                    </Box>

                    {/* Frequency */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Frequency
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Every {route.frequencyMinutes} min
                      </Typography>
                    </Box>

                    {/* Reliability */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <StarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Reliability
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip 
                          label={reliabilityStatus.label}
                          size="small"
                          color={reliabilityStatus.color}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({route.reliabilityScore}%)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Operating Hours */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Hours
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {route.operatingHours || "24/7"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Capacity */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Current Capacity
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {capacityPercent}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={capacityPercent} 
                      color={getCapacityColor(capacityPercent)}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {capacityPercent < 50 ? "Plenty of space" : capacityPercent < 80 ? "Moderately crowded" : "Very crowded"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
