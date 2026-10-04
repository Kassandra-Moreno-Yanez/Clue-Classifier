# The Case Cabinet

A front-end prototype of a private evidence archive, presented as a filing cabinet. You sign in on the cabinet drawer, the drawer opens onto a stack of case files, each file opens as a folder, and each folder has a pin board that shows how the people, places and objects in the case are connected.

It is plain HTML, CSS and JavaScript. There is no build step, no framework and no server.

## Run it

Open `index.html` in a browser, or serve the folder with any static server:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

To publish on GitHub Pages: push this folder to a repository, then in the repository's **Settings → Pages** choose the branch and the folder that contains `index.html`.

## Files

| File | What it holds |
|---|---|
| `index.html` | The page markup: sign-in view, drawer view, folder (dossier) and pin board. |
| `css/styles.css` | All styles. Colours and fonts are defined as variables at the top. |
| `js/cabinet.js` | The 3D cabinet and its drawer physics, sign-in, accounts, the sample case data and the folder. |
| `js/drawer.js` | The page around the cabinet: the front-on drawer of case files, sorting, cabinets and switching between them. |
| `js/pinboard.js` | The pin board: builds the connections graph, lays it out, and draws it. |

The three scripts are ordinary (non-module) scripts and must load in that order, because each uses variables defined by the ones before it.

## What you can do in it

- **Sign in or create an account** on the drawer. Any valid-looking email and a password of 8 or more characters is accepted.
- **Browse case files** in the open drawer. Pointing at a file lifts it and shows a summary; clicking opens it.
- **Sort** the files by recently updated, case number, title, case date or status.
- **Add cabinets** from the list beside the drawer, name them, and switch between them.
- **Open a folder** with Photos, Videos, Documents and Timeline tabs, plus tabs you add yourself.
- **Open the pin board** from the button under an open folder. Click a string to see the evidence behind it, or a pinned item to see everything it connects to. Items can be dragged, and evidence can be added or removed from the **Evidence** button.

## What is not real yet

This is a front end only. Before building on it, note:

- **No backend and no real sign-in.** Nothing is checked against a server. To require one fixed login for a demo, set `CREDS` in `js/cabinet.js`.
- **Nothing is saved.** Accounts, cabinets, case files and board changes live in memory and are lost when the page reloads.
- **The case data is invented.** The four sample cases, their summaries, statuses, documents and all pin-board evidence are placeholder content defined at the top of `js/cabinet.js` (`CASES`, `EVID`, `XREF`).
- **Photos and videos are not uploaded.** Photos are read into the page for display only; videos are listed by name and size.
- **The connections graph is computed in the browser.** `connections(evidence, xrefs)` in `js/pinboard.js` returns `{ nodes, links }`, where each link lists the evidence that supports it. It is written to have the shape a server endpoint would return, so it is the one function to replace when that endpoint exists.
- **Evidence entities are typed in by hand.** People, places and objects are not extracted automatically.

## Fonts and palette

Fonts are loaded from Google Fonts: Playfair Display (headings), DM Sans (text) and DM Mono (labels). The page falls back to system fonts if they cannot load.

The palette is dark teal with a red-oxide accent: `#071516`, `#28565D`, `#2B6E7C`, `#448690` and `#76190E`.

## Browser support

Built and tested in current Chromium at desktop, laptop and phone widths. It uses CSS 3D transforms, individual transform properties (`translate`) and `overflow: clip`, so it needs a recent version of Chrome, Edge, Safari or Firefox. Animations are reduced when the system's reduced-motion setting is on.
