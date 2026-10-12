# TaskFlow

A clean, responsive task manager built with plain HTML, CSS and JavaScript. Tasks are saved in the browser, so there is no account, server or build step.

**Live demo:** _add your GitHub Pages link here after deploying_

![TaskFlow on desktop](assets/screenshot-desktop.png)

<img src="assets/screenshot-mobile.png" alt="TaskFlow on mobile" width="260">

## Features

- Add tasks (Enter or button); empty and whitespace-only names are rejected with a clear message
- Mark tasks complete or active, and delete them
- Filter by All, Active or Completed, with a helpful empty state for each
- Live stats (total, pending, completed) and a completion ring
- "Clear completed" with a confirmation dialog before anything is deleted
- Tasks persist in `localStorage` across refreshes and restarts
- Safe by design: task text is inserted with `textContent`, never parsed as HTML
- Corrupt or unavailable storage is handled without crashing
- Responsive layout, visible keyboard focus, labelled controls, reduced-motion support

## Technologies

HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES6+), `localStorage`, Git and GitHub.

## Run locally

No installation needed. Open `index.html` in a browser, or use the Live Server extension in VS Code.

## Project structure

```
taskflow-portfolio/
├── index.html   # page structure
├── style.css    # design tokens and styling
├── script.js    # state, storage, rendering, events
├── assets/      # README screenshots
├── README.md
└── .gitignore
```

## How it works

`script.js` keeps a `tasks` array as the single source of truth. Every action (add, toggle, delete, clear) updates the array, saves it to `localStorage`, then calls `render()`, which redraws the list, stats and filters. Each task has a unique ID (`crypto.randomUUID()`), so actions never depend on array positions.

## What I learned

- Keeping one source of truth and re-rendering from it
- Event delegation for dynamic lists
- Preventing XSS by avoiding `innerHTML` for user input
- Validating data read from `localStorage`
- Building a responsive, accessible layout with CSS Grid and custom properties

## Future improvements

- Edit task text
- Due dates and priorities
- Drag-and-drop ordering
- Dark mode
- Automated tests

## Deployment (GitHub Pages)

1. Push the project to a GitHub repository (see below).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. After a minute or two the site appears at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. Copy the URL shown on that Settings page, then paste it above.

## Publishing to GitHub

```bash
cd taskflow-portfolio
git init -b main
git add index.html style.css script.js .gitignore
git commit -m "feat: add TaskFlow app structure, styling and task logic"
git add README.md assets
git commit -m "docs: add README and screenshots"
git remote add origin https://github.com/YOUR-USERNAME/REPOSITORY-NAME.git
git push -u origin main
```

Create the empty repository on github.com first (**New repository**, no README, no .gitignore).
