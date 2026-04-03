import { describe, expect, it, vi } from "vitest";
import {
  AdminFluxContext,
  RentalServiceAnalytics,
  CityAnalytics,
  ExportAnalytics,
  GatewayAnalytics,
  createAnalyticsState,
} from "./flux";
import type {
  AdminAnalyticsFluxDeps,
  AdminAnalyticsFluxSnapshot,
  AdminFluxState,
} from "./flux";

function createMockDeps(): AdminAnalyticsFluxDeps {
  return {
    dispatchLoad: vi.fn(),
    navigate: vi.fn(),
    render: {
      rentalServiceAnalytics: vi.fn(() => "rental-ui"),
      cityAnalytics: vi.fn(() => "city-ui"),
      exportAnalytics: vi.fn(() => "export-ui"),
      gatewayAnalytics: vi.fn(() => "gateway-ui"),
    },
  };
}

function createMockSnapshot(): AdminAnalyticsFluxSnapshot {
  return { status: "idle", error: null, data: null };
}

function createContext(overrides?: {
  deps?: AdminAnalyticsFluxDeps;
  snapshot?: AdminAnalyticsFluxSnapshot;
}) {
  const deps = overrides?.deps ?? createMockDeps();
  const snapshot = overrides?.snapshot ?? createMockSnapshot();
  const setReactState = vi.fn();
  const getSnapshot = vi.fn(() => snapshot);

  const initialState: AdminFluxState = {
    handleAction: vi.fn(),
    renderUI: vi.fn(),
  };

  const ctx = new AdminFluxContext({
    initialState,
    setReactState,
    deps,
    getSnapshot,
  });

  return { ctx, setReactState, getSnapshot, initialState, deps };
}

describe("AdminFluxContext", () => {
  it("stores and returns currentState", () => {
    const { ctx, initialState } = createContext();
    expect(ctx.currentState).toBe(initialState);
  });

  it("calls setReactState when setState is called", () => {
    const { ctx, setReactState } = createContext();
    const newState: AdminFluxState = {
      handleAction: vi.fn(),
      renderUI: vi.fn(),
    };

    ctx.setState(newState);

    expect(ctx.currentState).toBe(newState);
    expect(setReactState).toHaveBeenCalledWith(newState);
  });

  it("delegates handleAction to currentState", () => {
    const { ctx, initialState } = createContext();

    ctx.handleAction({ type: "LOAD" });

    expect(initialState.handleAction).toHaveBeenCalledWith({ type: "LOAD" });
  });

  it("returns snapshot from getter", () => {
    const snapshot = createMockSnapshot();
    const { ctx } = createContext({ snapshot });

    expect(ctx.snapshot).toEqual(snapshot);
  });

  it("allows updating snapshot getter via setSnapshotGetter", () => {
    const { ctx } = createContext();
    const newSnapshot: AdminAnalyticsFluxSnapshot = {
      status: "succeeded",
      error: null,
      data: null,
    };

    ctx.setSnapshotGetter(() => newSnapshot);

    expect(ctx.snapshot).toEqual(newSnapshot);
  });

  it("exposes deps", () => {
    const deps = createMockDeps();
    const { ctx } = createContext({ deps });

    expect(ctx.deps).toBe(deps);
  });
});

describe("Analytics handleAction", () => {
  function createAnalyticsContext() {
    const deps = createMockDeps();
    const { ctx, setReactState } = createContext({ deps });
    const analytics = new RentalServiceAnalytics(ctx);
    ctx.setState(analytics);
    return { ctx, analytics, deps, setReactState };
  }

  it("calls dispatchLoad on LOAD action", () => {
    const { analytics, deps } = createAnalyticsContext();
    analytics.handleAction({ type: "LOAD" });
    expect(deps.dispatchLoad).toHaveBeenCalled();
  });

  it("calls dispatchLoad on REFRESH action", () => {
    const { analytics, deps } = createAnalyticsContext();
    analytics.handleAction({ type: "REFRESH" });
    expect(deps.dispatchLoad).toHaveBeenCalled();
  });

  it("calls dispatchLoad on RETRY action", () => {
    const { analytics, deps } = createAnalyticsContext();
    analytics.handleAction({ type: "RETRY" });
    expect(deps.dispatchLoad).toHaveBeenCalled();
  });

  it("calls navigate with target on NAVIGATE action", () => {
    const { analytics, deps } = createAnalyticsContext();
    analytics.handleAction({ type: "NAVIGATE", to: "/admin/stations" });
    expect(deps.navigate).toHaveBeenCalledWith("/admin/stations");
  });

  it("transitions state on SET_ANALYTICS action", () => {
    const { analytics, setReactState } = createAnalyticsContext();
    analytics.handleAction({
      type: "SET_ANALYTICS",
      analytics: "cityAnalytics",
    });

    const newState = setReactState.mock.calls.at(-1)?.[0];
    expect(newState).toBeInstanceOf(CityAnalytics);
  });
});

describe("createAnalyticsState", () => {
  it("returns RentalServiceAnalytics for rentalServiceAnalytics", () => {
    const { ctx } = createContext();
    expect(createAnalyticsState("rentalServiceAnalytics", ctx)).toBeInstanceOf(
      RentalServiceAnalytics,
    );
  });

  it("returns CityAnalytics for cityAnalytics", () => {
    const { ctx } = createContext();
    expect(createAnalyticsState("cityAnalytics", ctx)).toBeInstanceOf(
      CityAnalytics,
    );
  });

  it("returns ExportAnalytics for exportAnalytics", () => {
    const { ctx } = createContext();
    expect(createAnalyticsState("exportAnalytics", ctx)).toBeInstanceOf(
      ExportAnalytics,
    );
  });

  it("returns GatewayAnalytics for gatewayAnalytics", () => {
    const { ctx } = createContext();
    expect(createAnalyticsState("gatewayAnalytics", ctx)).toBeInstanceOf(
      GatewayAnalytics,
    );
  });
});

describe("concrete Analytics subclasses renderUI", () => {
  it("RentalServiceAnalytics calls render.rentalServiceAnalytics", () => {
    const deps = createMockDeps();
    const { ctx } = createContext({ deps });
    const analytics = new RentalServiceAnalytics(ctx);

    const result = analytics.renderUI();

    expect(deps.render.rentalServiceAnalytics).toHaveBeenCalled();
    expect(result).toBe("rental-ui");
  });

  it("CityAnalytics calls render.cityAnalytics", () => {
    const deps = createMockDeps();
    const { ctx } = createContext({ deps });
    const analytics = new CityAnalytics(ctx);

    const result = analytics.renderUI();

    expect(deps.render.cityAnalytics).toHaveBeenCalled();
    expect(result).toBe("city-ui");
  });

  it("ExportAnalytics calls render.exportAnalytics", () => {
    const deps = createMockDeps();
    const { ctx } = createContext({ deps });
    const analytics = new ExportAnalytics(ctx);

    const result = analytics.renderUI();

    expect(deps.render.exportAnalytics).toHaveBeenCalled();
    expect(result).toBe("export-ui");
  });

  it("GatewayAnalytics calls render.gatewayAnalytics", () => {
    const deps = createMockDeps();
    const { ctx } = createContext({ deps });
    const analytics = new GatewayAnalytics(ctx);

    const result = analytics.renderUI();

    expect(deps.render.gatewayAnalytics).toHaveBeenCalled();
    expect(result).toBe("gateway-ui");
  });
});
