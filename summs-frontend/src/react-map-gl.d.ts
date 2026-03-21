declare module "react-map-gl/mapbox" {
  import type { CSSProperties, ReactNode } from "react";

  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  }

  export interface MapProps {
    initialViewState?: ViewState;
    style?: CSSProperties;
    mapStyle?: string;
    mapboxAccessToken?: string;
    children?: ReactNode;
    onClick?: (event: MapLayerMouseEvent) => void;
  }

  export interface MapLayerMouseEvent {
    lngLat: { lng: number; lat: number };
    originalEvent: MouseEvent;
  }

  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    onClick?: (event: { originalEvent: MouseEvent }) => void;
    children?: ReactNode;
  }

  export interface PopupProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    onClose?: () => void;
    closeOnClick?: boolean;
    children?: ReactNode;
  }

  export default function Map(props: MapProps): JSX.Element;
  export function Marker(props: MarkerProps): JSX.Element;
  export function Popup(props: PopupProps): JSX.Element;
}
