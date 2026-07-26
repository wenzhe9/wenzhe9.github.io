# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable design direction

- Use separate document routes for Home, Project, and CV; do not use one-page anchor navigation.
- Keep the Home page editorial and academic: circular portrait, large sans-serif greeting, serif body copy, muted green links, and a compact news list.
- Keep the Project page as five full-width rows with a project title followed by image-left / description-right content.
- The CV route should display the PDF directly inside the page.
- Keep the editor at `/admin/` outside the three-item public navigation. It stores drafts in same-origin browser localStorage, previews them live, and can publish one GitHub commit using a session-only fine-grained token.
- Store uploaded project and CV PDFs in same-origin IndexedDB. Each Project details link opens `/project/?id=N`, while `/cv/` displays the uploaded CV or the bundled fallback PDF.
- On GitHub Pages, public routes use the repository-backed `src/default-site.json`; browser-local drafts are used only inside the editor preview. Publishing uploads changed images/PDFs and updates the JSON in one commit.
