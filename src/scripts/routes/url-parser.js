// src/scripts/routes/url-parser.js
function extractPathnameSegments(path) {
  // Remove query parameters before splitting
  const pathWithoutQuery = path.split('?')[0];
  const splitUrl = pathWithoutQuery.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
    fullPath: path // Keep original path for query params
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  // Handle root path
  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

// NEW: Function to get query parameters
export function getQueryParams() {
  const pathname = getActivePathname();
  const queryString = pathname.split('?')[1];
  
  if (!queryString) return {};
  
  return Object.fromEntries(
    new URLSearchParams(queryString)
  );
}