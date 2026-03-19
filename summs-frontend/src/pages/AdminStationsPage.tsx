import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Map, { Marker, Popup, type MapLayerMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
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
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import type { RootState } from "../store/store";
import {
  fetchAdminStations,
  createStation,
  updateStation,
  deleteStation,
  type StationResponse,
  type StationRequest,
} from "../api/admin";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

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
  const [popupStation, setPopupStation] = React.useState<StationResponse | null>(null);
  const [pendingPin, setPendingPin] = React.useState<{ lng: number; lat: number } | null>(null);

  const isAdmin = isAuthenticated && accountType === "ADMIN";

  const loadStations = React.useCallback(async () => {
    try {
      const data = await fetchAdminStations();
      setStations(data);
      setPopupStation((prev) =>
        prev ? data.find((s) => s.id === prev.id) ?? null : null,
      );
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

  const handleMapClick = (e: MapLayerMouseEvent) => {
    setPopupStation(null);
    const { lng, lat } = e.lngLat;
    setPendingPin({ lng, lat });
    setEditingId(null);
    setForm({ ...EMPTY_FORM, latitude: lat, longitude: lng });
    setFormError("");
    setDialogOpen(true);
  };

  const handleMarkerClick = (station: StationResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingPin(null);
    setPopupStation(station);
  };

  const openEditDialog = (station: StationResponse) => {
    setPopupStation(null);
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
    setPopupStation(null);
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
      setPendingPin(null);
      loadStations();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingPin(null);
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

  return (
    <Box sx={{ height: "100vh", width: "100%" }}>
      {/* Instruction banner */}
      <Box
        sx={{
          position: "fixed",
          top: 90,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <Chip
          icon={<AddLocationAltIcon />}
          label="Click anywhere on the map to add a station"
          color="primary"
          variant="filled"
          sx={{ pointerEvents: "auto", fontSize: "0.875rem", py: 2.5, px: 1 }}
        />
      </Box>

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
          onClick={handleMapClick}
        >
          {/* Existing station markers */}
          {stations.map((station) => (
            <Marker
              key={station.id}
              longitude={station.longitude ?? 0}
              latitude={station.latitude ?? 0}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(station, e.originalEvent as unknown as React.MouseEvent)}
            >
              <PlaceIcon
                sx={{
                  fontSize: 40,
                  color: "error.main",
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              />
            </Marker>
          ))}

          {/* Pending new pin (shown while create dialog is open) */}
          {pendingPin && (
            <Marker
              longitude={pendingPin.lng}
              latitude={pendingPin.lat}
              anchor="bottom"
            >
              <PlaceIcon
                sx={{
                  fontSize: 40,
                  color: "success.main",
                  animation: "bounce 0.5s ease",
                  "@keyframes bounce": {
                    "0%": { transform: "translateY(-20px)", opacity: 0 },
                    "60%": { transform: "translateY(4px)" },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                  },
                }}
              />
            </Marker>
          )}

          {/* Station popup */}
          {popupStation && (
            <Popup
              longitude={popupStation.longitude ?? 0}
              latitude={popupStation.latitude ?? 0}
              anchor="top"
              onClose={() => setPopupStation(null)}
              closeOnClick={false}
            >
              <Box sx={{ color: "#333", p: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "inherit" }}>
                  {popupStation.name}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: "inherit" }}>
                  Cars: {popupStation.availableCars ?? 0} / {popupStation.carCapacity ?? 0}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: "inherit" }}>
                  Bikes: {popupStation.availableBikes ?? 0} / {popupStation.bikeCapacity ?? 0}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: "inherit", mb: 1 }}>
                  Scooters: {popupStation.availableScooters ?? 0} / {popupStation.scooterCapacity ?? 0}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton size="small" onClick={() => openEditDialog(popupStation)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openDeleteDialog(popupStation)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
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
