# Esther Timbwa – portfolio

Static site: HTML, CSS and vanilla JavaScript modules. No build step.
Three.js, GSAP + ScrollTrigger and Lenis load from jsDelivr at pinned versions
(see the import map in `index.html`).

Live at https://esthertimbwa.github.io

## Files

```
index.html          page shell, meta / Open Graph tags, import map
css/styles.css      colours, type, glass panels, layouts, fallbacks
js/content.js       ALL text and project data – edit this file
js/main.js          renders the page from content.js, picks the device mode
js/background.js    3D background (grid floor + wireframe sphere)
js/scenes.js        pinned, scroll-driven scenes on desktop
assets/             favicon, share image, project screenshots, fonts
```

## Editing content (`js/content.js`)

Everything you read on the site lives in `content.js`. Change the text, save,
refresh. You never need to touch the layout files.

- **Text in [SQUARE BRACKETS]** is a placeholder still to be filled in.
- **Headlines** are lists of lines. `{ text: 'Then I test them.', outline: true }`
  draws that line as outlined text.
- **Projects** (`work` → `projects`):
  - `images: []` shows a typographic cover with the project title.
  - One image shows that screenshot; several images cycle inside the card.
    Each image is `{ src: 'assets/projects/name.webp', alt: 'What it shows' }`.
  - `private: true` never shows the client name.
  - `status: 'Launching soon'` adds a small tag; set it to `''` to remove it.
  - `live: false` hides the project link even if `url` is set. Set `live: true`
    when the site is public.
  - `tags: [...]` adds small chips under the description.
- **CV download**: put the file at `assets/cv.pdf`, then set
  `site.cv.enabled` to `true`. While it is `false` the button is hidden.
- **Contact buttons** are each panel's `actions` list (`email`, `cv` or `link`).
  The first visible button is filled, the rest are outlined.
- **Links** (LinkedIn, GitHub) and the email address are under `site`.

Screenshots: 1440×900, WebP, under 200 KB each, in `assets/projects/`.

## Preview locally

ES modules do not run from `file://`, so use a tiny local server:

```
python -m http.server 5173
```

Then open http://127.0.0.1:5173. Add `?debug` to the URL to expose the
background and scene timeline in the browser console for testing.

## How it behaves on different devices

- **Desktop** (wider than 900px, mouse): pinned scenes that hand over as you
  scroll, full 3D background, smooth scrolling.
- **Phones and tablets**: normal stacked sections, lighter 3D background.
- **No WebGL or a low-power device**: static CSS background instead of 3D.
- **Reduced motion** (OS setting): plain readable page, no animation.

## Deploying

### GitHub Pages (current)

Repository: `EstherTimbwa/EstherTimbwa.github.io`. Pages serves the `main`
branch from the repository root. `.nojekyll` stops GitHub from processing the
files.

```
git add -A
git commit -m "Describe the change"
git push
```

The site updates a minute or two after each push.

### Netlify (alternative)

Drag the project folder into https://app.netlify.com/drop, or connect the
repository with no build command and `.` as the publish directory.

If the domain changes, update the canonical link and the `og:url`,
`og:image` and `twitter:image` tags in `index.html`.

## Credits

Sora, Manrope and JetBrains Mono from Google Fonts. `assets/fonts/` holds a
copy of Sora Bold with overlapping outlines merged (for outlined text), under
the SIL Open Font License (`assets/fonts/OFL.txt`).
