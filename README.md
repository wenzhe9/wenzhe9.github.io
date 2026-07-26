# Wenzhe Xu — Personal Academic Site

Personal academic portfolio with separate Home, Project, CV, project-detail PDF, and local visual-editor pages.

## Public site

The site is deployed automatically to GitHub Pages whenever `main` is updated:

https://wenzhe9.github.io/

## Local development

```bash
npm install
npm run dev
```

The visual editor is available only in the local build at `http://localhost:3002/admin/`; it is excluded from the GitHub Pages artifact. Local drafts stay in the current browser. When a repository-scoped fine-grained GitHub token is entered, **Publish changes** creates one commit containing the content, images, PDFs, and `public/site-content.json`; GitHub Pages then redeploys the public site automatically. Public pages fetch that JSON with cache bypassing so newly deployed content appears on refresh.
