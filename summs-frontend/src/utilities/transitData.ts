import type { TransitRouteResponse } from "../api/transit";

// Hard-coded sample transit route data for demonstration
export const SAMPLE_TRANSIT_ROUTES: TransitRouteResponse[] = [
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

export interface TransitServiceSummary {
  activeRoutes: number;
  delayedRoutes: number;
  averageDelayMinutes: number;
  averageCapacityPercent: number;
}

export function computeTransitServiceSummary(
  routes: TransitRouteResponse[]
): TransitServiceSummary {
  const activeRoutes = routes.filter((r) => r.isActive).length;

  let delayedRoutes = 0;
  let totalDelay = 0;
  let delayedCount = 0;
  let totalCapacity = 0;
  let capacityCount = 0;

  for (const route of routes) {
    if (route.isActive) {
      const delay = route.currentDelayMinutes ?? 0;
      if (delay > 0) {
        delayedRoutes++;
        totalDelay += delay;
        delayedCount++;
      }

      totalCapacity += route.currentCapacityPercent ?? 0;
      capacityCount++;
    }
  }

  const averageDelayMinutes = delayedCount === 0 ? 0 : totalDelay / delayedCount;
  const averageCapacityPercent = capacityCount === 0 ? 0 : totalCapacity / capacityCount;

  return {
    activeRoutes,
    delayedRoutes,
    averageDelayMinutes: Math.round(averageDelayMinutes * 10) / 10,
    averageCapacityPercent: Math.round(averageCapacityPercent * 10) / 10,
  };
}
