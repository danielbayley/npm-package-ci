const [owner, repo, branch, name] = import.meta.dirname.split("/").slice(-5, -1)

const path = process.env.GITHUB_ACTIONS
  ? `https://github.com/${owner}/${repo}/raw/${branch}/${name}`
  : "../.."

// https://primer.style/foundations/icons
const src = `${path}/octicons`

export function render(summary, content, icon, status, open = "") {
  icon = `<img title="${status}" src="${src}/${icon}.svg"/>`
  summary = `${icon}&ensp;${summary}`

  const body = content
    ? `<details${open}>
        <summary>${summary}</summary>
        <blockquote>
          ${content}
        </blockquote>
      </details>`
    : `<span>${summary}</span><br>`

  return body.replace(/`([^<>]+?)`/g, "<code>$1</code>")
}

export function preview(body) {
  const cdn = "https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.css"
  const style = `
    max-width: 980px;
    margin: 0 auto;
    padding: 1em`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="${cdn}"/>
      </head>
      <body class="markdown-body" style="${style}">
        ${body}
      </body>
    </html>`
}
