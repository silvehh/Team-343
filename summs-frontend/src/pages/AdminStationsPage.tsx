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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import AddIcon from "@mui/icons-material/Add";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import type { RootState } from "../store/store";
import {
  fetchAdminStations,
  createStation,
  updateStation,
  deleteStation,
  type StationResponse,
  type StationRequest,
} from "../api/admin";

const EMPTY_FORM: StationRequest = {
  name: "",
  latitude: 0,
  longitude: 0,
  carCapacity: 0,
  bikeCapacity: 0,
  scooterCapacity: 0,
};

export default function AdminStationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, accountType } = useSelector(
    (state: RootState) => state.auth,
  );

  const [stations, setStations] = React.useState<StationResponse[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<StationRequest>({ ...EMPTY_FORM });
  const [formError, setFormError] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingStation, setDeletingStation] = React.useState<StationResponse | null>(null);

  const isAdmin = isAuthenticated && accountType === "ADMIN";

  const loadStations = React.useCallback(async () => {
    try {
      const data = await fetchAdminStations();
      setStations(data);
    } catch (err) {
      setSnackbar({ open: true, message: (err as Error).message, severity: "error" });
    }
  }, []);

  React.useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadStations();
  }, [isAdmin, navigate, loadStations]);

  if (!isAdmin) return null;

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (station: StationResponse) => {
    setEditingId(station.id!);
    setForm({
      name: station.name ?? "",
      latitude: station.latitude ?? 0,
      longitude: station.longitude ?? 0,
      carCapacity: station.carCapacity ?? 0,
      bikeCapacity: station.bikeCapacity ?? 0,
      scooterCapacity: station.scooterCapacity ?? 0,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (station: StationResponse) => {
    setDeletingStation(station);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || (form.name as string).trim() === "") {
      setFormError("Station name is required");
      return;
    }
    try {
      if (editingId != null) {
        await updateStation(editingId, form);
        setSnackbar({ open: true, message: "Station updated", severity: "success" });
      } else {
        await createStation(form);
        setSnackbar({ open: true, message: "Station created", severity: "success" });
      }
      setDialogOpen(false);
      loadStations();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingStation) return;
    try {
      await deleteStation(deletingStation.id!);
      setSnackbar({ open: true, message: "Station deleted", severity: "success" });
      setDeleteDialogOpen(false);
      setDeletingStation(null);
      loadStations();
    } catch (err) {
      setSnackbar({ open: true, message: (err as Error).message, severity: "error" });
      setDeleteDialogOpen(false);
    }
  };

  const updateField = (field: keyof StationRequest, value: string) => {
    if (field === "name") {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    }
  };

  const getStationTotal = (s: StationResponse) =>
    (s.availableCars ?? 0) + (s.availableBikes ?? 0) + (s.availableScooters ?? 0);

  return (
    <Box sx={{ height: "100vh", width: "100%", pt: "80px", px: 3, bgcolor: "background.default" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            🛠️ Station Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and delete mobility stations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Add Station
        </Button>
      </Box>

      {/* Station Cards Grid */}
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 2,
        overflow: "auto",
        pb: 2
      }}>
        {stations.map((station) => (
          <Card 
            key={station.id}
            elevation={1}
            sx={{ 
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                elevation: 3,
                transform: "translateY(-2px)",
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PlaceIcon sx={{ fontSize: 28, color: "error.main" }} />
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

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                📍 {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                    <DirectionsCarIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {station.availableCars ?? 0}/{station.carCapacity ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Cars</Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                    <PedalBikeIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {station.availableBikes ?? 0}/{station.bikeCapacity ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Bikes</Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                    <ElectricScooterIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {station.availableScooters ?? 0}/{station.scooterCapacity ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Scooters</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => openEditDialog(station)}
                >
                  Edit
                </Button>
                <IconButton color="error" onClick={() => openDeleteDialog(station)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
        {stations.length === 0 && (
          <Box sx={{ 
            gridColumn: "1 / -1", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            py: 8 
          }}>
            <Typography color="text.secondary" variant="h6" sx={{ mb: 2 }}>
              No stations yet.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Create First Station
            </Button>
          </Box>
        )}
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId != null ? "Edit Station" : "New Station"}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <TextField
            label="Station Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            autoFocus
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Latitude"
              type="number"
              fullWidth
              margin="normal"
              value={form.latitude ?? ""}
              onChange={(e) => updateField("latitude", e.target.value)}
            />
            <TextField
              label="Longitude"
              type="number"
              fullWidth
              margin="normal"
              value={form.longitude ?? ""}
              onChange={(e) => updateField("longitude", e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Car Capacity"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
              value={form.carCapacity ?? ""}
              onChange={(e) => updateField("carCapacity", e.target.value)}
            />
            <TextField
              label="Bike Capacity"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
              value={form.bikeCapacity ?? ""}
              onChange={(e) => updateField("bikeCapacity", e.target.value)}
            />
            <TextField
              label="Scooter Capacity"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
              value={form.scooterCapacity ?? ""}
              onChange={(e) => updateField("scooterCapacity", e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId != null ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Station</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deletingStation?.name}</strong>? This action cannot be undone.
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
