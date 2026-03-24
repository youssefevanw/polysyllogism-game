# George & the Dragon — Logic Game

An 8-bit themed logic game for high school students studying formal logic (syllogisms, polysyllogisms, and sorites). Students drag and drop terms into logic structures. Correct answers cause George (a knight) to attack the dragon; wrong answers cause the dragon to breathe fire at George.

---

## 1. How to Deploy to GitHub Pages

### Step-by-step (no coding experience needed):

1. **Create a GitHub account** at [github.com](https://github.com) if you don't have one.

2. **Create a new repository:**
   - Click the green "New" button on your GitHub dashboard.
   - Name it something like `logic-game`.
   - Make sure "Public" is selected.
   - Click "Create repository".

3. **Upload the game files:**
   - On the repository page, click "uploading an existing file" (or the "Add file" button, then "Upload files").
   - Drag the entire contents of the `Syllogism App` folder into the upload area. Make sure you include:
     - `index.html`
     - `css/` folder
     - `js/` folder
     - `data/` folder
   - Do **not** upload `server.rb`, `server.py`, `.claude/`, or `output_doc/` — these are only for local development.
   - Click "Commit changes".

4. **Enable GitHub Pages:**
   - Go to your repository's **Settings** tab.
   - In the left sidebar, click **Pages**.
   - Under "Source", select **Deploy from a branch**.
   - Under "Branch", select **main** and **/ (root)**.
   - Click **Save**.

5. **Wait 1-2 minutes**, then visit:
   ```
   https://YOUR-USERNAME.github.io/logic-game/
   ```
   Replace `YOUR-USERNAME` with your GitHub username and `logic-game` with your repository name.

### Updating the game after deployment:

- To update questions or code, edit the files directly on GitHub (click any file, then the pencil icon to edit) or re-upload changed files.
- Changes go live within 1-2 minutes after committing.

---

## 2. How to Embed in Google Sites via iframe

1. Open your Google Site in edit mode.
2. In the right sidebar, click **Embed** (or go to Insert > Embed).
3. Select the **By URL** tab.
4. Paste your GitHub Pages URL:
   ```
   https://YOUR-USERNAME.github.io/logic-game/
   ```
5. Click **Insert**.
6. Resize the embed frame to fill the page. Recommended minimum size: **1200 x 800 pixels**.
7. Click **Publish** to save your Google Site.

**Tip:** If the embed appears too small, click on the embedded frame and drag the corners to make it larger. The game is designed for 1366x768 screens (standard Chromebook resolution).

---

## 3. How to Edit Question Banks

Each level's questions are stored in a separate JSON file in the `data/` folder:

| File | Level | Description |
|------|-------|-------------|
| `data/level1.json` | 1 | Syllogisms with S/M/P notation |
| `data/level2.json` | 2 | Syllogisms with concrete terms |
| `data/level3.json` | 3 | Polysyllogisms with notation |
| `data/level4.json` | 4 | Polysyllogisms with terms |
| `data/level5.json` | 5 | Aristotelian Sorites |
| `data/level6.json` | 6 | Goclenian Sorites |

### Editing Level 1 or 3 (notation levels — S/M/P tokens)

These levels use fixed tokens (S, M, P or S1, M1, P1, S2, M2, P2). To add a new question, add an entry to the `"problems"` array. Example for Level 1:

```json
{
  "name": "Barbara",
  "code": "AAA-1",
  "rows": [
    { "label": "Major Premise", "quantifier": "All", "subject": "M", "copula": "are", "predicate": "P" },
    { "label": "Minor Premise", "quantifier": "All", "subject": "S", "copula": "are", "predicate": "M" },
    { "label": "Conclusion",    "quantifier": "All", "subject": "S", "copula": "are", "predicate": "P" }
  ]
}
```

- `"name"` — Display name for the syllogism.
- `"code"` — The syllogism code (e.g., "AAA-1"). Shown as a badge.
- `"rows"` — Each row is a premise or conclusion. Each has:
  - `"label"` — What appears on the left ("Major Premise", "Minor Premise", "Conclusion").
  - `"quantifier"` — The word shown before the first drop zone ("All", "Some", "No").
  - `"subject"` — The correct answer for the first drop zone (e.g., `"M"`, `"S"`, `"P"`).
  - `"copula"` — The word shown between drop zones ("are", "are not").
  - `"predicate"` — The correct answer for the second drop zone.

### Editing Level 2, 4, 5, or 6 (term levels — image tokens)

These levels use concrete terms (like "Dogs", "Mammals") instead of S/M/P. Each question defines its own terms and distractors. Example:

```json
{
  "name": "Barbara",
  "code": "AAA-1",
  "rows": [
    { "label": "Major Premise", "quantifier": "All", "subject": ["mammals"],  "copula": "are", "predicate": ["animals"] },
    { "label": "Minor Premise", "quantifier": "All", "subject": ["dogs"],     "copula": "are", "predicate": ["mammals"] },
    { "label": "Conclusion",    "quantifier": "All", "subject": ["dogs"],     "copula": "are", "predicate": ["animals"] }
  ],
  "terms": [
    { "id": "dogs",    "label": "Dogs" },
    { "id": "mammals", "label": "Mammals" },
    { "id": "animals", "label": "Animals" }
  ],
  "distractors": [
    { "id": "rocks", "label": "Rocks" },
    { "id": "fish",  "label": "Fish" }
  ]
}
```

**Key differences from notation levels:**
- `"subject"` and `"predicate"` are **arrays** (e.g., `["dogs"]` not `"dogs"`). This allows multiple correct answers for a single slot.
- `"terms"` — The correct terms the student needs. Each has an `"id"` (used for matching) and a `"label"` (displayed to the student).
- `"distractors"` — Extra wrong terms added to the tray to make the question harder. Add 1-4 distractors per question.

### Tips for editing JSON:

- **Use a JSON validator** (search "JSON validator" online) to check your edits before uploading. A single missing comma or quote will break the file.
- **Keep the `"id"` values consistent** — the id in `"terms"` must exactly match what appears in the row's `"subject"` or `"predicate"` array.
- **Test after editing** — reload the game and play the level to make sure your new questions work.

---

## 4. How to Add Custom 8-bit Term Images

By default, all term tokens show a colored rectangle with the term's first letter. The color is automatically generated from the term name (same term always gets the same color).

To add custom pixel-art images for terms:

### Adding images:

1. Create your image as an **SVG file** (recommended) or **PNG** (48x48 pixels).
2. Name the file to match the term's `"id"` in the JSON. For example:
   - Term `"id": "dogs"` → file named `dogs.svg`
   - Term `"id": "mammals"` → file named `mammals.svg`
3. Place the file in `assets/images/terms/` (create this folder if it doesn't exist).

### Image requirements:

- **Format:** SVG preferred (scales perfectly). PNG also works (use 48x48 pixels).
- **Style:** 8-bit pixel art looks best with the game's theme. Use `image-rendering: pixelated` in your SVGs.
- **Size:** SVG viewBox of `0 0 12 12` or `0 0 16 16` works well. PNG should be 48x48 pixels.
- **Background:** Transparent background recommended.

### Updating the JSON to use images:

Add an `"image"` field to each term in your JSON:

```json
{
  "id": "dogs",
  "label": "Dogs",
  "image": "dogs.svg"
}
```

**Note:** The current version generates all images programmatically (no image files needed). Custom images are a future enhancement — the game works fully without any image files in the `assets/` folder.

---

## 5. How to Replace Placeholder Sprites

The knight (George) and dragon sprites are generated as inline SVGs in `js/sprites.js`. To replace them with custom art:

### Replacing George (the knight):

1. Open `js/sprites.js`.
2. Find the `createGeorge` function.
3. Replace the SVG content with your own pixel-art SVG. The function should return an SVG string.
4. Keep the `size` parameter and `viewBox` for proper scaling.

### Replacing the Dragon:

1. In the same file, find the `createDragon` function.
2. Replace the SVG content with your custom dragon art.

### Replacing other sprites:

All sprites are in `js/sprites.js`:
- `createGeorge(size)` — The knight character
- `createDragon(size)` — The dragon character
- `createFireBreath(size)` — Fire breath attack effect
- `createSwordSlash(size)` — Sword slash attack effect
- `createLock(size)` — Lock icon on locked levels
- `createStar(size)` — Gold star on beaten levels
- `createDoor(state, levelNum)` — Door sprites (locked/unlocked/beaten)
- `createGardenLocked(w, h)` — Locked garden scene
- `createGardenUnlocked(w, h)` — Unlocked garden celebration scene

### Tips for custom sprites:

- Each function returns an SVG string. You can paste any valid SVG content.
- Use `style="image-rendering:pixelated"` on the SVG element for crisp pixel art.
- Common viewBox sizes: `0 0 16 16` for characters, `0 0 10 10` for icons.
- The `size` parameter controls the rendered width/height in pixels.

---

## 6. localStorage Details

The game saves all progress in your browser's localStorage under the key `georgeAndDragon`.

### What's stored:

```json
{
  "version": 1,
  "muted": false,
  "levels": {
    "1": { "beaten": false, "attempts": 0, "bestRun": null },
    "2": { "beaten": false, "attempts": 0, "bestRun": null },
    "3": { "beaten": false, "attempts": 0, "bestRun": null },
    "4": { "beaten": false, "attempts": 0, "bestRun": null },
    "5": { "beaten": false, "attempts": 0, "bestRun": null },
    "6": { "beaten": false, "attempts": 0, "bestRun": null }
  },
  "stats": {
    "totalCorrect": 0,
    "totalAttempts": 0,
    "totalReveals": 0,
    "totalTimePlayed": 0
  }
}
```

- **`muted`** — Whether sound is turned off.
- **`levels`** — Per-level progress:
  - `beaten` — Has the student completed this level?
  - `attempts` — How many times they've started this level.
  - `bestRun` — Their best performance: `{ correct, wrong, reveals }` or `null` if never beaten.
- **`stats`** — Cumulative stats across all sessions.

### How to reset progress via browser dev tools:

1. Open the game in your browser.
2. Press **F12** (or right-click and select "Inspect") to open Developer Tools.
3. Go to the **Console** tab.
4. Type this command and press Enter:
   ```js
   localStorage.removeItem('georgeAndDragon')
   ```
5. Refresh the page. All progress is reset.

### How to reset via the game:

- Click the **stats icon** (bar chart) on the castle map.
- Scroll down and click **"Reset All Progress"**.
- Confirm the dialog.

### How to view current data:

In the browser console (F12 > Console), type:
```js
JSON.parse(localStorage.getItem('georgeAndDragon'))
```

### Important notes:

- localStorage is **per-browser, per-device**. Each student's progress is saved only on their own Chromebook/browser.
- Clearing browser data or using incognito mode will erase all progress.
- If the game is embedded in a Google Sites iframe, localStorage is scoped to the GitHub Pages domain, not the Google Sites domain.
