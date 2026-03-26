import * as React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Slider from "@mui/material/Slider";

type ReturnWarningDialogProps = {
  open: boolean;
  processing: boolean;
  vehicleTypeName: string;
  selectedStationName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ReturnWarningDialog({
  open,
  processing,
  vehicleTypeName,
  selectedStationName,
  onClose,
  onConfirm,
}: ReturnWarningDialogProps) {
  const [confirmSliderValue, setConfirmSliderValue] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setConfirmSliderValue(0);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onClose}
      PaperProps={{
        sx: {
          width: "min(90vw, 360px)",
        },
      }}
    >
      <DialogTitle>Confirm Vehicle Location</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You must physically place this {vehicleTypeName.toLowerCase()} at the base station before confirming return.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selected station: <strong>{selectedStationName}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Slide all the way to the right once the vehicle is at the base station.
        </Typography>
        <Slider
          value={confirmSliderValue}
          onChange={(_, value) => setConfirmSliderValue(Array.isArray(value) ? value[0] : value)}
          step={1}
          min={0}
          max={100}
          valueLabelDisplay="off"
          color="warning"
          aria-label="Confirm vehicle is at base station"
          sx={{
            height: 8,
            "& .MuiSlider-track": {
              border: "none",
              transition: "all 160ms ease",
            },
            "& .MuiSlider-rail": {
              opacity: 1,
            },
            "& .MuiSlider-thumb": {
              width: 24,
              height: 24,
              transition: "box-shadow 160ms ease, transform 120ms ease",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0 0 0 8px rgba(237, 108, 2, 0.2)",
              },
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Not at station</Typography>
          <Typography variant="caption" color="text.secondary">At station</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Back</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={confirmSliderValue < 100}
          onClick={onConfirm}
        >
          Return Vehicle
        </Button>
      </DialogActions>
    </Dialog>
  );
}