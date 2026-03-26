import * as React from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import PlaceIcon from "@mui/icons-material/Place";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { returnRental, type RentalResponse } from "../api/rentals";
import type { StationResponse } from "../api/stations";
import type { RootState } from "../store/store";
import ReturnWarningDialog from "./ReturnWarningDialog";

type ReturnDialogProps = {
  open: boolean;
  rental: RentalResponse;
  stations: StationResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

function getAvailableSlots(station: StationResponse, vehicleType: string | undefined): { current: number; capacity: number } {
  switch (vehicleType) {
    case "CAR":
      return { current: station.availableCars ?? 0, capacity: station.carCapacity ?? 0 };
    case "BIKE":
      return { current: station.availableBikes ?? 0, capacity: station.bikeCapacity ?? 0 };
    case "SCOOTER":
      return { current: station.availableScooters ?? 0, capacity: station.scooterCapacity ?? 0 };
    default:
      return { current: 0, capacity: 0 };
  }
}

export default function ReturnDialog({ open, rental, stations, onClose, onSuccess }: ReturnDialogProps) {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [selectedStationId, setSelectedStationId] = React.useState<number | null>(null);
  const [warningOpen, setWarningOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<"select" | "processing" | "success" | "error">("select");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelectedStationId(null);
      setWarningOpen(false);
      setPhase("select");
      setErrorMessage("");
    }
  }, [open]);

  const handleReturn = async () => {
    if (!userId || !selectedStationId || !rental.id) return;

    setWarningOpen(false);
    setPhase("processing");
    try {
      await returnRental(rental.id, userId, selectedStationId);
      setPhase("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setPhase("error");
    }
  };

  const vehicleTypeName = rental.vehicleType ?? "Vehicle";
  const selectedStation = stations.find((station) => station.id === selectedStationId);

  return (
    <>
    <Dialog open={open} onClose={phase === "processing" || warningOpen ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Return {vehicleTypeName} to a Station</DialogTitle>
      <DialogContent>
        {phase === "select" && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a station with available capacity for your {vehicleTypeName.toLowerCase()}:
            </Typography>
            <List>
              {stations.map((station) => {
                const { current, capacity } = getAvailableSlots(station, rental.vehicleType);
                const isFull = current >= capacity;

                return (
                  <ListItemButton
                    key={station.id}
                    selected={selectedStationId === station.id}
                    disabled={isFull}
                    onClick={() => setSelectedStationId(station.id ?? null)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      opacity: isFull ? 0.5 : 1,
                    }}
                  >
                    <ListItemIcon>
                      <PlaceIcon color={isFull ? "disabled" : "primary"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={station.name}
                      secondary={isFull ? "Full" : `${current}/${capacity} ${vehicleTypeName.toLowerCase()}s`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}

        {phase === "processing" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
            <CircularProgress size={24} />
            <Typography>Returning vehicle...</Typography>
          </Box>
        )}

        {phase === "success" && (
          <Alert icon={<CheckCircleOutlineIcon />} severity="success">
            Vehicle returned successfully!
          </Alert>
        )}

        {phase === "error" && (
          <Alert severity="error">{errorMessage}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {phase === "select" && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedStationId}
              onClick={() => setWarningOpen(true)}
            >
              Continue
            </Button>
          </>
        )}
        {phase === "error" && (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>

    <ReturnWarningDialog
      open={warningOpen}
      processing={phase === "processing"}
      vehicleTypeName={vehicleTypeName}
      selectedStationName={selectedStation?.name ?? "No station selected"}
      onClose={() => setWarningOpen(false)}
      onConfirm={handleReturn}
    />
    </>
  );
}
