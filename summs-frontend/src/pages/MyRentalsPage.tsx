import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import { fetchUserRentals, type RentalResponse } from "../api/rentals";
import { fetchStations, type StationResponse } from "../api/stations";
import type { RootState } from "../store/store";
import ReturnDialog from "../components/ReturnDialog";

function vehicleIcon(type: string | undefined): React.ReactNode {
  switch (type) {
    case "CAR": return <DirectionsCarIcon />;
    case "BIKE": return <PedalBikeIcon />;
    case "SCOOTER": return <ElectricScooterIcon />;
    default: return null;
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

export default function MyRentalsPage() {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [tab, setTab] = React.useState(0);
  const [activeRentals, setActiveRentals] = React.useState<RentalResponse[]>([]);
  const [pastRentals, setPastRentals] = React.useState<RentalResponse[]>([]);
  const [stations, setStations] = React.useState<StationResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [returnRentalItem, setReturnRentalItem] = React.useState<RentalResponse | null>(null);

  const loadData = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [active, past, stationData] = await Promise.all([
        fetchUserRentals(userId, "ACTIVE"),
        fetchUserRentals(userId, "RETURNED"),
        fetchStations(),
      ]);
      setActiveRentals(active);
      setPastRentals(past);
      setStations(stationData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  if (!isAuthenticated) {
    return (
      <Container sx={{ pt: 12, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Sign in to view your rentals
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </Container>
    );
  }

  const rentals = tab === 0 ? activeRentals : pastRentals;

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Rentals
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Active (${activeRentals.length})`} />
        <Tab label={`Past (${pastRentals.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : rentals.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary" gutterBottom>
            {tab === 0 ? "No active rentals." : "No past rentals."}
          </Typography>
          {tab === 0 && (
            <Button variant="outlined" onClick={() => navigate("/vehicles")}>
              Browse Vehicles
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rentals.map((rental) => (
            <Card key={rental.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  {vehicleIcon(rental.vehicleType)}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {rental.vehicleType}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: "auto",
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: rental.status === "ACTIVE" ? "success.light" : "grey.300",
                      color: rental.status === "ACTIVE" ? "success.contrastText" : "text.primary",
                    }}
                  >
                    {rental.status}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Provider: {rental.providerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pickup: {rental.pickupStationName ?? "—"} — {formatDateTime(rental.startTime)}
                </Typography>
                {rental.returnStationName && (
                  <Typography variant="body2" color="text.secondary">
                    Returned: {rental.returnStationName} — {formatDateTime(rental.endTime)}
                  </Typography>
                )}
                {rental.totalCost != null && (
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    Total: ${rental.totalCost}
                  </Typography>
                )}
              </CardContent>
              {rental.status === "ACTIVE" && (
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => setReturnRentalItem(rental)}
                  >
                    Return Vehicle
                  </Button>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
      )}

      {returnRentalItem && (
        <ReturnDialog
          open={!!returnRentalItem}
          rental={returnRentalItem}
          stations={stations}
          onClose={() => setReturnRentalItem(null)}
          onSuccess={() => {
            setReturnRentalItem(null);
            loadData();
          }}
        />
      )}
    </Container>
  );
}
