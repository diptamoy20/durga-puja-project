/// <reference types="vite/client" />

/**
 * Declaring the variables the app reads turns a typo in `import.meta.env` into
 * a compile error, instead of the `any` that Vite's default index signature
 * would hand back.
 */
interface ImportMetaEnv {
  /** API Gateway base URL. The only backend address the browser knows. */
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'leaflet' {
  const L: any;
  export default L;
  export type Map = any;
  export type Marker = any;
  export type LatLngExpression = any;
  export type MarkerClusterGroup = any;
  export type Icon = any;
  export type DivIcon = any;
}
declare module 'leaflet.markercluster';

declare namespace L {
  type Map = any;
  type Marker = any;
  type MarkerClusterGroup = any;
  type LatLngExpression = any;
  type Icon = any;
  type DivIcon = any;
}



