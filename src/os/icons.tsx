// Windows 11 icon set: local Fluent-style assets for apps + SVG glyphs for shell UI
export type Ic = (p: { size?: number; className?: string }) => React.ReactElement;

/* ---------- Windows logo ---------- */
export const WinLogo: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="wlg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#00adef" /><stop offset="1" stopColor="#0067b8" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="9.5" height="9.5" rx="0.45" fill="url(#wlg)" />
    <rect x="12.5" y="2" width="9.5" height="9.5" rx="0.45" fill="url(#wlg)" />
    <rect x="2" y="12.5" width="9.5" height="9.5" rx="0.45" fill="url(#wlg)" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" rx="0.45" fill="url(#wlg)" />
  </svg>
);

export const WinLogoWhite: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <rect x="2" y="2" width="9.5" height="9.5" rx="0.35" fill="#fff" />
    <rect x="12.5" y="2" width="9.5" height="9.5" rx="0.35" fill="#fff" />
    <rect x="2" y="12.5" width="9.5" height="9.5" rx="0.35" fill="#fff" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" rx="0.35" fill="#fff" />
  </svg>
);

const I8 = (id: string, s: number) => `https://img.icons8.com/fluency/${s}/${id}.png`;

const PngIc = (id: string, s0 = 96) => ({ size = 24, className = "" }) => (
  <img src={I8(id, s0)} width={size} height={size} className={`pointer-events-none select-none object-contain ${className}`} alt="" draggable={false} />
);

/* ---------- App / file icons ---------- */
export const EdgeIcon = PngIc("ms-edge-new", 96);
export const ExplorerIcon = PngIc("folder-invoices", 96); // Closer to Win11 two-tone
export const StoreIcon = PngIc("microsoft-store", 96);
export const SettingsIcon = PngIc("settings", 96);
export const NotepadIcon = PngIc("notepad", 96);
export const CalcIcon = PngIc("calculator", 96);
export const PhotosIcon = PngIc("pictures-folder", 96);
export const PaintIcon = PngIc("paint-palette", 96);
export const TerminalIcon = PngIc("console", 96);
export const ThisPCIcon = PngIc("monitor", 96);
export const RecycleIcon = PngIc("recycle-bin", 96);
export const DriveIcon = PngIc("hdd", 96);
export const HomeIcon = PngIc("home", 96);
export const FileTxtIcon = PngIc("txt", 96);
export const FileImgIcon = PngIc("image-file", 96);
export const FileIcon = PngIc("file", 96);
export const FolderIcon = ExplorerIcon;

export const GoogleG: Ic = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

/* ---------- Shell glyphs ---------- */
export const SearchIcon: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="10.5" cy="10.5" r="7.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15.6 15.6L20.6 20.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const TaskViewIcon: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3.2" y="4.2" width="8.2" height="15.6" rx="1.4" fill="#7BA7D9" />
    <rect x="13.4" y="4.2" width="7.4" height="7.3" rx="1.3" stroke="#7BA7D9" strokeWidth="1.5" />
    <rect x="13.4" y="12.7" width="7.4" height="7.1" rx="1.3" stroke="#7BA7D9" strokeWidth="1.5" />
  </svg>
);

export const WidgetsIcon: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <rect x="3" y="3" width="7" height="18" rx="1.5" fill="#3F8FE8" />
    <rect x="12" y="3" width="9" height="9" rx="1.5" stroke="#3F8FE8" strokeWidth="1.6" fill="none" />
    <rect x="12" y="14" width="9" height="7" rx="1.5" stroke="#3F8FE8" strokeWidth="1.6" fill="none" />
  </svg>
);

export const WeatherIcon: Ic = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
    <circle cx="18" cy="18" r="8" fill="#FFB828" />
    <g stroke="#FFB828" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 4v3M18 29v3M4 18h3M29 18h3M8.5 8.5l2 2M25.5 25.5l2 2M27.5 8.5l-2 2M10.5 25.5l-2 2" />
    </g>
    <path d="M18 36a8 8 0 0 1 1-15.9A11 11 0 0 1 40 24a7.5 7.5 0 0 1-2 15H18z" fill="#fff" stroke="#C9D6E6" strokeWidth="0.5" />
  </svg>
);

export const WifiGlyph: Ic = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2.4 7.2a11 11 0 0 1 15.2 0M5.2 10.2a7.4 7.4 0 0 1 9.6 0M8 13.1a3.9 3.9 0 0 1 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="15.8" r="1.5" fill="currentColor" />
  </svg>
);

export const VolGlyph: Ic = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M11 3.6L6.7 7H3.6A1.1 1.1 0 0 0 2.5 8.1v3.8A1.1 1.1 0 0 0 3.6 13h3.1L11 16.4a.6.6 0 0 0 1-.45V4.05a.6.6 0 0 0-1-.45z" fill="currentColor" />
    <path d="M14 7.2a4.2 4.2 0 0 1 0 5.6M15.8 5.4a7 7 0 0 1 0 9.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const BatteryGlyph: Ic = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 22 20" fill="none" className={className}>
    <rect x="1.5" y="6" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="3.4" y="7.9" width="9.2" height="4.2" rx="1" fill="currentColor" />
    <rect x="18.6" y="8.6" width="1.9" height="2.8" rx="1" fill="currentColor" />
  </svg>
);

export const CloudGlyph: Ic = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className}>
    <path d="M5.5 15.5a3.8 3.8 0 0 1-.4-7.6A5.2 5.2 0 0 1 15.2 9 3.4 3.4 0 0 1 14.5 15.7H5.5z" fill="#4EA2F0" />
  </svg>
);

export const ShieldGlyph: Ic = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className}>
    <path d="M10 1.8L3.5 4.2v5.1c0 4.3 2.8 7.4 6.5 8.9 3.7-1.5 6.5-4.6 6.5-8.9V4.2L10 1.8z" fill="#F5A623" />
    <path d="M10 1.8v16.4c3.7-1.5 6.5-4.6 6.5-8.9V4.2L10 1.8z" fill="#E8841B" opacity=".55" />
  </svg>
);

export const AvatarIcon: Ic = ({ size = 80, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs><linearGradient id="avg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#57B8F7" /><stop offset="1" stopColor="#1763D6" /></linearGradient></defs>
    <circle cx="32" cy="32" r="32" fill="url(#avg)" />
    <circle cx="32" cy="24" r="10.5" fill="#fff" opacity=".95" />
    <path d="M13 53c2.5-9.5 9.8-14.5 19-14.5S48.5 43.5 51 53a32 32 0 0 1-38 0z" fill="#fff" opacity=".95" />
  </svg>
);
