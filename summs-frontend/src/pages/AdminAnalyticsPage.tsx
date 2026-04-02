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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupsIcon from "@mui/icons-material/Groups";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DirectionsTransitIcon from "@mui/icons-material/DirectionsTransit";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import type { RootState, AppDispatch } from "../store/store";
import { loadAdminAnalyticsSummary } from "../store/adminAnalyticsSlice";
import {
  AdminFluxContext,
  CityAnalytics,
  ExportAnalytics,
  GatewayAnalytics,
  RentalServiceAnalytics,
  createAnalyticsState,
  type AdminFluxState,
} from "../admin-analytics/flux";
import { SAMPLE_PARKING_SPOTS, computeParkingUtilizationByCity } from "../utilities/parkingData";
import {
  SAMPLE_TRANSIT_ROUTES,
  computeTransitServiceSummary,
  computeAverageReliabilityScore,
  computeRoutesByTransitType,
  computeHighFrequencyRouteCount,
} from "../utilities/transitData";

function formatRatio(r: number) {
  if (!Number.isFinite(r)) return "-";
  if (r === 0) return "0";
  return r.toFixed(2);
}

function clampPercent(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, accountType } = useSelector(
    (s: RootState) => s.auth,
  );
  const analytics = useSelector((s: RootState) => s.adminAnalytics);

  const isAdmin = isAuthenticated && accountType === "ADMIN";

  const snapshotRef = React.useRef({
    status: analytics.status,
    error: analytics.error,
    data: analytics.data,
  });
  snapshotRef.current = {
    status: analytics.status,
    error: analytics.error,
    data: analytics.data,
  };

  const renderRef = React.useRef({
    rentalServiceAnalytics: () => null as React.ReactNode,
    cityAnalytics: () => null as React.ReactNode,
    exportAnalytics: () => null as React.ReactNode,
    gatewayAnalytics: () => null as React.ReactNode,
  });

  const [fluxState, setFluxState] = React.useState<AdminFluxState>(() => ({
    handleAction: () => undefined,
    renderUI: () => null,
  }));

  const fluxRef = React.useRef<AdminFluxContext | null>(null);
  if (!fluxRef.current) {
    fluxRef.current = new AdminFluxContext({
      initialState: fluxState,
      setReactState: setFluxState,
      deps: {
        dispatchLoad: () => {
          void dispatch(loadAdminAnalyticsSummary());
        },
        navigate: (to) => navigate(to),
        render: {
          rentalServiceAnalytics: () =>
            renderRef.current.rentalServiceAnalytics(),
          cityAnalytics: () => renderRef.current.cityAnalytics(),
          exportAnalytics: () => renderRef.current.exportAnalytics(),
          gatewayAnalytics: () => renderRef.current.gatewayAnalytics(),
        },
      },
      getSnapshot: () => snapshotRef.current,
    });

    // Default analytics view (state pattern).
    fluxRef.current.setState(
      createAnalyticsState("rentalServiceAnalytics", fluxRef.current),
    );
  }
  const flux = fluxRef.current;
  flux.setSnapshotGetter(() => snapshotRef.current);

  React.useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    if (analytics.status === "idle") {
      flux.handleAction({ type: "LOAD" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const data = analytics.data;
  const vehicleUsage = data?.rentalVehicleUsage;

  const totalUsage =
    (vehicleUsage?.cars ?? 0) +
    (vehicleUsage?.bikes ?? 0) +
    (vehicleUsage?.scooters ?? 0);

  const bikesPct = totalUsage > 0 ? (vehicleUsage?.bikes ?? 0) / totalUsage : 0;
  const carsPct = totalUsage > 0 ? (vehicleUsage?.cars ?? 0) / totalUsage : 0;
  const scootersPct =
    totalUsage > 0 ? (vehicleUsage?.scooters ?? 0) / totalUsage : 0;

  const parkingUtilization = computeParkingUtilizationByCity(SAMPLE_PARKING_SPOTS);
  const transitSummary = computeTransitServiceSummary(SAMPLE_TRANSIT_ROUTES);
  const averageReliability = computeAverageReliabilityScore(SAMPLE_TRANSIT_ROUTES);
  const routesByType = computeRoutesByTransitType(SAMPLE_TRANSIT_ROUTES);
  const highFrequencyRoutes = computeHighFrequencyRouteCount(SAMPLE_TRANSIT_ROUTES);

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

  // These renderers are read by the state-pattern context (via renderRef).
  renderRef.current.rentalServiceAnalytics = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <GroupsIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Registered Users
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {data?.totalRegisteredUsers ?? "-"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <DoneAllIcon color="success" />
              <Typography variant="subtitle2" color="text.secondary">
                Completed Trips
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {data?.completedTrips ?? "-"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <CompareArrowsIcon color="secondary" />
              <Typography variant="subtitle2" color="text.secondary">
                Bike vs Scooter Usage
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {data?.bikeToScooterUsageRatio != null
                ? formatRatio(data.bikeToScooterUsageRatio)
                : "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ratio (bike rentals / scooter rentals)
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Total Rentals Counted
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {totalUsage}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cars: {vehicleUsage?.cars ?? 0} · Bikes:{" "}
              {vehicleUsage?.bikes ?? 0} · Scooters:{" "}
              {vehicleUsage?.scooters ?? 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Rental Vehicle Usage (Cars / Bikes / Scooters)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2">Cars</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicleUsage?.cars ?? 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={clampPercent(carsPct * 100)}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2">Bikes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicleUsage?.bikes ?? 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  color="success"
                  variant="determinate"
                  value={clampPercent(bikesPct * 100)}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2">Scooters</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicleUsage?.scooters ?? 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  color="warning"
                  variant="determinate"
                  value={clampPercent(scootersPct * 100)}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  renderRef.current.gatewayAnalytics = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <DirectionsTransitIcon color="info" />
              <Typography variant="subtitle2" color="text.secondary">
                Delayed Routes
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {transitSummary.delayedRoutes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg delay: {`${transitSummary.averageDelayMinutes} min`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <DoneAllIcon color="success" />
              <Typography variant="subtitle2" color="text.secondary">
                Reliability Score
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {averageReliability}
              <Typography variant="caption" sx={{ ml: 0.5 }}>%</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Network average
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <CompareArrowsIcon color="secondary" />
              <Typography variant="subtitle2" color="text.secondary">
                Active Routes
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {transitSummary.activeRoutes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High-frequency: {highFrequencyRoutes}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Routes by Type
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🚌 Bus: {routesByType.BUS}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🚇 Metro: {routesByType.METRO}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🚄 REM: {routesByType.REM}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              🚂 Train: {routesByType.TRAIN}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Transit Service Level
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Total capacity (avg)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      color="info"
                      variant="determinate"
                      value={clampPercent(transitSummary.averageCapacityPercent)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ width: 64, textAlign: "right" }}
                  >
                    {`${clampPercent(transitSummary.averageCapacityPercent).toFixed(0)}%`}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  renderRef.current.cityAnalytics = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Active Rentals by City
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>City</TableCell>
                    <TableCell align="right">Active rentals</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.activeRentalsByCity ?? [])
                    .slice(0, 10)
                    .map((row, idx) => (
                      <TableRow key={`${row.city ?? "city"}-${idx}`}>
                        <TableCell>{row.city ?? "Unknown"}</TableCell>
                        <TableCell align="right">{row.count ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  {(data?.activeRentalsByCity?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No active rentals
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

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
                Parking Utilization by City
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>City</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                    <TableCell align="right">Available / Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parkingUtilization
                    .slice(0, 10)
                    .map((row, idx) => (
                      <TableRow key={`${row.city ?? "city"}-${idx}`}>
                        <TableCell>{row.city ?? "Unknown"}</TableCell>
                        <TableCell align="right">
                          {row.utilizationPercent != null
                            ? `${row.utilizationPercent.toFixed(1)}%`
                            : "0%"}
                        </TableCell>
                        <TableCell align="right">
                          {row.availableSpots ?? 0}/{row.totalSpots ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  {parkingUtilization.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No parking data
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  renderRef.current.exportAnalytics = () => {
    // Build comprehensive export object with all analytics
    const comprehensiveAnalytics = {
      apiData: data,
      computedAnalytics: {
        rentalVehicles: {
          cars: vehicleUsage?.cars ?? 0,
          bikes: vehicleUsage?.bikes ?? 0,
          scooters: vehicleUsage?.scooters ?? 0,
          total: totalUsage,
          distribution: {
            carsPercent: carsPct * 100,
            bikesPercent: bikesPct * 100,
            scootersPercent: scootersPct * 100,
          },
        },
        transitGateway: {
          delayedRoutes: transitSummary.delayedRoutes,
          averageDelayMinutes: transitSummary.averageDelayMinutes,
          activeRoutes: transitSummary.activeRoutes,
          averageCapacityPercent: transitSummary.averageCapacityPercent,
          averageReliabilityScore: averageReliability,
          highFrequencyRoutes: highFrequencyRoutes,
          routesByType: routesByType,
        },
        parking: {
          byCity: parkingUtilization,
        },
      },
    };

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                JSON Export
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Complete analytics snapshot including all computed metrics.
              </Typography>
              <Button
                variant="contained"
                disabled={!data}
                fullWidth
                onClick={() => {
                  downloadFile(
                    `admin-analytics-complete-${new Date().toISOString()}.json`,
                    "application/json",
                    JSON.stringify(comprehensiveAnalytics, null, 2),
                  );
                }}
              >
                Download Complete JSON
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                CSV Exports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export specific analytics as CSV files.
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  disabled={!data}
                  size="small"
                  onClick={() => {
                    if (!data) return;
                    const rows = (data.activeRentalsByCity ?? []).map((r) => ({
                      city: r.city ?? "Unknown",
                      activeRentals: r.count ?? 0,
                    }));
                    downloadFile(
                      `active-rentals-by-city-${new Date().toISOString()}.csv`,
                      "text/csv",
                      toCsv(rows),
                    );
                  }}
                >
                  Active Rentals by City
                </Button>

                <Button
                  variant="outlined"
                  disabled={parkingUtilization.length === 0}
                  size="small"
                  onClick={() => {
                    if (parkingUtilization.length === 0) return;
                    const rows = parkingUtilization.map((r) => ({
                      city: r.city ?? "Unknown",
                      utilizationPercent: r.utilizationPercent ?? 0,
                      availableSpots: r.availableSpots ?? 0,
                      totalSpots: r.totalSpots ?? 0,
                    }));
                    downloadFile(
                      `parking-utilization-by-city-${new Date().toISOString()}.csv`,
                      "text/csv",
                      toCsv(rows),
                    );
                  }}
                >
                  Parking Utilization by City
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const rows = [
                      {
                        metric: "Total Registered Users",
                        value: data?.totalRegisteredUsers ?? 0,
                      },
                      {
                        metric: "Completed Trips",
                        value: data?.completedTrips ?? 0,
                      },
                      {
                        metric: "Bike to Scooter Ratio",
                        value: data?.bikeToScooterUsageRatio ?? 0,
                      },
                      {
                        metric: "Total Vehicle Rentals",
                        value: totalUsage,
                      },
                      {
                        metric: "Vehicle: Cars",
                        value: vehicleUsage?.cars ?? 0,
                      },
                      {
                        metric: "Vehicle: Bikes",
                        value: vehicleUsage?.bikes ?? 0,
                      },
                      {
                        metric: "Vehicle: Scooters",
                        value: vehicleUsage?.scooters ?? 0,
                      },
                      {
                        metric: "Active Transit Routes",
                        value: transitSummary.activeRoutes,
                      },
                      {
                        metric: "Delayed Transit Routes",
                        value: transitSummary.delayedRoutes,
                      },
                      {
                        metric: "Average Transit Delay (min)",
                        value: transitSummary.averageDelayMinutes,
                      },
                      {
                        metric: "Average Transit Capacity %",
                        value: transitSummary.averageCapacityPercent,
                      },
                      {
                        metric: "Average Transit Reliability %",
                        value: averageReliability,
                      },
                      {
                        metric: "High-Frequency Routes",
                        value: highFrequencyRoutes,
                      },
                      {
                        metric: "Bus Routes",
                        value: routesByType.BUS,
                      },
                      {
                        metric: "Metro Routes",
                        value: routesByType.METRO,
                      },
                      {
                        metric: "REM Routes",
                        value: routesByType.REM,
                      },
                      {
                        metric: "Train Routes",
                        value: routesByType.TRAIN,
                      },
                    ];
                    downloadFile(
                      `analytics-summary-${new Date().toISOString()}.csv`,
                      "text/csv",
                      toCsv(rows),
                    );
                  }}
                >
                  All Metrics Summary
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const rows = [
                      {
                        category: "Transit",
                        metric: "Active Routes",
                        value: transitSummary.activeRoutes,
                      },
                      {
                        category: "Transit",
                        metric: "Delayed Routes",
                        value: transitSummary.delayedRoutes,
                      },
                      {
                        category: "Transit",
                        metric: "Avg Delay (min)",
                        value: transitSummary.averageDelayMinutes,
                      },
                      {
                        category: "Transit",
                        metric: "Avg Capacity %",
                        value: transitSummary.averageCapacityPercent,
                      },
                      {
                        category: "Transit",
                        metric: "Avg Reliability %",
                        value: averageReliability,
                      },
                      {
                        category: "Transit",
                        metric: "High-Freq Routes",
                        value: highFrequencyRoutes,
                      },
                      {
                        category: "Routes by Type",
                        metric: "Bus",
                        value: routesByType.BUS,
                      },
                      {
                        category: "Routes by Type",
                        metric: "Metro",
                        value: routesByType.METRO,
                      },
                      {
                        category: "Routes by Type",
                        metric: "REM",
                        value: routesByType.REM,
                      },
                      {
                        category: "Routes by Type",
                        metric: "Train",
                        value: routesByType.TRAIN,
                      },
                      {
                        category: "Rentals",
                        metric: "Cars",
                        value: vehicleUsage?.cars ?? 0,
                      },
                      {
                        category: "Rentals",
                        metric: "Bikes",
                        value: vehicleUsage?.bikes ?? 0,
                      },
                      {
                        category: "Rentals",
                        metric: "Scooters",
                        value: vehicleUsage?.scooters ?? 0,
                      },
                    ];
                    downloadFile(
                      `gateway-transit-analytics-${new Date().toISOString()}.csv`,
                      "text/csv",
                      toCsv(rows),
                    );
                  }}
                >
                  Gateway & Transit Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                What's Included
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>JSON Export:</strong> Complete snapshot including API data
                and all computed analytics (rentals, transit gateway, parking).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>CSV Exports:</strong> Active rentals by city, parking
                utilization by city, comprehensive metrics summary, and gateway
                transit analytics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const selectedTab =
    flux.currentState instanceof CityAnalytics
      ? "cityAnalytics"
      : flux.currentState instanceof ExportAnalytics
        ? "exportAnalytics"
        : flux.currentState instanceof GatewayAnalytics
          ? "gatewayAnalytics"
          : flux.currentState instanceof RentalServiceAnalytics
            ? "rentalServiceAnalytics"
            : "rentalServiceAnalytics";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        pt: "80px",
        px: 3,
        bgcolor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Admin Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System usage and service health overview
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => flux.handleAction({ type: "REFRESH" })}
            disabled={analytics.status === "loading"}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Tabs
        value={selectedTab}
        onChange={(_, next) =>
          flux.handleAction({
            type: "SET_ANALYTICS",
            analytics: next as
              | "rentalServiceAnalytics"
              | "cityAnalytics"
              | "gatewayAnalytics"
              | "exportAnalytics",
          })
        }
        sx={{ mb: 2 }}
      >
        <Tab label="Rental Service" value="rentalServiceAnalytics" />
        <Tab label="City" value="cityAnalytics" />
        <Tab label="Gateway" value="gatewayAnalytics" />
        <Tab label="Export" value="exportAnalytics" />
      </Tabs>

      {analytics.status === "loading" && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {analytics.status === "failed" && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => flux.handleAction({ type: "RETRY" })}
            >
              Retry
            </Button>
          }
        >
          {analytics.error ?? "Failed to load analytics"}
        </Alert>
      )}

      {flux.currentState.renderUI()}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Generated at: {data?.generatedAt ?? "-"}
        </Typography>
      </Box>
    </Box>
  );
}
