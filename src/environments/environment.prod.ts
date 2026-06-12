export const environment = {
  production: true,
  // Set via CI/CD pipeline — never commit real URL here
  apiBaseUrl: (window as Window & { __API_BASE_URL__?: string }).__API_BASE_URL__ ?? ''
};
