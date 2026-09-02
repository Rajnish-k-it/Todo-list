# Daymark Todo List

Daymark is a small, responsive todo list web app built with plain HTML, CSS, and JavaScript. It is designed for quick daily planning: add a task, mark it complete, filter the list, and keep the work stored in the current browser.

The project has no build step, framework, package manager, or server-side dependency.

## Features

- Add tasks from the input field.
- Edit task titles inline with the pencil action.
- Submit with the Add task button or the Enter key.
- Mark tasks open or complete with a circular checkbox.
- Filter the list by All, Open, or Done.
- Delete individual tasks.
- Clear all completed tasks at once.
- Show total, open, and completed task counts.
- Show a completion percentage and a progress ring.
- Persist tasks in `localStorage` under the `daymark-tasks` key.
- Render user-entered task text safely as text instead of executable HTML.
- Include an empty state when the selected filter has no tasks.
- Use responsive layout rules for smaller screens.
- Provide labels and status text for keyboard and assistive-technology users.

## Project Structure

```text
Todo list/
|-- index.html   Page structure and accessible controls
|-- styles.css   Layout, colors, typography, responsive rules, and animation
|-- app.js       State, rendering, persistence, and event handling
|-- README.md    Setup and maintenance documentation
```

## Requirements

You only need:

- A modern browser such as Chrome, Edge, Firefox, or Safari.
- Python 3 for the simplest local server option.

Node.js is not required. There are no external JavaScript packages to install.

## Run Locally

### Option 1: Python local server

1. Open Terminal.
2. Move into the project directory:

   ```bash
   cd "/Users/rajnish/Desktop/Git and github/Todo list"
   ```

3. Start a local server:

   ```bash
   python3 -m http.server 8000
   ```

4. Open [http://localhost:8000](http://localhost:8000) in your browser.
5. Stop the server with `Ctrl+C` when you are finished.

Using a local server is recommended because browser storage and module-like browser behavior are more predictable over HTTP than when opening an HTML file directly.

### Option 2: Open the HTML file

Double-click `index.html` or open it from your browser. The app should render without a server, but browser policies can differ for `localStorage` when using a `file://` URL. Use the Python server if tasks do not persist.

## How To Use The App

### Add a task

1. Select the task input.
2. Enter a task up to 120 characters.
3. Press Enter or select Add task.
4. The new task is placed at the top and saved immediately.

Blank submissions are ignored after trimming whitespace.

### Complete a task

Select the circular checkbox beside an open task. The task receives completed styling, the Done count increases, and the progress percentage is recalculated.

Select the checkbox again to return the task to Open.

### Edit a task

Select the pencil action on a task row. Its title becomes an inline text field. Press Enter to save the new title or Escape to cancel. Empty titles are rejected, and saved changes are written to `localStorage` immediately.

### Filter tasks

Use the filter controls above the input:

- **All** shows every stored task.
- **Open** shows tasks that are not complete.
- **Done** shows completed tasks.

The counts always describe the complete stored list, even when a filter is active.

### Delete tasks

Select the `x` control on a task row. Deletion is immediate and is saved to the browser.

### Clear completed tasks

Select Clear completed to remove every completed task. Open tasks are preserved.

## Data And Persistence

Tasks are stored only in the current browser profile. They are not sent to a server or shared between browsers and devices.

The storage key is:

```text
daymark-tasks
```

Each task has this shape:

```json
{
  "id": "unique-task-id",
  "title": "Read 20 pages of current book",
  "completed": true,
  "createdAt": "Yesterday"
}
```

The initial example tasks are used only when the storage key does not contain a valid array. Once a user changes the list, the current list is stored instead.

To reset the app to its example state, open the browser developer console on the app page and run:

```js
localStorage.removeItem("daymark-tasks");
location.reload();
```

If browser storage is blocked or full, the app still works for the current page session, but changes may not survive a reload.

## Implementation Details

### `index.html`

Defines the semantic page layout:

- Header with the Daymark brand and current date.
- Intro section with the main heading and progress summary.
- Todo workspace with filter tabs, task form, task list, and empty state.
- Footer with the local-storage notice and task count.

The task list is populated by JavaScript at runtime. The static HTML does not duplicate task markup.

### `styles.css`

Contains the complete visual system:

- CSS custom properties for the paper background, ink, muted text, borders, and coral accent.
- Manrope for interface text and DM Mono for compact metadata.
- A subtle paper texture created with a CSS data image.
- A four-column task grid so the checkbox, text, timestamp, and delete action remain aligned.
- A mobile breakpoint at 640px.
- A short `rise` animation for newly rendered task rows.

Change the colors in the `:root` block to create a different theme without changing the markup or JavaScript.

### `app.js`

Owns all application behavior:

1. Creates seed data when needed.
2. Loads saved tasks from `localStorage`.
3. Tracks the current filter in memory.
4. Renders the visible task list and summary counts.
5. Handles form submission, task toggling, deletion, filtering, and clearing.
6. Saves changes after every mutation.

User text is escaped through a temporary DOM element before being inserted into the task template. Task IDs use `crypto.randomUUID()` when available and a timestamp-based fallback otherwise.

## Testing Checklist

Run through this checklist after changing the app:

- Open the page and confirm the seed tasks render.
- Add a normal task and confirm it appears at the top.
- Try submitting only spaces and confirm no blank task is created.
- Complete an open task and confirm the progress ring and counts change.
- Return the task to Open and confirm the state reverses.
- Select each filter and confirm only the matching tasks are visible.
- Delete a task and confirm the total count decreases.
- Clear completed tasks and confirm open tasks remain.
- Reload the page and confirm changes persist.
- Remove the storage key and reload to confirm the seed list returns.
- Resize the browser below 640px and confirm controls do not overlap.
- Add text containing `<` and `>` and confirm it displays as text.
- Navigate through the controls with Tab and confirm focus remains visible.

A quick browser smoke test can be run against the local server with any browser automation tool. The project currently does not include a test runner because it has no package or build configuration.

## Troubleshooting

### The page is blank

Confirm that `index.html`, `styles.css`, and `app.js` are in the same directory. Then open the browser developer console and look for a JavaScript error.

### Tasks disappear after reload

Run the app through `python3 -m http.server 8000` instead of opening the file directly. Also check that private browsing or a browser policy is not blocking site storage.

### Port 8000 is already in use

Start the server on another port, for example:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

### The font looks different

The app loads Manrope and DM Mono from Google Fonts. If the network is unavailable, the browser uses the generic fallback family declared in the stylesheet. The app remains functional without the hosted fonts.

## Customization Ideas

The app is intentionally small and easy to extend. Good next additions would be:

- Edit a task title in place.
- Add due dates and sort by due date.
- Add priority or project labels.
- Add a search field for larger lists.
- Export and import tasks as JSON.
- Add an optional dark theme using a theme toggle.
- Replace `localStorage` with a backend API for shared or multi-device lists.
- Add automated tests with Playwright or another browser test runner.

For a new feature, keep the state changes in `app.js`, the visible structure in `index.html`, and the appearance in `styles.css`. After each change, use the testing checklist above and verify both a wide and narrow viewport.
