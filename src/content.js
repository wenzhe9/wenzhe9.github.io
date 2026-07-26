import defaultSiteData from "./default-site.json";

export const STORAGE_KEY = "wenzhe-academic-site-v2-content";

export const defaultSite = defaultSiteData;

export function loadSite() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return defaultSite;
    const intro = Array.isArray(saved.intro) && saved.intro.every((item) => typeof item === "string")
      ? saved.intro
      : defaultSite.intro;
    const news = Array.isArray(saved.news) && saved.news.every((item) => item && typeof item.date === "string" && typeof item.text === "string")
      ? saved.news
      : defaultSite.news;
    return {
      ...defaultSite,
      ...saved,
      name: typeof saved.name === "string" && saved.name ? saved.name : defaultSite.name,
      headline: typeof saved.headline === "string" && saved.headline ? saved.headline : defaultSite.headline,
      portrait: typeof saved.portrait === "string" && saved.portrait ? saved.portrait : defaultSite.portrait,
      contactVisibility: { ...defaultSite.contactVisibility, ...saved.contactVisibility },
      newsVisible: typeof saved.newsVisible === "boolean" ? saved.newsVisible : defaultSite.newsVisible,
      intro,
      design: { ...defaultSite.design, ...saved.design },
      news,
      projects: defaultSite.projects.map((project, index) => ({ ...project, ...(saved.projects?.[index] || {}) })),
    };
  } catch {
    return defaultSite;
  }
}

export function saveSite(content) { localStorage.setItem(STORAGE_KEY, JSON.stringify(content)); }
