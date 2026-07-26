export const STORAGE_KEY = "wenzhe-academic-site-v2-content";

export const defaultSite = {
  name: "Wenzhe Xu",
  headline: "Hi, I’m Wenzhe Xu.",
  email: "wenzhexu19@gmail.com",
  github: "https://github.com/wenzhe9",
  linkedin: "https://www.linkedin.com/in/wz-xu/",
  contactVisibility: { email: true, github: true, linkedin: true },
  newsVisible: true,
  portrait: "/assets/wenzhe-xu.jpg",
  intro: [
    "I am a researcher interested in how people understand, use, and live with emerging technologies. My work brings together human–computer interaction, responsible innovation, and technology-mediated experiences.",
    "My current research focuses on designing thoughtful digital systems and studying their social impact. I am especially interested in work that turns careful observation into practical, human-centred design.",
    "I welcome conversations with prospective supervisors and collaborators working across design, computing, and interdisciplinary research.",
  ],
  news: [
    { date: "[07/26]", text: "New personal academic website structure launched locally." },
    { date: "[07/26]", text: "Project descriptions and images are ready to be replaced with final research materials." },
    { date: "[07/26]", text: "Curriculum vitae page prepared for the final PDF." },
  ],
  projects: Array.from({ length: 5 }, (_, index) => ({
    title: `Project ${String(index + 1).padStart(2, "0")} — Add project title`,
    period: "20XX – 20XX · Research project",
    summary: "Add a concise introduction to the research question, context, and your role in the project.",
    detail: "Use this paragraph for methods, collaborators, key findings, outputs, or the impact of the work. Keep each description focused so the image and text remain balanced.",
    link: "#",
    image: index === 0 ? "/assets/project-01.jpg" : "",
    pdfName: "",
  })),
  cvPdfName: "Default CV",
  design: { contentWidth: 1120, pageTop: 64, bodyFontSize: 21, sectionGap: 48 },
};

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
