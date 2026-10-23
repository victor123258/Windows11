import { useEffect, useRef, useState } from "react";
import type { Win } from "../os/os";
import { useOS } from "../os/os";
import { GoogleResults as GoogleResultsLive, GoogleStart } from "./googleSearch";
import { GoogleG } from "../os/icons";
import { BLOOM_DARK_SRC } from "../os/media";
import {
  ArrowLeft, ArrowRight, RotateCw, Plus, X, Lock, Search,
  ExternalLink, Globe, MoreHorizontal, House, Star, Play, Music4,
  Film, MessageCircleMore, Code2, ShoppingBag, BriefcaseBusiness,
  Users, Headphones, Flame,
} from "lucide-react";

/* ------------------------------------------------------------------ */
interface Tab { id: string; hist: string[]; hi: number }
const tid = () => Math.random().toString(36).slice(2, 9);

type NavFn = (u: string) => void;

type Song = { id: string; title: string; artist: string; duration: string; views: string; year: string };
const YT_SONGS: Song[] = [
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", artist: "Rick Astley", duration: "3:33", views: "1.6B views", year: "1987" },
  { id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen Official", duration: "6:00", views: "1.9B views", year: "1975" },
  { id: "FTQbiNvZqaY", title: "Africa", artist: "Toto", duration: "4:31", views: "1.1B views", year: "1982" },
  { id: "djV11Xbc914", title: "Take On Me", artist: "a-ha", duration: "4:04", views: "2.0B views", year: "1985" },
  { id: "1k8craCGpgs", title: "Don't Stop Believin'", artist: "Journey", duration: "4:11", views: "1.2B views", year: "1981" },
  { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", duration: "5:02", views: "4.1B views", year: "2015" },
  { id: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", duration: "3:33", views: "3.7B views", year: "2015" },
  { id: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", duration: "4:24", views: "6.4B views", year: "2017" },
  { id: "RgKAFK5djSk", title: "See You Again", artist: "Wiz Khalifa ft. Charlie Puth", duration: "3:57", views: "6.0B views", year: "2015" },
  { id: "ktvTqknDobU", title: "Radioactive", artist: "Imagine Dragons", duration: "4:22", views: "1.6B views", year: "2012" },
];

function ytThumb(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }

function normalize(input: string): string {
  const v = input.trim();
  if (!v) return "about:newtab";
  if (v === "about:newtab" || v.startsWith("edge://")) return "about:newtab";
  if (/^https?:\/\//i.test(v)) return v;
  // domain-like (has a dot, no spaces) → direct navigation; otherwise Google search
  if (!v.includes(" ") && /^[a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(v) && v.includes(".")) return "https://" + v;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
}

const HOST_NAMES: Record<string, string> = {
  "google.com": "Google", "www.google.com": "Google", "youtube.com": "YouTube", "www.youtube.com": "YouTube",
  "www.openstreetmap.org": "OpenStreetMap", "openstreetmap.org": "OpenStreetMap",
  "example.com": "Example Domain", "example.org": "Example Domain",
  "bing.com": "Bing", "www.bing.com": "Bing", "en.wikipedia.org": "Wikipedia", "wikipedia.org": "Wikipedia",
  "github.com": "GitHub", "www.reddit.com": "Reddit", "reddit.com": "Reddit", "msn.com": "MSN", "www.msn.com": "MSN",
  "twitter.com": "Twitter", "x.com": "X", "www.facebook.com": "Facebook",
};

function pageTitle(url: string): string {
  if (url === "about:newtab") return "New tab";
  try {
    const u = new URL(url);
    if (HOST_NAMES[u.hostname]) return HOST_NAMES[u.hostname];
    return u.hostname.replace(/^www\./, "");
  } catch { return "New tab"; }
}

type Route = { kind: "ntp" | "gstart" | "gsearch" | "web"; q?: string };

function routeOf(url: string): Route {
  if (url === "about:newtab") return { kind: "ntp" };
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("google.com")) {
      const q = u.searchParams.get("q");
      if (u.pathname.startsWith("/search") && q) return { kind: "gsearch", q: q.slice(0, 140) };
      return { kind: "gstart" };
    }
  } catch { /* ignore */ }
  return { kind: "web" };
}

function routeTitle(url: string): string {
  const r = routeOf(url);
  if (r.kind === "gsearch" && r.q) return `${r.q} - Google Search`;
  if (r.kind === "gstart") return "Google";
  return pageTitle(url);
}

function FavIcon({ url }: { url: string }) {
  if (url === "about:newtab") return <span className="w-3.5 h-3.5 rounded-[3px] bg-gradient-to-br from-[#31d0aa] to-[#1b6fd9]" />;
  if (url.includes("google.com")) return <GoogleG size={13} />;
  if (url.includes("youtube.com"))
    return <span className="w-3.5 h-3 rounded-[3px] bg-[#f00] grid place-items-center"><span className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-px" /></span>;
  if (url.includes("bing.com")) return <span className="text-[9px] font-bold" style={{ color: "#0a6bd6" }}>B</span>;
  if (url.includes("wikipedia.org")) return <span className="w-4 h-4 rounded-full bg-[#202122] text-white grid place-items-center text-[8.5px] font-bold">W</span>;
  if (url.includes("openstreetmap")) return <Globe size={13} className="text-green-600" />;
  if (url.includes("github.com")) return <Globe size={13} className="text-black/70" />;
  return <Globe size={13} className="text-black/50" />;
}

/* ------------------------------------------------------------------ */
const NTP_TILES = [
  { name: "Google", url: "https://www.google.com", icon: <GoogleG size={24} /> },
  { name: "Maps", url: "https://www.openstreetmap.org/export/embed.html?bbox=-0.1357,51.4975,-0.1087,51.5065&layer=mapnik", icon: <Globe size={22} className="text-[#5fa04e]" /> },
  { name: "YouTube", url: "https://www.youtube.com", icon: <span className="w-6 h-[18px] rounded-[5px] bg-[#f00] grid place-items-center"><span className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" /></span> },
  { name: "Wikipedia", url: "https://www.wikipedia.org", icon: <span className="w-6 h-6 rounded-full bg-[#202122] text-white grid place-items-center text-[13px] font-bold">W</span> },
  { name: "Bing", url: "https://www.bing.com", icon: <span className="text-[19px] font-bold" style={{ color: "#0a6bd6" }}>B</span> },
  { name: "Example", url: "https://example.com", icon: <span className="text-[18px] font-bold text-[#607d8b]">E</span> },
];

const TRENDING = ["Windows 11", "Weather today", "AI news", "Best laptops 2026", "Mountain wallpapers", "React 19"];

function NewTabPage({ nav }: { nav: (u: string) => void }) {
  return (
    <div className="h-full overflow-y-auto winscroll relative"
      style={{ background: `url(${BLOOM_DARK_SRC}) center/cover` }}>
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-10 -mt-6">
        <form className="w-full max-w-[580px] flex items-center bg-white/95 backdrop-blur rounded-full h-12 pl-5 pr-2 gap-3 shadow-[0_12px_36px_rgba(0,0,0,.35)]"
          onSubmit={(e) => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value; if (v.trim()) nav(normalize(v)); }}>
          <GoogleG size={17} />
          <input name="q" placeholder="Search Google or type a URL" autoFocus className="flex-1 outline-none text-[15px] text-black/85 placeholder:text-black/40 bg-transparent" />
          <button type="submit" className="h-9 px-5 rounded-full text-white text-[13px] font-medium hover:brightness-110" style={{ background: "#1a73e8" }}>Search</button>
        </form>
        <div className="grid grid-cols-6 gap-3 mt-9 w-full max-w-[580px]">
          {NTP_TILES.map((t) => (
            <button key={t.name} onClick={() => nav(t.url)} className="flex flex-col items-center gap-1.5 group">
              <span className="w-14 h-14 rounded-2xl bg-white shadow-lg grid place-items-center transition-transform group-hover:scale-105 group-active:scale-95">{t.icon}</span>
              <span className="text-[11.5px] text-white drop-shadow">{t.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-9 w-full max-w-[580px]">
          <div className="text-white/90 text-[12.5px] font-medium mb-2.5 px-1 drop-shadow">Trending searches</div>
          <div className="flex flex-wrap gap-2.5">
            {TRENDING.map((s) => (
              <button key={s} onClick={() => nav(`https://www.google.com/search?q=${encodeURIComponent(s)}`)}
                className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[12px] border border-white/25 transition flex items-center gap-2">
                <Search size={11} className="opacity-75" />{s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
// Sites that block iframe embedding (X-Frame-Options / CSP)
const BLOCKED_SITES = [
  "youtube.com", "youtu.be", "twitter.com", "x.com", "facebook.com", "instagram.com",
  "linkedin.com", "reddit.com", "github.com", "amazon.com", "netflix.com", "twitch.tv",
  "spotify.com", "discord.com", "tiktok.com", "whatsapp.com", "stackoverflow.com",
  "medium.com", "apple.com", "microsoft.com", "mail.google.com", "drive.google.com",
  "docs.google.com", "accounts.google.com",
];

function isBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return BLOCKED_SITES.some(b => host === b || host.endsWith("." + b));
  } catch { return false; }
}

function getBrandColor(url: string): string {
  if (url.includes("youtube")) return "#FF0000";
  if (url.includes("twitter") || url.includes("x.com")) return "#111111";
  if (url.includes("reddit")) return "#FF4500";
  if (url.includes("github")) return "#24292e";
  if (url.includes("facebook")) return "#1877F2";
  if (url.includes("instagram")) return "#E4405F";
  if (url.includes("linkedin")) return "#0A66C2";
  if (url.includes("spotify")) return "#1DB954";
  if (url.includes("discord")) return "#5865F2";
  if (url.includes("twitch")) return "#9146FF";
  if (url.includes("netflix")) return "#E50914";
  if (url.includes("amazon")) return "#FF9900";
  return "#0078d4";
}

function siteActions(host: string, rawUrl: string) {
  const site = host.replace(/^www\./, "");
  const mk = (label: string, url: string) => ({ label, url });
  if (site.includes("github")) return [mk("Trending repos", "https://github.com/trending"), mk("Search React", "https://www.google.com/search?q=site:github.com+react"), mk("Open GitHub", rawUrl)];
  if (site.includes("reddit")) return [mk("Popular", "https://www.google.com/search?q=site:reddit.com+popular"), mk("r/technology", "https://www.google.com/search?q=site:reddit.com/r/technology"), mk("Open Reddit", rawUrl)];
  if (site.includes("spotify")) return [mk("Top songs", "https://www.google.com/search?q=spotify+top+songs"), mk("Playlists", "https://www.google.com/search?q=spotify+playlists"), mk("Open Spotify", rawUrl)];
  if (site.includes("netflix")) return [mk("Top 10", "https://www.google.com/search?q=netflix+top+10"), mk("New releases", "https://www.google.com/search?q=netflix+new+releases"), mk("Open Netflix", rawUrl)];
  if (site.includes("twitter") || site.includes("x.com")) return [mk("Trending topics", "https://www.google.com/search?q=twitter+trending"), mk("Latest posts", "https://www.google.com/search?q=site:x.com+latest"), mk("Open X", rawUrl)];
  if (site.includes("instagram")) return [mk("Explore", "https://www.google.com/search?q=instagram+explore"), mk("Popular reels", "https://www.google.com/search?q=instagram+reels"), mk("Open Instagram", rawUrl)];
  if (site.includes("linkedin")) return [mk("Jobs", "https://www.google.com/search?q=linkedin+jobs"), mk("Companies", "https://www.google.com/search?q=linkedin+companies"), mk("Open LinkedIn", rawUrl)];
  if (site.includes("amazon")) return [mk("Deals", "https://www.google.com/search?q=amazon+deals"), mk("Best sellers", "https://www.google.com/search?q=amazon+best+sellers"), mk("Open Amazon", rawUrl)];
  if (site.includes("facebook")) return [mk("Open Facebook", rawUrl), mk("Latest news", "https://www.google.com/search?q=facebook+news"), mk("Help center", "https://www.google.com/search?q=facebook+help" )];
  return [mk("Search the site", `https://www.google.com/search?q=site:${site}`), mk("Latest news", `https://www.google.com/search?q=${site}+news`), mk(`Open ${site}`, rawUrl)];
}

function siteGlyph(host: string) {
  const site = host.replace(/^www\./, "");
  if (site.includes("github")) return <Code2 size={26} />;
  if (site.includes("reddit")) return <MessageCircleMore size={26} />;
  if (site.includes("netflix")) return <Film size={26} />;
  if (site.includes("spotify")) return <Headphones size={26} />;
  if (site.includes("amazon")) return <ShoppingBag size={26} />;
  if (site.includes("linkedin")) return <BriefcaseBusiness size={26} />;
  if (site.includes("discord") || site.includes("facebook") || site.includes("instagram") || site.includes("twitter") || site.includes("x.com")) return <Users size={26} />;
  return <Globe size={26} />;
}

function YouTubeHub({ url, nav }: { url: string; nav: NavFn }) {
  let query = "";
  try {
    const u = new URL(url);
    query = u.searchParams.get("search_query") || u.searchParams.get("q") || "";
  } catch { /* ignore */ }
  const list = query
    ? YT_SONGS.filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(query.toLowerCase()))
    : YT_SONGS;
  const shown = list.length ? list : YT_SONGS;

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] text-white select-ok overflow-y-auto winscroll-dk winscroll">
      <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-none">
          <span className="w-8 h-6 rounded-md bg-[#ff0000] grid place-items-center"><Play size={15} fill="white" strokeWidth={0} className="ml-0.5 text-white" /></span>
          <span className="text-[18px] font-medium tracking-tight">YouTube</span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value; nav(`https://www.youtube.com/results?search_query=${encodeURIComponent(v)}`); }} className="flex-1 max-w-[640px] flex items-center gap-0">
          <input name="q" defaultValue={query} placeholder="Search music, artists, videos"
            className="h-10 flex-1 rounded-l-full bg-[#121212] border border-white/15 px-4 outline-none text-[14px]" />
          <button className="h-10 w-16 rounded-r-full bg-[#222] border border-l-0 border-white/15 grid place-items-center hover:bg-[#2b2b2b] transition"><Search size={16} /></button>
        </form>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center gap-2 text-[#ff0000] mb-4"><Music4 size={18} /><span className="text-[13px] font-medium uppercase tracking-wide">Songs</span></div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {shown.map((song) => (
            <button key={song.id} onClick={() => nav(`https://www.youtube.com/watch?v=${song.id}`)} className="group rounded-xl overflow-hidden bg-[#181818] hover:bg-[#202020] transition text-left">
              <div className="relative aspect-video overflow-hidden bg-black">
                <img src={ytThumb(song.id)} alt={song.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-300" loading="lazy" />
                <span className="absolute right-2 bottom-2 bg-black/80 px-1.5 py-0.5 rounded text-[11px]">{song.duration}</span>
                <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition bg-black/20"><span className="w-12 h-12 rounded-full bg-red-600/90 grid place-items-center"><Play size={18} fill="white" strokeWidth={0} className="ml-0.5 text-white" /></span></span>
              </div>
              <div className="p-3">
                <div className="text-[14px] font-medium leading-snug line-clamp-2">{song.title}</div>
                <div className="text-[12px] text-white/65 mt-1 truncate">{song.artist}</div>
                <div className="text-[11.5px] text-white/45 mt-1">{song.views} · {song.year}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[15px] font-medium">Play any YouTube video inside the browser</div>
            <div className="text-[12.5px] text-white/60 mt-1">Paste a YouTube video link or click any song above. Direct video links open as full embeds.</div>
          </div>
          <button onClick={() => window.open("https://www.youtube.com", "_blank")} className="h-10 px-4 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 flex items-center gap-2 flex-none">
            <ExternalLink size={14} /> Open YouTube
          </button>
        </div>
      </div>
    </div>
  );
}

function SiteHub({ url, nav }: { url: string; nav: NavFn }) {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } })();
  const brandName = HOST_NAMES[host] || HOST_NAMES["www." + host] || host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
  const color = getBrandColor(url);
  const actions = siteActions(host, url);

  return (
    <div className="h-full overflow-y-auto bg-[#f6f7f9] text-[#1b1b1b] select-ok">
      <div className="max-w-[980px] mx-auto px-8 py-8">
        <div className="rounded-[28px] overflow-hidden bg-white shadow-[0_10px_40px_rgba(0,0,0,.08)] border border-black/[.06]">
          <div className="px-8 py-8 text-white" style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 65%, #ffffff))` }}>
            <div className="w-16 h-16 rounded-2xl bg-white/18 border border-white/20 grid place-items-center mb-5">{siteGlyph(host)}</div>
            <h1 className="text-[32px] font-semibold tracking-tight">{brandName}</h1>
            <p className="text-white/85 text-[14px] mt-2 max-w-[560px] leading-relaxed">
              This site blocks loading inside other web pages. You can still jump to common areas, search it from here, or open the real site in a new tab.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => window.open(url, "_blank")} className="h-10 px-5 rounded-full bg-white text-black text-[13.5px] font-medium hover:bg-white/90 flex items-center gap-2">
                <ExternalLink size={14} /> Open {brandName}
              </button>
              <button onClick={() => nav(`https://www.google.com/search?q=site:${encodeURIComponent(host)}`)} className="h-10 px-5 rounded-full bg-white/15 border border-white/25 text-[13.5px] font-medium hover:bg-white/25 flex items-center gap-2">
                <Search size={14} /> Search {brandName}
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-black/45 mb-3 flex items-center gap-2"><Flame size={14} /> Popular destinations</div>
            <div className="grid md:grid-cols-3 gap-4">
              {actions.map((a) => (
                <button key={a.label} onClick={() => a.url === url || a.url.startsWith("https://") && (a.url.includes(host.replace(/^www\./, "")) && !a.url.includes("google.com")) ? window.open(a.url, "_blank") : nav(a.url)}
                  className="group p-4 rounded-2xl bg-[#f8f9fb] hover:bg-[#f1f4f8] border border-black/[.06] text-left transition">
                  <div className="text-[14px] font-medium text-[#1b1b1b]">{a.label}</div>
                  <div className="text-[12px] text-black/50 mt-1 line-clamp-2">{a.url.replace(/^https?:\/\//, "")}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="h-full bg-black flex items-center justify-center">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title="YouTube video player"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function WebFrame({ url, nav }: { url: string; nav: NavFn }) {
  // Intercept YouTube URLs
  try {
    const u = new URL(url);
    const isYT = u.hostname === "www.youtube.com" || u.hostname === "youtube.com" || u.hostname === "youtu.be";
    if (isYT) {
      // Direct video: /watch?v=ID
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        if (v) return <YouTubeEmbed videoId={v} />;
      }
      // Short URL: youtu.be/ID
      if (u.hostname === "youtu.be" && u.pathname.length > 1) {
        return <YouTubeEmbed videoId={u.pathname.slice(1)} />;
      }
      // Embed URL already: /embed/ID
      if (u.pathname.startsWith("/embed/")) {
        return <YouTubeEmbed videoId={u.pathname.replace("/embed/", "").split("?")[0]} />;
      }
      // Any other YouTube page (homepage, channel, results, etc.)
      return <YouTubeHub url={url} nav={nav} />;
    }
  } catch { /* ignore */ }

  // Other blocked sites get a branded hub
  if (isBlocked(url)) return <SiteHub url={url} nav={nav} />;

  // Everything else: real iframe
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setLoading(true); setFailed(false);
    const t = setTimeout(() => { setLoading(false); setFailed(true); }, 10000);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div className="h-full relative bg-white">
      {loading && !failed && (
        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-4 px-6">
          <svg width="36" height="36" viewBox="0 0 40 40" className="boot-ring">
            <circle cx="20" cy="20" r="16" style={{ stroke: "#0078d4" }} />
          </svg>
          <span className="text-[13px] text-black/50">Loading {url.replace(/^https?:\/\//, "").split("/")[0]}…</span>
        </div>
      )}
      {failed && <SiteHub url={url} nav={nav} />}
      {!failed && (
        <iframe
          src={url} title="web"
          className="w-full h-full border-0 select-ok"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
          referrerPolicy="no-referrer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function Edge({ win }: { win: Win }) {
  const os = useOS();
  const dk = os.dark;
  const initial = (win.props?.url as string) || "about:newtab";
  const [tabs, setTabs] = useState<Tab[]>([{ id: tid(), hist: [initial], hi: 0 }]);
  const [active, setActive] = useState(0);
  const [addr, setAddr] = useState(initial);
  const [reloadKey, setReloadKey] = useState(0);
  const lastPropT = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tab = tabs[Math.min(active, tabs.length - 1)];
  const curUrl = tab.hist[tab.hi];
  useEffect(() => {
    if (curUrl === "about:newtab") { setAddr(""); return; }
    const route = routeOf(curUrl);
    if (route.kind === "gsearch" && route.q) setAddr(`https://www.google.com/search?q=${encodeURIComponent(route.q)}`);
    else setAddr(curUrl.replace(/^https?:\/\//, ""));
  }, [curUrl]);

  // external navigation request (openApp('edge', {url}))
  useEffect(() => {
    const t = win.props?._t as number | undefined;
    const u = win.props?.url as string | undefined;
    if (t && u && t !== lastPropT.current) { lastPropT.current = t; nav(u); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.props]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (os.activeId === win.id && e.ctrlKey && e.key.toLowerCase() === "l") { e.preventDefault(); inputRef.current?.select(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [os.activeId, win.id]);

  const setTab = (fn: (t: Tab) => Tab) => setTabs((ts) => ts.map((t, i) => (i === active ? fn(t) : t)));

  const nav = (url: string) => {
    const n = normalize(url);
    setTab((t) => {
      const h = [...t.hist.slice(0, t.hi + 1), n];
      return { ...t, hist: h, hi: h.length - 1 };
    });
    setReloadKey((k) => k + 1);
  };
  const goBack = () => { if (tab.hi > 0) { setTab((t) => ({ ...t, hi: t.hi - 1 })); setReloadKey((k) => k + 1); } };
  const goFwd = () => { if (tab.hi < tab.hist.length - 1) { setTab((t) => ({ ...t, hi: t.hi + 1 })); setReloadKey((k) => k + 1); } };
  const reload = () => setReloadKey((k) => k + 1);

  const addTab = () => { setTabs((ts) => [...ts, { id: tid(), hist: ["about:newtab"], hi: 0 }]); setActive(tabs.length); };
  const closeTab = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs((ts) => {
      const nt = ts.filter((_, x) => x !== i);
      if (!nt.length) { setTimeout(() => os.closeWin(win.id)); return ts; }
      return nt;
    });
    if (i <= active && active > 0) setActive(active - 1);
    else if (i === active) setActive(Math.min(active, tabs.length - 2));
  };

  const chrome = dk ? "bg-[#333] text-white/85" : "bg-[#dbe1e8] text-black/80";
  const route = routeOf(curUrl);
  const page = route.kind === "ntp" ? <NewTabPage key={reloadKey} nav={nav} />
    : route.kind === "gstart" ? <GoogleStart key={reloadKey} nav={nav} />
    : route.kind === "gsearch" ? <GoogleResultsLive key={(route.q || "g") + reloadKey} q={route.q || ""} nav={nav} />
    : <WebFrame key={curUrl + reloadKey} url={curUrl} nav={nav} />;

  return (
    <div className={`h-full flex flex-col ${chrome}`}>
      {/* tab strip */}
      <div className="flex items-end gap-1 pl-2.5 pr-2 pt-1.5 flex-none">
        <div className="flex-1 flex items-end gap-1 overflow-x-auto winscroll min-w-0">
          {tabs.map((t, i) => {
            const url = t.hist[t.hi];
            const isA = i === active;
            return (
              <button key={t.id} onClick={() => setActive(i)}
                className={`group relative flex items-center gap-2 pl-3 pr-7 h-[34px] min-w-[140px] max-w-[200px] flex-none rounded-t-lg text-[12px] transition
                  ${isA ? (dk ? "edge-tab-active-dk bg-[#505050]" : "edge-tab-active") : dk ? "hover:bg-white/[.08]" : "hover:bg-white/50"}`}>
                <FavIcon url={url} />
                <span className={`truncate flex-1 text-left ${isA ? (dk ? "text-white" : "text-black/85") : (dk ? "text-white/60" : "text-black/60")}`}>{routeTitle(url)}</span>
                <span role="button" tabIndex={-1} onClick={(e) => closeTab(i, e)}
                  className={`absolute right-1.5 w-5 h-5 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 transition
                    ${dk ? "hover:bg-white/15" : "hover:bg-black/[.1]"} ${isA ? "opacity-60" : ""}`}>
                  <X size={11} />
                </span>
              </button>
            );
          })}
          <button onClick={addTab} className={`w-8 h-[30px] grid place-items-center rounded-md flex-none mb-0.5 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.07]"}`}><Plus size={15} /></button>
        </div>
        <MoreHorizontal size={16} className={`mb-2.5 ml-1 flex-none ${dk ? "text-white/50" : "text-black/45"}`} />
      </div>

      {/* toolbar */}
      <div className={`flex items-center gap-1 px-2.5 h-11 flex-none ${dk ? "bg-[#505050]" : "bg-white"}`}>
        <button onClick={goBack} disabled={tab.hi <= 0} className={`w-8 h-8 grid place-items-center rounded-full disabled:opacity-30 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`}><ArrowLeft size={16} /></button>
        <button onClick={goFwd} disabled={tab.hi >= tab.hist.length - 1} className={`w-8 h-8 grid place-items-center rounded-full disabled:opacity-30 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`}><ArrowRight size={16} /></button>
        <button onClick={reload} className={`w-8 h-8 grid place-items-center rounded-full ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`}><RotateCw size={14} /></button>
        <button onClick={() => nav("https://www.google.com")} className={`w-8 h-8 grid place-items-center rounded-full ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`}><House size={15} /></button>
        <form className="flex-1 mx-1.5" onSubmit={(e) => { e.preventDefault(); nav(addr); inputRef.current?.blur(); }}>
          <div className={`flex items-center gap-2 h-[34px] px-3.5 rounded-full border shadow-[0_1px_3px_rgba(0,0,0,.1)] focus-within:ring-2 focus-within:ring-[#1a73e8]/60 transition
            ${dk ? "bg-[#3a3a3a] border-white/[.12]" : "bg-white border-black/[.12]"}`}>
            {curUrl !== "about:newtab" ? <Lock size={12} className="text-black/45 flex-none" /> : <Search size={13} className="text-black/45 flex-none" />}
            <input
              ref={inputRef}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Search Google or type a URL"
              spellCheck={false}
              className="flex-1 bg-transparent outline-none text-[13px] min-w-0 select-ok"
            />
            {curUrl !== "about:newtab" && (
              <span role="button" tabIndex={-1} onClick={() => window.open(curUrl, "_blank")} title="Open in real browser"
                className={`cursor-pointer p-1 rounded-full flex-none ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`}><ExternalLink size={12} className="text-black/45" /></span>
            )}
          </div>
        </form>
        <button className={`w-8 h-8 grid place-items-center rounded-full ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} title="Favorites"><Star size={14} /></button>
      </div>

      {/* page */}
      <div className="flex-1 min-h-0 bg-white text-black/85 relative">{page}</div>
    </div>
  );
}
