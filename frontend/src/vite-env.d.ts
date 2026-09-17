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
