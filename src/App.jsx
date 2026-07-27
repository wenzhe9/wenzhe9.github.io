import { useEffect, useState } from "react";
import { defaultSite, loadSite } from "./content.js";
import { getPdf } from "./pdf-store.js";
import { Admin } from "./Admin.jsx";
import { getAppPath, withBase } from "./paths.js";

const routes = [
  { label: "Home", href: "" },
  { label: "Project", href: "projects/" },
  { label: "CV", href: "cv/" },
];

function Header({ current, site }) {
  return (
    <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "#fbfbfa", borderBottom: "1px solid #d9dee1" }}>
      <a className="wordmark" href={withBase()}>{site?.name || "Wenzhe Xu"}</a>
      <nav aria-label="Main navigation">
        {routes.map((route) => (
          <a key={route.href} href={withBase(route.href)} aria-current={current === route.label ? "page" : undefined}>{route.label}</a>
        ))}
      </nav>
    </header>
  );
}

function Footer() { return <footer>Last updated: {import.meta.env.VITE_BUILD_DATE}</footer>; }

function Home({ site }) {
  const frameStyle = { width: `min(${site.design.contentWidth}px, calc(100% - 48px))` };
  const intro = Array.isArray(site.intro) ? site.intro : [];
  const news = Array.isArray(site.news) ? site.news : [];
  return (
    <div className="site-frame" style={frameStyle}>
      <Header current="Home" site={site} />
      <main className="home-page" style={{ paddingTop: site.design.pageTop }}>
        <section className="intro-grid">
          <div className="portrait-column"><img className="portrait" src={withBase(site.portrait)} alt={site.name} /></div>
          <div className="intro-copy">
            <h1>{site.headline}</h1>
            {intro.map((paragraph, index) => <p key={index} style={{ fontSize: site.design.bodyFontSize }}>{paragraph}</p>)}
            <div className="contact-links">
              {site.contactVisibility.email && <a href={`mailto:${site.email}`}>[email]</a>}
              {site.contactVisibility.github && <a href={site.github} target="_blank" rel="noreferrer">[github]</a>}
              {site.contactVisibility.linkedin && <a href={site.linkedin} target="_blank" rel="noreferrer">[linkedin]</a>}
            </div>
          </div>
        </section>
        {site.newsVisible && (
          <section className="news">
            <h2>news</h2>
            <ul>{news.map((item) => <li key={item.date + item.text}><strong>{item.date}</strong> {item.text}</li>)}</ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProjectImage({ index, src, alt }) {
  if (src) return <img className="project-image" src={withBase(src)} alt={alt} style={{ height: "auto", aspectRatio: "auto", objectFit: "contain" }} />;
  return <div className="project-image project-image-pending" role="img" aria-label={`${alt} image pending`}><span>PROJECT {String(index + 1).padStart(2, "0")}</span><small>Replace with your project image</small></div>;
}

function Projects({ site }) {
  const frameStyle = { width: `min(${Math.max(site.design.contentWidth, 1120)}px, calc(100% - 48px))` };
  const visibleProjects = site.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => project.visible !== false);
  return (
    <div className="site-frame project-frame" style={frameStyle}>
      <Header current="Project" site={site} />
      <main className="projects-page" style={{ paddingTop: site.design.pageTop }}>
        <div className="project-list">
          {visibleProjects.map(({ project, index }, visibleIndex) => (
            <article className="project" key={project.storageKey || project.title} style={{ marginBottom: site.design.sectionGap }}>
              <h2>{project.title}</h2>
              <div className="project-grid">
                <a href={withBase(`project/?id=${index}`)} aria-label={`Open ${project.title} details`} style={{ display: "block", color: "inherit", textDecoration: "none" }}><ProjectImage index={visibleIndex} src={project.image} alt={project.title} /></a>
                <div className="project-copy"><h3>{project.period}</h3><p>{project.summary}</p><p>{project.detail}</p><a href={withBase(`project/?id=${index}`)}>Project details</a></div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PdfDocument({ storageKey, fallback = "", title, emptyMessage = "No PDF has been uploaded yet.", useLocal = true, showOpenButton = false }) {
  const [url, setUrl] = useState(fallback);
  useEffect(() => {
    if (!useLocal) {
      setUrl(fallback);
      return undefined;
    }
    let objectUrl = "";
    getPdf(storageKey).then((file) => {
      if (file) { objectUrl = URL.createObjectURL(file); setUrl(objectUrl); }
    });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fallback, storageKey, useLocal]);
  if (!url) return <div className="pdf-empty" style={{ width: "min(1120px, 100%)", height: "100%", margin: "0 auto", padding: "72px", background: "#fff" }}><h1 style={{ marginTop: 0 }}>{title}</h1><p>{emptyMessage}</p><a href={withBase("admin/")}>Upload PDF in the visual editor</a></div>;
  return <>
    {showOpenButton && <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title} PDF in a new tab`} style={{ position: "absolute", top: 16, right: "max(24px, calc((100% - 1120px) / 2))", zIndex: 2, display: "inline-block", padding: "8px 12px", border: "1px solid #cfd4d7", background: "#fff", color: "#202632", fontFamily: "var(--sans)", fontSize: 13, textDecoration: "none" }}>Full-screen PDF ↗</a>}
    <object data={url} type="application/pdf" aria-label={title}><p><a href={url}>Open PDF</a></p></object>
  </>;
}

function CV({ site, useLocalPdf }) {
  const fallback = site.cvPdfPath ? withBase(site.cvPdfPath) : "";
  return <div className="cv-page" style={{ background: "#fbfbfa" }}><div className="site-frame cv-header-frame" style={{ position: "sticky", top: 0, zIndex: 50, background: "#fbfbfa" }}><Header current="CV" site={site} /></div><main className="pdf-shell" style={{ height: "calc(clamp(420px, 70.7vw, 792px) + 88px)", paddingTop: 32 }}><PdfDocument storageKey="cv" fallback={fallback} title="Wenzhe Xu CV" useLocal={useLocalPdf} /></main><div className="site-frame cv-footer-frame"><Footer /></div></div>;
}

function ProjectPdf({ site, useLocalPdf }) {
  const id = Math.max(0, Math.min(site.projects.length - 1, Number(new URLSearchParams(window.location.search).get("id")) || 0));
  const project = site.projects[id];
  if (!project || project.visible === false) {
    return <div className="cv-page" style={{ background: "#fbfbfa" }}><div className="site-frame cv-header-frame"><Header current="Project" site={site} /></div><main className="site-frame projects-page"><h1>Project unavailable</h1><p>This project is currently hidden.</p><a href={withBase("projects/")}>← Back to projects</a></main></div>;
  }
  const fallback = project.pdfPath ? withBase(project.pdfPath) : "";
  return <div className="cv-page" style={{ background: "#fbfbfa" }}><div className="site-frame cv-header-frame" style={{ position: "sticky", top: 0, zIndex: 50, background: "#fbfbfa" }}><Header current="Project" site={site} /></div><main className="pdf-shell" style={{ paddingTop: 64, position: "relative" }}><a href={withBase("projects/")} style={{ position: "absolute", top: 16, left: "max(24px, calc((100% - 1120px) / 2))", display: "inline-block", padding: "8px 12px", border: "1px solid #cfd4d7", background: "#fff", color: "#202632", fontFamily: "var(--sans)", fontSize: 13, textDecoration: "none" }}>← Back to projects</a><PdfDocument storageKey={project.storageKey || `project-${id}`} fallback={fallback} title={project.title} emptyMessage="No PDF has been uploaded for this project yet." useLocal={useLocalPdf} showOpenButton /></main><div className="site-frame cv-footer-frame"><Footer /></div></div>;
}

function PublicSite({ path }) {
  const isHostedSite = window.location.hostname.endsWith("github.io");
  const useLocalDraft = !isHostedSite || new URLSearchParams(window.location.search).has("edit");
  const [site, setSite] = useState(() => useLocalDraft ? loadSite() : defaultSite);

  useEffect(() => {
    if (useLocalDraft) {
      setSite(loadSite());
      return undefined;
    }

    let cancelled = false;
    fetch(`${withBase("site-content.json")}?v=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load site content (${response.status})`);
        return response.json();
      })
      .then((content) => { if (!cancelled) setSite(content); })
      .catch(() => { if (!cancelled) setSite(defaultSite); });
    return () => { cancelled = true; };
  }, [useLocalDraft]);

  if (path.startsWith("/projects")) return <Projects site={site} />;
  if (path.startsWith("/project/")) return <ProjectPdf site={site} useLocalPdf={useLocalDraft} />;
  if (path.startsWith("/cv")) return <CV site={site} useLocalPdf={useLocalDraft} />;
  return <Home site={site} />;
}

export function App() {
  const path = getAppPath();
  if (path.startsWith("/admin")) return <Admin />;
  return <PublicSite path={path} />;
}
