/**
 * Jeu d'icônes du simulateur, dessiné pour l'occasion sur une grille 24 × 24.
 * Tracés en ligne (stroke = currentColor) ; les éléments pleins portent la classe « f ».
 * Ajouter une icône : une entrée ici, puis <Icon name="..." /> partout.
 */
const f = 'class="f"'

const fanBlade = 'M12 10.2c-.4-2.6.2-5.6 2.3-6.4 2.4-.9 3.6 1.6 2.4 3.6-.9 1.6-2.6 2.6-4.7 2.8'
const wave = (x: number, y1 = 15.5) =>
  `<path d="M${x} ${y1}c-.9-1 .9-2 0-3s.9-2 0-3"/>`
const seat =
  '<path d="M5.6 4.3a1.6 1.6 0 0 1 3.1-.5l2.4 8.7h5.4a2 2 0 0 1 2 2v.6a1.6 1.6 0 0 1-1.6 1.6H10.5a2.2 2.2 0 0 1-2.1-1.6z"/><path d="M10.5 20h7.5M13.5 16.7V20"/>'
const person =
  '<g transform="translate(2 0)"><circle cx="15" cy="4.6" r="1.7"/><path d="M15.4 7.6 14.2 13.6H10l-.7 6.4"/><path d="M14.2 13.6 17 14.5"/></g>'
const handset =
  'M6.6 3.5h2.6l1.5 4.2-2 1.4a11 11 0 0 0 6.2 6.2l1.4-2 4.2 1.5v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z'
const speaker = '<path d="M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4z"/>'

export const ICONS = {
  // ----- Système et barre d'état -----
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20 20"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.6a2.2 2.2 0 0 0 4 0"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.6"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.4"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2.6"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.6M12 14.5v2.4"/>',
  bluetooth: '<path d="m7 7.6 10 8.9-5 4.5V3l5 4.5-10 8.9"/>',
  wifi: `<path d="M2.6 9.2a14 14 0 0 1 18.8 0M5.6 12.5a9.5 9.5 0 0 1 12.8 0M8.7 15.7a5 5 0 0 1 6.6 0"/><circle ${f} cx="12" cy="19" r="1.3"/>`,
  signal: `<rect ${f} x="3" y="15" width="3" height="5" rx="1"/><rect ${f} x="8" y="11.5" width="3" height="8.5" rx="1"/><rect ${f} x="13" y="8" width="3" height="12" rx="1"/><rect ${f} x="18" y="4" width="3" height="16" rx="1"/>`,
  volume: `${speaker}<path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2"/>`,
  'volume-mute': `${speaker}<path d="m16 9.5 5 5m0-5-5 5"/>`,
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.2a7.5 7.5 0 0 1 15 0"/>',
  more: `<circle ${f} cx="5.5" cy="12" r="1.7"/><circle ${f} cx="12" cy="12" r="1.7"/><circle ${f} cx="18.5" cy="12" r="1.7"/>`,
  update: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5v8M8.6 12.4l3.4 3.4 3.4-3.4"/>',
  hotspot: `<circle ${f} cx="12" cy="12" r="1.8"/><path d="M8.6 15.4a4.8 4.8 0 0 1 0-6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8M5.7 18.3a8.9 8.9 0 0 1 0-12.6M18.3 5.7a8.9 8.9 0 0 1 0 12.6"/>`,
  'apps-grid': `<rect ${f} x="4" y="4" width="7" height="7" rx="2.2"/><rect ${f} x="13" y="4" width="7" height="7" rx="2.2"/><rect ${f} x="4" y="13" width="7" height="7" rx="2.2"/><rect ${f} x="13" y="13" width="7" height="7" rx="2.2"/>`,
  window: '<rect x="8" y="3.5" width="12.5" height="12.5" rx="2.4"/><path d="M16 20.5H6A2.5 2.5 0 0 1 3.5 18V8"/>',
  split: '<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><path d="M12 4.5v15"/>',
  swap: '<path d="M6.5 8h13m-3.2-3.2L19.5 8l-3.2 3.2M17.5 16h-13m3.2-3.2L4.5 16l3.2 3.2"/>',
  grip: `<circle ${f} cx="9" cy="6" r="1.4"/><circle ${f} cx="15" cy="6" r="1.4"/><circle ${f} cx="9" cy="12" r="1.4"/><circle ${f} cx="15" cy="12" r="1.4"/><circle ${f} cx="9" cy="18" r="1.4"/><circle ${f} cx="15" cy="18" r="1.4"/>`,
  'chevron-down': '<path d="m6 9.5 6 6 6-6"/>',
  'chevron-up': '<path d="m6 14.5 6-6 6 6"/>',
  'chevron-left': '<path d="m14.5 6-6 6 6 6"/>',
  'chevron-right': '<path d="m9.5 6 6 6-6 6"/>',
  'arrow-left': '<path d="M19.5 12h-15m6-6-6 6 6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.3 2.6 2.6 5-5.2"/>',
  info: `<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.5"/><circle ${f} cx="12" cy="7.8" r="1.2"/>`,
  warning: '<path d="M12 3.6 21.4 20H2.6z"/><path d="M12 9.5v5"/><path d="M12 17.4v.2"/>',
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5v4h4M12 8v4.3l3 2"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
  'rotate-ccw': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4.2h4.2"/>',
  'rotate-cw': '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
  power: '<path d="M12 3.5v8"/><path d="M7.2 6.6a7 7 0 1 0 9.6 0"/>',
  key: '<circle cx="8" cy="15.5" r="4"/><path d="m11 12.5 8.5-8.5M16.5 7l2.5 2.5M14 9.5l2 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6"/>',
  moon: '<path d="M19.5 14.6A7.6 7.6 0 0 1 9.4 4.5a7.6 7.6 0 1 0 10.1 10.1z"/>',
  'sun-moon': '<path d="M12 3a9 9 0 0 0 0 18z"/><path d="M12 3a9 9 0 0 1 0 18"/><path d="M16.5 12a4.5 4.5 0 0 1-4.5 4.5"/>',
  monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2.2"/><path d="M9 20h6M12 16.5V20"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6S9.6 5.8 12 3.4z"/>',
  toggle: `<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle ${f} cx="16.5" cy="12" r="3"/>`,
  'hard-drive': `<rect x="3.5" y="13" width="17" height="7" rx="2"/><path d="M5.6 13 8 5.6h8l2.4 7.4"/><circle ${f} cx="16.5" cy="16.5" r="1.1"/>`,
  'shield-check': '<path d="M12 3.2 19 6v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.1-4.3"/>',
  shield: '<path d="M12 3.2 19 6v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3.5 11.6a1.8 1.8 0 0 1 3.5.6v2h10v-2a1.8 1.8 0 0 1 3.5-.6V17h-17z"/><path d="M5.5 17v2M18.5 17v2"/>',
  sliders: `<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>`,
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  send: '<path d="M4 11.8 20 4l-4.2 16-4-6.2z"/><path d="m11.8 13.8 8-9.6"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8"/>',
  camera: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  book: '<path d="M12 6.6C10 5 7 4.5 3.5 5v13.2c3.5-.5 6.5 0 8.5 1.6 2-1.6 5-2.1 8.5-1.6V5C17 4.5 14 5 12 6.6z"/><path d="M12 6.6v13.2"/>',
  bag: '<path d="M5 8.2h14l-1 12.3H6z"/><path d="M9 10V7.3a3 3 0 0 1 6 0V10"/>',
  'bag-smile': '<path d="M4.8 8h14.4l-1.1 12.5H5.9z"/><path d="M8.6 12.2a3.4 3.4 0 0 0 6.8 0M9.2 8V6.6a2.8 2.8 0 0 1 5.6 0V8"/>',
  gleo: '<path d="M18.2 8.2a7.2 7.2 0 1 0 1 4.6h-6.4"/>',
  sparkle: '<path d="M12 3.5c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7z"/>',
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  disc: `<circle cx="12" cy="12" r="8.6"/><circle ${f} cx="12" cy="12" r="1.8"/>`,
  smartphone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 18.5h3"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
  'bar-chart': '<path d="M4 20h16M7 16.5V11M12 16.5V6M17 16.5v-8"/>',

  // ----- Navigation -----
  navigation: '<path d="M20.2 3.8 3.8 10.9l7 2.2 2.3 7.1z"/>',
  'nav-arrow': `<path ${f} d="M12 3.4 18.6 19.6 12 15.8 5.4 19.6z"/>`,
  home: '<path d="M4 10.6 12 4l8 6.6V19.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/>',
  building: '<rect x="5" y="3.5" width="14" height="17" rx="1.6"/><path d="M9 8h1.6M13.4 8H15M9 11.6h1.6M13.4 11.6H15M9 15.2h1.6M13.4 15.2H15M10.5 20.5V18h3v2.5"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  'star-filled': `<path ${f} d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>`,
  bolt: '<path d="M13 2.6 5.6 13.4H12l-1 8 7.4-10.8H12z"/>',
  parking: '<path d="M8 20.5v-17h5.6a4.8 4.8 0 0 1 0 9.6H8"/>',
  settings:
    '<circle cx="12" cy="12" r="3.1"/><path d="M10.3 3.4h3.4l.5 2.4 1.7 1 2.3-.8 1.7 2.9-1.8 1.6v2l1.8 1.6-1.7 2.9-2.3-.8-1.7 1-.5 2.4h-3.4l-.5-2.4-1.7-1-2.3.8-1.7-2.9L5.6 13v-2L3.8 9.4l1.7-2.9 2.3.8 1.7-1z"/>',
  traffic: '<rect x="8" y="2.6" width="8" height="18.8" rx="4"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>',
  map: '<path d="M3.5 6.6 9 4l6 2.6L20.5 4v13.4L15 20l-6-2.6-5.5 2.6z"/><path d="M9 4v13.4M15 6.6V20"/>',
  locate: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6V6M12 18v3.4M2.6 12H6M18 12h3.4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  flag: '<path d="M5.5 21V4M5.5 4.6h11l-2.4 4 2.4 4h-11"/>',
  'turn-right': '<path d="M7 20.5v-8a4 4 0 0 1 4-4h8.5"/><path d="m15.6 4.6 3.9 3.9-3.9 3.9"/>',
  'turn-left': '<path d="M17 20.5v-8a4 4 0 0 0-4-4H4.5"/><path d="M8.4 4.6 4.5 8.5l3.9 3.9"/>',
  straight: '<path d="M12 20.5V4M7.6 8.4 12 4l4.4 4.4"/>',
  arrive: '<path d="M6 21V4.2M6 4.6h11.5l-2.6 4.2 2.6 4.2H6"/>',
  'charge-station':
    '<path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v15.5M3.5 20.5h12M14 9.5h1.8a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 0 3 0V8.2l-2.5-2.6"/><path d="m10.2 7.4-2 3.6h3l-2 3.6"/>',

  // ----- Médias et téléphone -----
  play: `<path ${f} d="M8 5.2v13.6l11-6.8z"/>`,
  pause: `<rect ${f} x="6.4" y="5" width="4" height="14" rx="1.3"/><rect ${f} x="13.6" y="5" width="4" height="14" rx="1.3"/>`,
  prev: `<path ${f} d="M18 6.2v11.6L9.6 12z"/><rect ${f} x="5.6" y="6" width="2.6" height="12" rx="1.1"/>`,
  next: `<path ${f} d="M6 6.2v11.6l8.4-5.8z"/><rect ${f} x="15.8" y="6" width="2.6" height="12" rx="1.1"/>`,
  music: '<path d="M9 18V6.2l10-2v11.6"/><circle cx="6.6" cy="18" r="2.5"/><circle cx="16.6" cy="15.8" r="2.5"/>',
  radio: `<circle ${f} cx="12" cy="10" r="1.9"/><path d="M12 12v8.5M8.7 13.3a4.7 4.7 0 0 1 0-6.6M15.3 6.7a4.7 4.7 0 0 1 0 6.6M5.9 16.1a8.7 8.7 0 0 1 0-12.2M18.1 3.9a8.7 8.7 0 0 1 0 12.2"/>`,
  'audio-lines': '<path d="M4 10v4M8 6.5v11M12 9v6M16 4.5v15M20 10v4"/>',
  phone: `<path d="${handset}"/>`,
  'phone-in': `<path d="${handset}"/><path d="M15 4v5h5M20.2 3.8 15 9"/>`,
  'phone-out': `<path d="${handset}"/><path d="M15.4 3.8h4.8v4.8M20.2 3.8 15 9"/>`,
  'phone-missed': `<path d="${handset}"/><path d="m15 3.8 5.2 5.2M20.2 3.8 15 9"/>`,
  'phone-off':
    '<path d="M3.3 13.6c4.6-4.1 12.8-4.1 17.4 0l-1.5 3-3.6-1.1-.4-2.6a8.6 8.6 0 0 0-5.4 0l-.4 2.6-3.6 1.1z"/>',
  message: '<path d="M4.5 5.5h15a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H10l-4.5 3.5V17h-1a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z"/>',
  keypad: `<circle ${f} cx="7" cy="5.5" r="1.4"/><circle ${f} cx="12" cy="5.5" r="1.4"/><circle ${f} cx="17" cy="5.5" r="1.4"/><circle ${f} cx="7" cy="10.5" r="1.4"/><circle ${f} cx="12" cy="10.5" r="1.4"/><circle ${f} cx="17" cy="10.5" r="1.4"/><circle ${f} cx="7" cy="15.5" r="1.4"/><circle ${f} cx="12" cy="15.5" r="1.4"/><circle ${f} cx="17" cy="15.5" r="1.4"/><circle ${f} cx="12" cy="20.5" r="1.4"/>`,
  backspace: '<path d="M8.6 5.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8.6L3 12z"/><path d="m11.6 9.5 5 5m0-5-5 5"/>',

  // ----- Climatisation -----
  fan: `<circle cx="12" cy="12" r="1.7"/><path d="${fanBlade}"/><path transform="rotate(90 12 12)" d="${fanBlade}"/><path transform="rotate(180 12 12)" d="${fanBlade}"/><path transform="rotate(270 12 12)" d="${fanBlade}"/>`,
  snowflake: '<path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6"/><path d="m9.6 4.4 2.4 2 2.4-2M9.6 19.6l2.4-2 2.4 2M4.6 10.6l2.9-1.1-.5-3M19.4 13.4l-2.9 1.1.5 3M19.4 10.6l-2.9-1.1.5-3M4.6 13.4l2.9 1.1-.5 3"/>',
  'seat-heat': `${seat}${wave(15.2, 9.6)}${wave(18.6, 9.6)}`.replace(/c-\.9-1 \.9-2 0-3s\.9-2 0-3/g, 'c-.8-.9.8-1.8 0-2.7s.8-1.8 0-2.7'),
  'seat-vent': `${seat}<path d="M15 9V3.6M13.4 5.2 15 3.6l1.6 1.6M19 9V3.6M17.4 5.2 19 3.6l1.6 1.6"/>`,
  'wheel-heat':
    '<circle cx="10" cy="13.5" r="6.8"/><circle cx="10" cy="13.5" r="1.9"/><path d="M3.3 12.5h4.9M11.8 12.5h4.9M10 15.4v4.9"/><path d="M18.6 9.5c-.8-.9.8-1.8 0-2.7s.8-1.8 0-2.7M21.4 9.5c-.8-.9.8-1.8 0-2.7s.8-1.8 0-2.7"/>',
  'defrost-front': `<path d="M2.8 8.8C5.6 7.1 8.7 6.3 12 6.3s6.4.8 9.2 2.5l-2.1 9.6c-2.2-.9-4.6-1.4-7.1-1.4s-4.9.5-7.1 1.4z"/>${wave(8.6)}${wave(12)}${wave(15.4)}`,
  'defrost-rear': `<rect x="3" y="5" width="18" height="12.5" rx="2.6"/>${wave(8.6, 14.8)}${wave(12, 14.8)}${wave(15.4, 14.8)}<path d="M8.6 20.4h6.8"/>`,
  recirc: '<path d="M2.6 17h18.8M4.2 17v-3.4l2.4-4.4h10.8l2.4 4.4V17"/><path d="M14.6 15.1H9.4a1.9 1.9 0 1 1 0-3.8h5.8"/><path d="m13.5 9.6 1.7 1.7-1.7 1.7"/>',
  'air-face': `${person}<path d="M2.8 7.2h6.4M7 5.2l2.2 2-2.2 2"/>`,
  'air-feet': `${person}<path d="M2.8 18.4h4.6M5.2 16.4l2.2 2-2.2 2"/>`,
  'air-both': `${person}<path d="M2.8 7.2h6.4M7 5.2l2.2 2-2.2 2M2.8 18.4h4.6M5.2 16.4l2.2 2-2.2 2"/>`,
  'air-defrost': `${person}<path d="M2.8 18.4h4.6M5.2 16.4l2.2 2-2.2 2M5 12V4.4M3 6.4l2-2 2 2"/>`,
  leaf: '<path d="M5 19c0-8 5-13.4 14.5-14.4C19 14 13.4 19 5 19z"/><path d="m5 19 8-8"/>',
  thermometer: '<path d="M10 13.6V5a2 2 0 0 1 4 0v8.6a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',

  // ----- Véhicule -----
  'car-front': `<path d="M4.6 12.4 6.5 7a2 2 0 0 1 1.9-1.3h7.2A2 2 0 0 1 17.5 7l1.9 5.4"/><rect x="3" y="12" width="18" height="5.6" rx="2"/><path d="M5.6 17.6v1.8M18.4 17.6v1.8"/><circle ${f} cx="7" cy="14.8" r="1.1"/><circle ${f} cx="17" cy="14.8" r="1.1"/>`,
  'car-side': '<path d="M2.5 15.5v-2.6c0-.8.5-1.5 1.3-1.7l3.6-1L10 7.4c.6-.5 1.3-.8 2.1-.8h3.7c1 0 1.9.5 2.5 1.3l2 2.9c.8.3 1.3 1 1.3 1.9v2.8a1 1 0 0 1-1 1h-1.2"/><path d="M6.9 16.8H15"/><circle cx="5.2" cy="16.4" r="1.9"/><circle cx="17.2" cy="16.4" r="1.9"/>',
  door: '<path d="M4.5 19.5v-8.7L9.8 5h9.7v14.5z"/><path d="M5 11h14.5M14 14h3"/>',
  'window-lock': '<path d="M4 16.5V7.6L7.6 4H20v6"/><rect x="12.5" y="13" width="8" height="7" rx="1.5"/><path d="M14.5 13v-1.4a2 2 0 0 1 4 0V13"/>',
  'child-lock': '<rect x="5" y="10.5" width="14" height="10" rx="2.6"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="14.6" r="1.4"/><path d="M10 18.6a2 2 0 0 1 4 0"/>',
  mirror: '<path d="M4 9.6C4 8.2 5.1 7 6.5 7h10a3.6 3.6 0 0 1 0 7.2h-10A2.5 2.5 0 0 1 4 11.7z"/><path d="M8.5 18.6c2 1.2 5 1.2 7 0m0 0-.6-1.8m.6 1.8-1.9.3"/>',
  tailgate: '<path d="M2.6 16.6h13.6v-4.2l-3-4H6.4L3.6 12.2 2.6 13z"/><path d="m16.2 12.4 4.2-6.6"/><circle cx="6" cy="17.4" r="1.6"/><circle cx="13" cy="17.4" r="1.6"/>',
  'charge-port': '<path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0zM12 16v4.6"/>',
  battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.4"/><path d="M21.5 10.5v3"/>',
  'battery-charging': '<rect x="2.5" y="7" width="17" height="10" rx="2.4"/><path d="M21.5 10.5v3M11.6 8.6l-2.6 3.8h4l-2.6 3.8"/>',
  plug: '<path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0zM12 16v4.6"/>',
  headlight: '<path d="M11 6.2C7 6.2 4.4 8.8 4.4 12s2.6 5.8 6.6 5.8z"/><path d="m14 8.6 6.2 1.4M14 12.2l6.2 1.4M14 15.8l6.2 1.4"/>',
  'parking-lights': '<path d="M9.6 7.8a4.2 4.2 0 0 0 0 8.4zM14.4 7.8a4.2 4.2 0 0 1 0 8.4z"/><path d="M5.4 9 3 7.8M5.4 12H2.6M5.4 15 3 16.2M18.6 9 21 7.8M18.6 12h2.8M18.6 15l2.4 1.2"/>',
  'high-beam': '<path d="M11.4 6C7.4 6 4.8 8.8 4.8 12s2.6 6 6.6 6z"/><path d="M14.4 8h6M14.4 12h6M14.4 16h6"/>',
  lane: '<path d="M5.5 20.5 9 3.5M18.5 20.5 15 3.5M12 6v2.4M12 11v2.4M12 16v2.4"/>',
  'blind-spot': '<rect x="7.5" y="4.5" width="8" height="15" rx="3"/><path d="M18.4 9.4a4 4 0 0 1 0 5.2M20.8 7.4a7 7 0 0 1 0 9.2"/>',
  gauge: `<path d="M4.4 17.6a8.6 8.6 0 1 1 15.2 0"/><path d="m12 13.4 4.2-4.6"/><circle ${f} cx="12" cy="13.4" r="1.5"/>`,
  mountain: '<path d="M2.5 19.5 9 8.2l4 6.4 2.6-3.5 5.9 8.4z"/>',
  seat: seat,
  steering: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="2.2"/><path d="M3.6 11h6.2M14.2 11h6.2M12 14.2v6.4"/>',
  lightbulb: '<path d="M9 17.5h6M10 21h4M8.2 14.2A6 6 0 1 1 15.8 14.2c-.8.7-1 1.5-1 2.3v1h-5.6v-1c0-.8-.2-1.6-1-2.3z"/>',
  hazard: '<path d="M12 3.4 21.6 20.2H2.4z"/><path d="M12 9.6 16.4 17.4H7.6z"/>',
  'auto-hold': '<circle cx="12" cy="12" r="8.6"/><path d="M8.5 15.5V8.5M15.5 15.5V8.5M8.5 12h7"/>',
  ac: '<path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6"/>',
} as const

export type IconName = keyof typeof ICONS
