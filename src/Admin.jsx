import { useEffect, useState } from "react";
import { defaultSite, loadSite, saveSite } from "./content.js";
import { deletePdf, getPdf, putPdf } from "./pdf-store.js";
import { publishSite } from "./github-publish.js";
import { withBase } from "./paths.js";
import "./admin.css";

const clone = (value) => JSON.parse(JSON.stringify(value));

function Field({ label, value, onChange, area = false }) {
  return <label className="ve-field"><span>{label}</span>{area ? <textarea rows="4" value={value} onChange={(e) => onChange(e.target.value)} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
}

function Range({ label, value, min, max, onChange }) {
  return <label className="ve-range"><span>{label}<b>{value}px</b></span><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function PdfUpload({ label, name, storageKey, onNameChange }) {
  const [busy, setBusy] = useState(false);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    await putPdf(storageKey, file);
    onNameChange(file.name);
    setBusy(false);
  };
  const remove = async () => { await deletePdf(storageKey); onNameChange(""); };
  return <div className="ve-pdf-upload" style={{ display: "grid", gap: 8, marginBottom: 16, padding: 12, border: "1px solid var(--ve-line)" }}><span style={{ fontSize: 11, color: "var(--ve-muted)" }}>{label}</span><small>{name || "No PDF uploaded"}</small><div style={{ display: "flex", gap: 8 }}><label style={{ padding: "8px 10px", border: "1px solid var(--ve-line)", cursor: "pointer", fontSize: 11 }}><span>{busy ? "Uploading…" : name ? "Replace PDF" : "Upload PDF"}</span><input style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} disabled={busy} type="file" accept="application/pdf" onChange={(e) => upload(e.target.files?.[0])} /></label>{name && <button type="button" onClick={remove}>Remove</button>}</div></div>;
}

async function compressImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
  const scale = Math.min(1, 1600 / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", .84);
}

export function Admin() {
  const [content, setContent] = useState(() => clone(loadSite()));
  const [panel, setPanel] = useState("home");
  const [projectIndex, setProjectIndex] = useState(0);
  const [status, setStatus] = useState("Saved locally");
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const isOnlineEditor = window.location.hostname.endsWith("github.io");

  const update = (next) => {
    setContent(next);
    setDirty(true);
    setStatus("Unsaved changes");
  };
  const save = async () => {
    const shouldPublish = Boolean(githubToken.trim()) || isOnlineEditor;
    if (shouldPublish && !githubToken.trim()) {
      setPanel("publish");
      setStatus("GitHub token required");
      return;
    }

    setPublishing(true);
    setStatus(shouldPublish ? "Publishing to GitHub…" : "Saving locally…");
    try {
      let savedContent = content;
      if (shouldPublish) {
        const result = await publishSite({ content, token: githubToken.trim(), getPdf });
        savedContent = result.content;
      }
      saveSite(savedContent);
      setContent(savedContent);
      setDirty(false);
      setStatus(shouldPublish ? "Published · site updating" : "Saved locally");
      setRevision((value) => value + 1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };
  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const updateProject = (key, value) => update({ ...content, projects: content.projects.map((project, index) => index === projectIndex ? { ...project, [key]: value } : project) });
  const upload = async (file) => { if (file) updateProject("image", await compressImage(file)); };
  const uploadPortrait = async (file) => { if (file) update({ ...content, portrait: await compressImage(file) }); };
  const preview = panel === "projects" ? withBase("projects/") : panel === "cv" ? withBase("cv/") : withBase();

  return <main className="ve-shell">
    <header className="ve-header">
      <div><small>Wenzhe Xu · local editor</small><h1>Visual editor</h1></div>
      <div className="ve-actions"><span>{status}</span><button className="ve-save" type="button" onClick={save} disabled={!dirty || publishing}>{isOnlineEditor || githubToken ? "Publish changes" : "Save changes"}</button><a href={withBase()} target="_blank">Open website</a><button type="button" onClick={() => update(clone(defaultSite))}>Reset draft</button></div>
    </header>
    <div className="ve-workspace">
      <aside className="ve-sidebar">
        <nav className="ve-tabs" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          <button className={panel === "home" ? "active" : ""} onClick={() => setPanel("home")}>Home</button>
          <button className={panel === "projects" ? "active" : ""} onClick={() => setPanel("projects")}>Projects</button>
          <button className={panel === "cv" ? "active" : ""} onClick={() => setPanel("cv")}>CV</button>
          <button className={panel === "layout" ? "active" : ""} onClick={() => setPanel("layout")}>Layout</button>
          <button className={panel === "publish" ? "active" : ""} onClick={() => setPanel("publish")}>Publish</button>
        </nav>

        {panel === "home" && <section className="ve-panel">
          <h2>Home content</h2>
          <Field label="Name" value={content.name} onChange={(name) => update({ ...content, name })} />
          <Field label="Homepage headline" value={content.headline} onChange={(headline) => update({ ...content, headline })} />
          <div className="ve-upload">
            {content.portrait && <img src={content.portrait} alt="Current portrait" style={{ borderRadius: "50%" }} />}
            <label><span>{content.portrait ? "Replace portrait" : "Upload portrait"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadPortrait(e.target.files?.[0])} /></label>
            {content.portrait !== defaultSite.portrait && <button type="button" onClick={() => update({ ...content, portrait: defaultSite.portrait })}>Use default</button>}
          </div>
          <Field label="Email" value={content.email} onChange={(email) => update({ ...content, email })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "-4px 0 12px", color: "var(--ve-muted)", fontSize: 11 }}><input type="checkbox" checked={content.contactVisibility.email} onChange={(e) => update({ ...content, contactVisibility: { ...content.contactVisibility, email: e.target.checked } })} /> Show Email on Home</label>
          <Field label="GitHub URL" value={content.github} onChange={(github) => update({ ...content, github })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "-4px 0 12px", color: "var(--ve-muted)", fontSize: 11 }}><input type="checkbox" checked={content.contactVisibility.github} onChange={(e) => update({ ...content, contactVisibility: { ...content.contactVisibility, github: e.target.checked } })} /> Show GitHub on Home</label>
          <Field label="LinkedIn URL" value={content.linkedin} onChange={(linkedin) => update({ ...content, linkedin })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "-4px 0 12px", color: "var(--ve-muted)", fontSize: 11 }}><input type="checkbox" checked={content.contactVisibility.linkedin} onChange={(e) => update({ ...content, contactVisibility: { ...content.contactVisibility, linkedin: e.target.checked } })} /> Show LinkedIn on Home</label>
          {content.intro.map((text, index) => <Field area key={index} label={`Intro paragraph ${index + 1}`} value={text} onChange={(value) => update({ ...content, intro: content.intro.map((item, itemIndex) => itemIndex === index ? value : item) })} />)}
          <h3>News</h3>
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 16px", color: "var(--ve-muted)", fontSize: 11 }}><input type="checkbox" checked={content.newsVisible} onChange={(e) => update({ ...content, newsVisible: e.target.checked })} /> Show News module on Home</label>
          {content.news.map((item, index) => <div className="ve-pair" key={index}><Field label={`Date ${index + 1}`} value={item.date} onChange={(value) => update({ ...content, news: content.news.map((news, i) => i === index ? { ...news, date: value } : news) })} /><Field label="Text" value={item.text} onChange={(value) => update({ ...content, news: content.news.map((news, i) => i === index ? { ...news, text: value } : news) })} /></div>)}
        </section>}

        {panel === "projects" && <section className="ve-panel">
          <h2>Project content</h2>
          <div className="ve-project-tabs">{content.projects.map((_, index) => <button className={projectIndex === index ? "active" : ""} key={index} onClick={() => setProjectIndex(index)}>{index + 1}</button>)}</div>
          <div className="ve-upload">
            {content.projects[projectIndex].image && <img src={content.projects[projectIndex].image} alt="Current project" />}
            <label><span>{content.projects[projectIndex].image ? "Replace image" : "Upload image"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload(e.target.files?.[0])} /></label>
            {content.projects[projectIndex].image && <button type="button" onClick={() => updateProject("image", "")}>Remove</button>}
          </div>
          <PdfUpload label="Project details PDF" name={content.projects[projectIndex].pdfName || ""} storageKey={`project-${projectIndex}`} onNameChange={(value) => updateProject("pdfName", value)} />
          <Field label="Title" value={content.projects[projectIndex].title} onChange={(value) => updateProject("title", value)} />
          <Field label="Period / role" value={content.projects[projectIndex].period} onChange={(value) => updateProject("period", value)} />
          <Field area label="Summary" value={content.projects[projectIndex].summary} onChange={(value) => updateProject("summary", value)} />
          <Field area label="Details" value={content.projects[projectIndex].detail} onChange={(value) => updateProject("detail", value)} />
        </section>}

        {panel === "cv" && <section className="ve-panel">
          <h2>CV PDF</h2>
          <p style={{ color: "var(--ve-muted)", fontSize: 12, lineHeight: 1.5 }}>Upload a PDF here to replace the default CV shown on the public CV page.</p>
          <PdfUpload label="Curriculum vitae PDF" name={content.cvPdfName || ""} storageKey="cv" onNameChange={(cvPdfName) => update({ ...content, cvPdfName })} />
        </section>}

        {panel === "layout" && <section className="ve-panel">
          <h2>Layout</h2>
          <Range label="Content width" min="760" max="1380" value={content.design.contentWidth} onChange={(value) => update({ ...content, design: { ...content.design, contentWidth: value } })} />
          <Range label="Page top spacing" min="24" max="120" value={content.design.pageTop} onChange={(value) => update({ ...content, design: { ...content.design, pageTop: value } })} />
          <Range label="Home body font" min="15" max="26" value={content.design.bodyFontSize} onChange={(value) => update({ ...content, design: { ...content.design, bodyFontSize: value } })} />
          <Range label="Project row gap" min="20" max="100" value={content.design.sectionGap} onChange={(value) => update({ ...content, design: { ...content.design, sectionGap: value } })} />
        </section>}

        {panel === "publish" && <section className="ve-panel">
          <h2>Publish to GitHub</h2>
          <p style={{ color: "var(--ve-muted)", fontSize: 12, lineHeight: 1.55 }}>Enter a fine-grained GitHub token with access only to <strong>wenzhe9/wenzhe9.github.io</strong> and the repository permission <strong>Contents: Read and write</strong>.</p>
          <label className="ve-field"><span>GitHub fine-grained token</span><input type="password" autoComplete="off" value={githubToken} onChange={(event) => setGithubToken(event.target.value)} placeholder="github_pat_…" /></label>
          <p style={{ color: "var(--ve-muted)", fontSize: 11, lineHeight: 1.55 }}>The token stays only in this open editor page. It is not saved in the website, browser storage, or GitHub repository.</p>
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 4, fontSize: 12 }}>Create a fine-grained token on GitHub</a>
        </section>}
      </aside>
      <section className="ve-preview"><div><span>Live preview</span><small>{preview}</small></div><iframe key={`${preview}-${revision}`} src={`${preview}?edit=${revision}`} title="Live website preview" /></section>
    </div>
  </main>;
}
