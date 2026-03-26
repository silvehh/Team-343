import * as React from "react";

import type { AdminAnalyticsSummaryResponse } from "../api/admin_analytics";

export type AdminAnalyticsAction =
  | { type: "LOAD" }
  | { type: "REFRESH" }
  | { type: "RETRY" }
  | {
      type: "SET_ANALYTICS";
      analytics:
        | "rentalServiceAnalytics"
        | "cityAnalytics"
        | "exportAnalytics"
        | "gatewayAnalytics";
    }
  | { type: "NAVIGATE"; to: string };

export interface AdminAnalyticsFluxDeps {
  dispatchLoad: () => void;
  navigate: (to: string) => void;
  render: {
    rentalServiceAnalytics: () => React.ReactNode;
    cityAnalytics: () => React.ReactNode;
    exportAnalytics: () => React.ReactNode;
    gatewayAnalytics: () => React.ReactNode;
  };
}

export interface AdminAnalyticsFluxSnapshot {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  data: AdminAnalyticsSummaryResponse | null;
}

export interface AdminFluxState {
  handleAction(action: AdminAnalyticsAction): void;
  renderUI(): React.ReactNode;
}

export class AdminFluxContext {
  private _currentState: AdminFluxState;
  private readonly _setReactState: (s: AdminFluxState) => void;
  private readonly _deps: AdminAnalyticsFluxDeps;
  private _getSnapshot: () => AdminAnalyticsFluxSnapshot;

  constructor(opts: {
    initialState: AdminFluxState;
    setReactState: (s: AdminFluxState) => void;
    deps: AdminAnalyticsFluxDeps;
    getSnapshot: () => AdminAnalyticsFluxSnapshot;
  }) {
    this._currentState = opts.initialState;
    this._setReactState = opts.setReactState;
    this._deps = opts.deps;
    this._getSnapshot = opts.getSnapshot;
  }

  get currentState(): AdminFluxState {
    return this._currentState;
  }

  setSnapshotGetter(getter: () => AdminAnalyticsFluxSnapshot) {
    this._getSnapshot = getter;
  }

  get snapshot(): AdminAnalyticsFluxSnapshot {
    return this._getSnapshot();
  }

  get deps(): AdminAnalyticsFluxDeps {
    return this._deps;
  }

  setState(next: AdminFluxState) {
    this._currentState = next;
    this._setReactState(next);
  }

  handleAction(action: AdminAnalyticsAction) {
    this._currentState.handleAction(action);
  }
}

export abstract class Analytics implements AdminFluxState {
  protected readonly ctx: AdminFluxContext;

  constructor(ctx: AdminFluxContext) {
    this.ctx = ctx;
  }

  handleAction(action: AdminAnalyticsAction): void {
    if (
      action.type === "REFRESH" ||
      action.type === "RETRY" ||
      action.type === "LOAD"
    ) {
      this.ctx.deps.dispatchLoad();
      return;
    }
    if (action.type === "NAVIGATE") {
      this.ctx.deps.navigate(action.to);
      return;
    }
    if (action.type === "SET_ANALYTICS") {
      this.ctx.setState(createAnalyticsState(action.analytics, this.ctx));
    }
  }

  abstract renderUI(): React.ReactNode;
}

export class RentalServiceAnalytics extends Analytics {
  renderUI(): React.ReactNode {
    return this.ctx.deps.render.rentalServiceAnalytics();
  }
}

export class CityAnalytics extends Analytics {
  renderUI(): React.ReactNode {
    return this.ctx.deps.render.cityAnalytics();
  }
}

export class ExportAnalytics extends Analytics {
  renderUI(): React.ReactNode {
    return this.ctx.deps.render.exportAnalytics();
  }
}

export class GatewayAnalytics extends Analytics {
  renderUI(): React.ReactNode {
    return this.ctx.deps.render.gatewayAnalytics();
  }
}

export function createAnalyticsState(
  key:
    | "rentalServiceAnalytics"
    | "cityAnalytics"
    | "exportAnalytics"
    | "gatewayAnalytics",
  ctx: AdminFluxContext,
): Analytics {
  switch (key) {
    case "rentalServiceAnalytics":
      return new RentalServiceAnalytics(ctx);
    case "cityAnalytics":
      return new CityAnalytics(ctx);
    case "exportAnalytics":
      return new ExportAnalytics(ctx);
    case "gatewayAnalytics":
      return new GatewayAnalytics(ctx);
  }
}
