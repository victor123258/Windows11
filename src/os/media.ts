// Windows 11 wallpapers — served from reliable CDN/archive URLs
export interface Wallpaper { id: string; name: string; src: string; dark?: boolean }

// Direct URLs to official Microsoft Windows 11 wallpapers hosted on archive.org
const ARC = "https://archive.org/download/all-windows-11-wallpapers";

export const WALLPAPERS: Wallpaper[] = [
  { id: "bloom-dark",       name: "Windows Bloom (Dark)",     src: `${ARC}/img19.jpg`,  dark: true  },
  { id: "bloom-light",      name: "Windows Bloom (Light)",    src: `${ARC}/img0.jpg`                },
  { id: "captured-motion",  name: "Captured Motion",          src: `${ARC}/img20.jpg`               },
  { id: "glow",             name: "Glow",                     src: `${ARC}/img24.jpg`,   dark: true  },
  { id: "sunrise",          name: "Sunrise",                  src: `${ARC}/img28.jpg`                },
  { id: "flow",             name: "Flow",                     src: `${ARC}/img32.jpg`                },
];

export const LOCKSCREEN_SRC = `${ARC}/img19.jpg`;
export const BLOOM_DARK_SRC = `${ARC}/img19.jpg`;

// Pexels stock images used inside the Photos app gallery
export const STOCK = {
  tian:     "https://images.pexels.com/photos/39894311/pexels-photo-39894311.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  peaks:    "https://images.pexels.com/photos/34408978/pexels-photo-34408978.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  zakopane: "https://images.pexels.com/photos/4125919/pexels-photo-4125919.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  sunrise:  "https://images.pexels.com/photos/2792092/pexels-photo-2792092.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  forest:   "https://images.pexels.com/photos/592077/pexels-photo-592077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  valley:   "https://images.pexels.com/photos/16548620/pexels-photo-16548620.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  alps:     "https://images.pexels.com/photos/40340379/pexels-photo-40340379.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  fagaras:  "https://images.pexels.com/photos/18883514/pexels-photo-18883514.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const STOCK_LIST = [
  { src: STOCK.tian,     name: "Tian Shan.jpg"       },
  { src: STOCK.peaks,    name: "Rugged Peaks.jpg"    },
  { src: STOCK.sunrise,  name: "Sunrise.jpg"         },
  { src: STOCK.forest,   name: "Golden Forest.jpg"   },
  { src: STOCK.valley,   name: "Sunny Valley.jpg"    },
  { src: STOCK.alps,     name: "Alpine Autumn.jpg"   },
  { src: STOCK.fagaras,  name: "Fagaras.jpg"         },
  { src: STOCK.zakopane, name: "Zakopane.png"        },
];
