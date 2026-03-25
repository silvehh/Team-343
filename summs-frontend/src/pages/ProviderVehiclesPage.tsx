import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import PlaceIcon from "@mui/icons-material/Place";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { RootState } from "../store/store";
import {
  fetchProviderVehicles,
  addProviderVehicle,
  updateProviderVehicle,
  deleteProviderVehicle,
  type ProviderVehicleResponse,
  type ProviderVehicleRequest,
} from "../api/provider";
import { fetchStations, type StationResponse } from "../api/stations";

interface VehicleForm {
  vehicleType: string;
  stationId: number | "";
  pricePerHour: number | "";
}

const EMPTY_FORM: VehicleForm = {
  vehicleType: "",
  stationId: "",
  pricePerHour: "",
};

function vehicleIcon(type: string) {
  switch (type) {
    case "CAR":
      return <DirectionsCarIcon />;
    case "BIKE":
      return <PedalBikeIcon />;
    case "SCOOTER":
      return <ElectricScooterIcon />;
    default:
      return null;
  }
}

function vehicleLabel(type: string) {
  switch (type) {
    case "CAR":
      return "Car";
    case "BIKE":
      return "Bike";
    case "SCOOTER":
      return "Scooter";
    default:
      return type;
  }
}

export default function ProviderVehiclesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, accountType, userId } = useSelector(
    (state: RootState) => state.auth,
  );

  const [vehicles, setVehicles] = React.useState<ProviderVehicleResponse[]>([]);
  const [stations, setStations] = React.useState<StationResponse[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<ProviderVehicleResponse | null>(null);
  const [form, setForm] = React.useState<VehicleForm>({ ...EMPTY_FORM });
  const [formError, setFormError] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingVehicle, setDeletingVehicle] = React.useState<ProviderVehicleResponse | null>(null);
  const [selectedStationId, setSelectedStationId] = React.useState<number | null>(null);

  const isProvider = isAuthenticated && accountType === "MOBILITY_PROVIDER";

  const loadVehicles = React.useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchProviderVehicles(userId);
      setVehicles(data);
    } catch (err) {
      setSnackbar({ open: true, message: (err as Error).message, severity: "error" });
    }
  }, [userId]);

  const loadStations = React.useCallback(async () => {
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (err) {
      console.error("Failed to load stations:", err);
    }
  }, []);

  React.useEffect(() => {
    if (!isProvider) {
      navigate("/");
      return;
    }
    loadVehicles();
    loadStations();
  }, [isProvider, navigate, loadVehicles, loadStations]);

  if (!isProvider) return null;

  const openCreateDialog = (stationId?: number) => {
    setEditingVehicle(null);
    setForm({
      ...EMPTY_FORM,
      stationId: stationId ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle: ProviderVehicleResponse) => {
    setEditingVehicle(vehicle);
    setForm({
      vehicleType: vehicle.vehicleType,
      stationId: vehicle.stationId ?? "",
      pricePerHour: vehicle.pricePerHour,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (vehicle: ProviderVehicleResponse) => {
    setDeletingVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.vehicleType) {
      setFormError("Vehicle type is required");
      return;
    }
    if (!form.stationId) {
      setFormError("Please select a station");
      return;
    }
    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) {
      setFormError("Price per hour must be greater than zero");
      return;
    }

    const request: ProviderVehicleRequest = {
      vehicleType: form.vehicleType,
      stationId: Number(form.stationId),
      pricePerHour: Number(form.pricePerHour),
    };

    try {
      if (editingVehicle) {
        await updateProviderVehicle(userId!, editingVehicle.id, request);
        setSnackbar({ open: true, message: "Vehicle updated", severity: "success" });
      } else {
        await addProviderVehicle(userId!, request);
        setSnackbar({ open: true, message: "Vehicle added", severity: "success" });
      }
      setDialogOpen(false);
      loadVehicles();
      loadStations();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle || !userId) return;
    try {
      await deleteProviderVehicle(userId, deletingVehicle.id);
      setSnackbar({ open: true, message: "Vehicle deleted", severity: "success" });
      setDeleteDialogOpen(false);
      setDeletingVehicle(null);
      loadVehicles();
      loadStations();
    } catch (err) {
      setSnackbar({ open: true, message: (err as Error).message, severity: "error" });
      setDeleteDialogOpen(false);
    }
  };

  const getStationName = (stationId: number | null) =>
    stations.find((s) => s.id === stationId)?.name ?? "Unknown";

  const vehiclesAtStation = (stationId: number | undefined) =>
    vehicles.filter((v) => v.stationId === stationId);

  const filteredStations = selectedStationId
    ? stations.filter((s) => s.id === selectedStationId)
    : stations;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Stations Panel */}
      <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            pt: "80px",
            px: 3,
            bgcolor: "background.default",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                🚗 My Vehicles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your fleet — add, edit, or remove vehicles at stations
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreateDialog()}>
              Add Vehicle
            </Button>
          </Box>

          {/* Station filter */}
          {selectedStationId && (
            <Box sx={{ mb: 2 }}>
              <Button size="small" onClick={() => setSelectedStationId(null)}>
                ← Show all stations
              </Button>
            </Box>
          )}

          {/* Station cards with their vehicles */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: 2,
              overflow: "auto",
              flex: 1,
              pb: 2,
            }}
          >
            {filteredStations.map((station) => {
              const stationVehicles = vehiclesAtStation(station.id);
              return (
                <Card
                  key={station.id}
                  elevation={1}
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <CardContent>
                    {/* Station header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PlaceIcon sx={{ fontSize: 24, color: "error.main" }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                          {station.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${stationVehicles.length} of yours`}
                        size="small"
                        color={stationVehicles.length > 0 ? "primary" : "default"}
                        variant={stationVehicles.length > 0 ? "filled" : "outlined"}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      📍 {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                    </Typography>

                    {/* Capacity info */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <DirectionsCarIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {station.availableCars}/{station.carCapacity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PedalBikeIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {station.availableBikes}/{station.bikeCapacity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ElectricScooterIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {station.availableScooters}/{station.scooterCapacity}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Vehicles at this station */}
                    {stationVehicles.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                        {stationVehicles.map((vehicle) => (
                          <Box
                            key={vehicle.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {vehicleIcon(vehicle.vehicleType)}
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {vehicleLabel(vehicle.vehicleType)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ${vehicle.pricePerHour}/hr
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton size="small" onClick={() => openEditDialog(vehicle)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => openDeleteDialog(vehicle)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
                        No vehicles of yours at this station
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => openCreateDialog(station.id)}
                      size="small"
                    >
                      Add Vehicle Here
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {filteredStations.length === 0 && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                }}
              >
                <Typography color="text.secondary" variant="h6">
                  No stations available.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Sidebar — all my vehicles list */}
      <Box
        sx={{
          width: 380,
          minWidth: 380,
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
        <Typography variant="h6">All My Vehicles ({vehicles.length})</Typography>

        {vehicles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You haven't added any vehicles yet.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreateDialog()}>
              Add Your First Vehicle
            </Button>
          </Box>
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
                gap: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    flexShrink: 0,
                  }}
                >
                  {vehicleIcon(vehicle.vehicleType)}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {vehicleLabel(vehicle.vehicleType)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {vehicle.stationName ?? "No station"} &middot;{" "}
                    <AttachMoneyIcon sx={{ fontSize: 12, verticalAlign: "middle" }} />
                    {vehicle.pricePerHour}/hr
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => openEditDialog(vehicle)}
                >
                  Edit
                </Button>
                <IconButton size="small" color="error" onClick={() => openDeleteDialog(vehicle)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Add / Edit Vehicle Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}

          <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={form.vehicleType}
              label="Vehicle Type"
              onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
            >
              <MenuItem value="CAR">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DirectionsCarIcon fontSize="small" /> Car
                </Box>
              </MenuItem>
              <MenuItem value="BIKE">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PedalBikeIcon fontSize="small" /> Bike
                </Box>
              </MenuItem>
              <MenuItem value="SCOOTER">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ElectricScooterIcon fontSize="small" /> Scooter
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Station</InputLabel>
            <Select
              value={form.stationId}
              label="Station"
              onChange={(e) => setForm((prev) => ({ ...prev, stationId: e.target.value as number }))}
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlaceIcon fontSize="small" color="error" />
                    <Box>
                      <Typography variant="body2">{station.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Price per Hour ($)"
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.pricePerHour}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, pricePerHour: e.target.value === "" ? "" : Number(e.target.value) }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingVehicle ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this{" "}
            <strong>{deletingVehicle ? vehicleLabel(deletingVehicle.vehicleType) : ""}</strong> at{" "}
            <strong>{deletingVehicle ? getStationName(deletingVehicle.stationId) : ""}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
