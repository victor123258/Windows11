# Windows 11 Desktop Simulator

A pixel-faithful Windows 11 desktop environment that runs entirely in the browser. Built with vanilla HTML, CSS and JavaScript with no build step, backend or runtime dependencies.

## Features

- Boot, lock, sign-in, sleep, restart and shutdown flows
- Window management with dragging, resizing, snapping, minimizing, maximizing and Alt+Tab switching
- Desktop icons with selection, dragging, context menus and arrangement options
- Start menu, search, Task View, Widgets, Quick Settings, notification center and calendar
- Light and dark themes, wallpaper and accent customization, display scaling and brightness
- Persistent virtual file system shared by File Explorer, Notepad, VS Code, Terminal and Office apps
- Microsoft Store catalog with install and uninstall support
- Recycle Bin integration for restorable Explorer and desktop deletions
- Working apps: File Explorer, Edge, Settings, Notepad, Calculator, Paint, Terminal, VS Code, Store, Task Manager, Recycle Bin, About This PC, Photos, Word, Excel, PowerPoint, Spotify and GitHub Desktop
- LocalStorage persistence for files, settings, installed apps and open document state
- Easter eggs: `bsod`, `matrix`, `clippy`, `rick` and the Konami code

## Run Locally

Open `index.html` directly in a modern browser, or serve the folder with any static web server:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push `index.html`, `style.css`, `script.js`, `README.md` and the `assets` folder to a GitHub repository.
2. Open **Settings > Pages**.
3. Select **Deploy from a branch**, choose the main branch and the repository root.
4. Save and open the published URL.

No build command, environment variables, server or database are required.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Win` | Open or close Start |
| `Win + D` | Show or hide the desktop |
| `Win + E` | Open File Explorer |
| `Win + I` | Open Settings |
| `Win + L` | Lock the PC |
| `Win + R` | Open the Run dialog |
| `Win + Arrow` | Snap or minimize the focused window |
| `Alt + Tab` | Switch between open windows |
| `Alt + F4` | Close the focused window |
| `Ctrl + Shift + Esc` | Open Task Manager |
| `Escape` | Close menus, dialogs and overlays |

## Notes

- This is a simulation. It is not affiliated with or endorsed by Microsoft.
- All user data stays in the browser's LocalStorage.
- No analytics or tracking are used. The base page only loads Google Fonts and the Tailwind CDN; Edge may request external pages when you enter a URL.
- `assets` is intentionally empty; all artwork and icons are generated inline.
