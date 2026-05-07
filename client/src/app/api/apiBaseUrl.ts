const defaultApiBaseUrl = "http://localhost:8081/api";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl;

const apiBaseUrl = configuredApiBaseUrl.endsWith("/")
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/`;

export default apiBaseUrl;
