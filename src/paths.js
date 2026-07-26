export const BASE_URL = import.meta.env.BASE_URL;

export function withBase(path = "") {
  if (/^(?:[a-z]+:|#)/i.test(path)) return path;
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}

export function getAppPath(pathname = window.location.pathname) {
  const basePath = new URL(BASE_URL, window.location.origin).pathname;
  const relativePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname.replace(/^\/+/, "");
  return `/${relativePath}`;
}
