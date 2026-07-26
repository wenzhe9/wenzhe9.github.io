const OWNER = "wenzhe9";
const REPOSITORY = "wenzhe9.github.io";
const BRANCH = "main";
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPOSITORY}`;

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function textToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}

function dataUrlToBase64(dataUrl) {
  const separator = dataUrl.indexOf(",");
  if (separator === -1) throw new Error("Invalid uploaded image.");
  return dataUrl.slice(separator + 1);
}

async function fileToBase64(file) {
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()));
}

async function github(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // Keep the HTTP status when GitHub does not return JSON.
    }
    throw new Error(`GitHub: ${message}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function createBlob(token, content) {
  return github(`${API_ROOT.replace("https://api.github.com", "")}/git/blobs`, token, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "base64" }),
  });
}

export async function publishSite({ content, token, getPdf }) {
  const nextContent = JSON.parse(JSON.stringify(content));
  const files = [];

  if (nextContent.portrait?.startsWith("data:image/")) {
    files.push({ path: "public/uploads/portrait.jpg", content: dataUrlToBase64(nextContent.portrait) });
    nextContent.portrait = "/uploads/portrait.jpg";
  }

  for (let index = 0; index < nextContent.projects.length; index += 1) {
    const project = nextContent.projects[index];
    if (project.image?.startsWith("data:image/")) {
      const path = `public/uploads/project-${index + 1}.jpg`;
      files.push({ path, content: dataUrlToBase64(project.image) });
      project.image = `/${path.replace(/^public\//, "")}`;
    }

    const projectPdf = await getPdf(project.storageKey || `project-${index}`);
    if (projectPdf) {
      const path = `public/uploads/project-${index + 1}.pdf`;
      files.push({ path, content: await fileToBase64(projectPdf) });
      project.pdfPath = `/${path.replace(/^public\//, "")}`;
      project.pdfName = projectPdf.name;
    } else if (!project.pdfName) {
      project.pdfPath = "";
    }
  }

  const cvPdf = await getPdf("cv");
  if (cvPdf) {
    files.push({ path: "public/uploads/cv.pdf", content: await fileToBase64(cvPdf) });
    nextContent.cvPdfPath = "/uploads/cv.pdf";
    nextContent.cvPdfName = cvPdf.name;
  } else if (!nextContent.cvPdfName) {
    nextContent.cvPdfPath = "";
  }

  files.push({
    path: "public/site-content.json",
    content: textToBase64(`${JSON.stringify(nextContent, null, 2)}\n`),
  });

  const refPath = `/repos/${OWNER}/${REPOSITORY}/git/ref/heads/${BRANCH}`;
  const ref = await github(refPath, token);
  const parentSha = ref.object.sha;
  const parentCommit = await github(`/repos/${OWNER}/${REPOSITORY}/git/commits/${parentSha}`, token);

  const treeEntries = await Promise.all(files.map(async (file) => {
    const blob = await createBlob(token, file.content);
    return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const tree = await github(`/repos/${OWNER}/${REPOSITORY}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeEntries }),
  });
  const commit = await github(`/repos/${OWNER}/${REPOSITORY}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({
      message: "Update website content from visual editor",
      tree: tree.sha,
      parents: [parentSha],
    }),
  });
  await github(`/repos/${OWNER}/${REPOSITORY}/git/refs/heads/${BRANCH}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { content: nextContent, commitSha: commit.sha };
}
