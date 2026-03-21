import * as React from "react";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import { createRental } from "../api/rentals";
import type { VehicleResponse } from "../api/vehicles";
import type { RootState } from "../store/store";

function vehicleIcon(type: string | undefined): React.ReactNode {
  switch (type) {
    case "CAR": return <DirectionsCarIcon sx={{ fontSize: 40 }} />;
    case "BIKE": return <PedalBikeIcon sx={{ fontSize: 40 }} />;
    case "SCOOTER": return <ElectricScooterIcon sx={{ fontSize: 40 }} />;
    default: return null;
  }
}

type ReservationDialogProps = {
  open: boolean;
  vehicle: VehicleResponse;
  onClose: () => void;
  onSuccess: () => void;
};

type Phase = "confirm" | "processing" | "success" | "error";

export default function ReservationDialog({ open, vehicle, onClose, onSuccess }: ReservationDialogProps) {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setPhase("confirm");
      setErrorMessage("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!userId || !vehicle.id) return;

    setPhase("processing");

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await createRental(userId, vehicle.id);
      setPhase("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setPhase("error");
    }
  };

  return (
    <Dialog open={open} onClose={phase === "processing" ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reserve Vehicle</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {vehicleIcon(vehicle.vehicleType)}
          <Box>
            <Typography variant="h6">{vehicle.vehicleType}</Typography>
            <Typography variant="body2" color="text.secondary">
              Provider: {vehicle.providerName}
            </Typography>
            {vehicle.stationName && (
              <Typography variant="body2" color="text.secondary">
                Station: {vehicle.stationName}
              </Typography>
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ${vehicle.pricePerHour}/hr
            </Typography>
          </Box>
        </Box>

        {phase === "processing" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
            <CircularProgress size={24} />
            <Typography>Processing payment...</Typography>
          </Box>
        )}

        {phase === "success" && (
          <Alert icon={<CheckCircleOutlineIcon />} severity="success" sx={{ mt: 1 }}>
            Payment successful! Vehicle reserved.
          </Alert>
        )}

        {phase === "error" && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {phase === "confirm" && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirm}>
              Confirm & Pay
            </Button>
          </>
        )}
        {phase === "error" && (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
