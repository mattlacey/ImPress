// Configuration for GitHub Pages deployment
// This handles both root domain and subdirectory deployments

const isGitHubPages = window.location.hostname.includes('github.io');
const pathPrefix = isGitHubPages && window.location.pathname.split('/')[1]
    ? '/' + window.location.pathname.split('/')[1]
    : '';

// Export for use in service worker registration
window.APP_CONFIG = {
    basePath: pathPrefix || '',
    isGitHubPages: isGitHubPages
};