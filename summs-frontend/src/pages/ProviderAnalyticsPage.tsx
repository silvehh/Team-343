import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import DownloadIcon from "@mui/icons-material/Download";

import type { RootState, AppDispatch } from "../store/store";
import {
  loadProviderAnalyticsSummary,
  resetProviderAnalytics,
} from "../store/providerAnalyticsSlice";

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes)) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function clampPercent(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function formatDateTime(dateTimeString: string | undefined): string {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  } catch {
    return dateTimeString;
  }
}

function downloadFile(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[\n\r,\"]/g.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export default function ProviderAnalyticsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, accountType, userId } = useSelector(
    (s: RootState) => s.auth,
  );
  const analytics = useSelector((s: RootState) => s.providerAnalytics);

  const isProvider = isAuthenticated && accountType === "MOBILITY_PROVIDER";

  React.useEffect(() => {
    if (!isProvider) {
      navigate("/");
      return;
    }
    if (userId) {
      void dispatch(resetProviderAnalytics());
      void dispatch(loadProviderAnalyticsSummary(userId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProvider, userId, navigate]);

  if (!isProvider) return null;

  const data = analytics.data;
  const revenue = data?.revenue;
  const fleet = data?.fleetUtilization;
  const activity = data?.rentalActivity;

  const totalRevenue = revenue?.totalRevenue ?? 0;
  const carRevenue = revenue?.carRevenue ?? 0;
  const bikeRevenue = revenue?.bikeRevenue ?? 0;
  const scooterRevenue = revenue?.scooterRevenue ?? 0;

  const revenueByType =
    (carRevenue ?? 0) + (bikeRevenue ?? 0) + (scooterRevenue ?? 0);
  const carRevenuePct = revenueByType > 0 ? carRevenue / revenueByType : 0;
  const bikeRevenuePct = revenueByType > 0 ? bikeRevenue / revenueByType : 0;
  const scooterRevenuePct = revenueByType > 0 ? scooterRevenue / revenueByType : 0;

  const totalVehicles = fleet?.totalVehicles ?? 0;
  const availableVehicles = fleet?.availableVehicles ?? 0;
  const rentedVehicles = fleet?.rentedVehicles ?? 0;
  const availabilityRate = fleet?.availabilityRate ?? 0;

  const completedRentals = activity?.completedRentals ?? "-";
  const activeRentals = activity?.activeRentals ?? "-";
  const averageDuration = activity?.averageRentalDurationMinutes ?? 0;

  const isLoading = analytics.status === "loading";
  const hasError = analytics.status === "failed";
  const bikeTrigger = (fleet?.availableBikes ?? 0) < (fleet?.rentedBikes ?? 0) ? true : false;
  const carTrigger = (fleet?.availableCars ?? 0) < (fleet?.rentedCars ?? 0) ? true : false;
  const scooterTrigger = (fleet?.availableScooters ?? 0) < (fleet?.rentedScooters ?? 0) ? true : false;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        pt: "80px",
        px: 3,
        pb: 3,
        bgcolor: "background.default",
      }}
    >
      {(bikeTrigger || carTrigger || scooterTrigger) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Warning: </strong>Most, if not all of your {bikeTrigger ? (carTrigger ? (scooterTrigger ? "bikes, cars, and scooters" : "bikes and cars") : (scooterTrigger ? "bikes and scooters" : "bikes")) : carTrigger ? (scooterTrigger ? "cars and scooters" : "cars") : "scooters"} are currently rented out! Consider <a href="/provider/vehicles">adding more</a> to meet demand.
        </Alert>
      )}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            My Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor your fleet performance and revenue
          </Typography>
          {data?.generatedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Updated: {formatDateTime(data.generatedAt)}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (userId) {
                void dispatch(loadProviderAnalyticsSummary(userId));
              }
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {analytics.error || "Failed to load analytics"}
        </Alert>
      )}

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Revenue Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <MonetizationOnIcon color="success" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {formatCurrency(totalRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From all completed rentals
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <CheckCircleIcon color="info" />
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Rentals
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {completedRentals}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active now: {activeRentals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <AccessTimeIcon color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  Avg. Rental Duration
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {formatDuration(averageDuration)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all rentals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Breakdown */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Revenue by Vehicle Type
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DirectionsCarIcon fontSize="small" color="action" />
                      <Typography variant="body2">Cars</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(carRevenue)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={clampPercent(carRevenuePct * 100)}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PedalBikeIcon fontSize="small" color="success" />
                      <Typography variant="body2">Bikes</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(bikeRevenue)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="success"
                    variant="determinate"
                    value={clampPercent(bikeRevenuePct * 100)}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ElectricScooterIcon fontSize="small" color="warning" />
                      <Typography variant="body2">Scooters</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(scooterRevenue)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="warning"
                    variant="determinate"
                    value={clampPercent(scooterRevenuePct * 100)}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Fleet Efficiency
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Revenue per Vehicle
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCurrency(data?.efficiencyMetrics?.revenuePerVehicle ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total revenue ÷ fleet size
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg. Rentals per Vehicle
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {(data?.efficiencyMetrics?.averageRentalFrequencyPerVehicle ?? 0).toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Utilization metric
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Fleet Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <LocalParkingIcon color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Fleet Overview
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2">Total Vehicles</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {totalVehicles}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2" color="success.main">
                      Available
                    </Typography>
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {availableVehicles}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="success"
                    variant="determinate"
                    value={clampPercent(
                      totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 0,
                    )}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2" color="warning.main">
                      Rented
                    </Typography>
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {rentedVehicles}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="warning"
                    variant="determinate"
                    value={clampPercent(
                      totalVehicles > 0 ? (rentedVehicles / totalVehicles) * 100 : 0,
                    )}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Availability Rate */}
      <Grid container sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }} >
          <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Availability Rate
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={3} alignItems="center">
                <Typography variant="h2" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {availabilityRate.toFixed(1)}%
                </Typography>

                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={clampPercent(availabilityRate)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" align="center">
                  {availableVehicles} of {totalVehicles} vehicles available
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fleet Breakdown by Type */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Fleet Composition
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Available Cars
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {fleet?.availableCars ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rented: {fleet?.rentedCars ?? 0}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Available Bikes
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {fleet?.availableBikes ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rented: {fleet?.rentedBikes ?? 0}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Available Scooters
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {fleet?.availableScooters ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rented: {fleet?.rentedScooters ?? 0}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Section */}
      <Grid container sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Export Data
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const json = JSON.stringify(data, null, 2);
                    downloadFile(
                      `provider-analytics-${new Date().toISOString().split("T")[0]}.json`,
                      "application/json",
                      json,
                    );
                  }}
                  disabled={!data}
                >
                  Download JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const rows = [
                      {
                        "Total Revenue": formatCurrency(totalRevenue),
                        "Completed Rentals": completedRentals,
                        "Active Rentals": activeRentals,
                        "Average Duration": formatDuration(averageDuration),
                        "Total Vehicles": totalVehicles,
                        "Available Vehicles": availableVehicles,
                        "Rented Vehicles": rentedVehicles,
                        "Availability Rate %": availabilityRate.toFixed(1),
                        "Generated At": data?.generatedAt || new Date().toISOString(),
                      },
                    ];
                    const csv = toCsv(rows);
                    downloadFile(
                      `provider-analytics-${new Date().toISOString().split("T")[0]}.csv`,
                      "text/csv",
                      csv,
                    );
                  }}
                  disabled={!data}
                >
                  Download CSV
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Loading analytics...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
