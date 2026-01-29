/* ---------------------------------------------------------
   LinzAG Monitor – COMBINED (Maxi, Midi, Mini)
   --------------------------------------------------------- */

const LINE_COLORS = { 
  "1": "#EE3A80", "2": "#C67DB5", "3": "#A4238F", "3a": "#A4238F", "4": "#C40653", 
  "11": "#E1771E", "12": "#159655", "17": "#E1771E", "18": "#008DD0", "19": "#E9639F", 
  "25": "#BD8B30", "26": "#008DD0", "27": "#819C4E", "33": "#AF7B86", "33a": "#AF7B86", 
  "38": "#E1771E", "41": "#D2232B", "43": "#33A0C4", "45": "#D2232B", "46": "#33A0C4", 
  "50": "#00CC00", "70": "#955336", "71": "#955336", "72": "#955336", "73": "#955336", 
  "77": "#955336", "101": "#DBAF3B", "102": "#48A643", "103": "#48A643", "104": "#DBAF3B", 
  "105": "#48A643", "106": "#48A643", "107": "#DBAF3B", "108": "#DBAF3B", "191": "#48A643", 
  "192": "#DBAF3B", "194": "#48A643", "150": "#DBAF3B", "N82": "#C67DB5", "N83": "#008DD0", "N84": "#C40653" 
};

const STANDARD_ROUTES = {
  '1': ['Auwiesen', 'Universität'], '2': ['solarCity', 'Universität'],
  '3': ['Landgutstraße', 'Trauner Kreuzung P&R'], '4': ['Landgutstraße', 'Schloss Traun'],
  '50': ['Pöstlingberg', 'Hauptplatz'], 'N82': ['solarCity', 'Universität'],
  'N84': ['Hauptbahnhof', 'Schloss Traun'], '11': ['Pichlinger See','Sporthalle Leonding'],
  '12': ['Karlhof', 'Auwiesen'], '17': ['Hitzing', 'Fernheizkraftwerk'], 
  '19': ['Pichlinger See', 'Fernheizkraftwerk'], '25': ['Oed', 'Karlhof'],
  '26': ['St. Margarethen', 'Stadion'], '27': ['Fernheizkraftwerk', 'Chemiepark'],
  '33': ['Riesenhof', 'Pleschinger See'], '33a': ['Rudolfstraße', 'Plesching'],
  '38': ['Rudolfstraße', 'Jäger im Tal'], '41': ['Hessenplatz', 'Baintwiese'],
  '43': ['Hessenplatz', 'Stadtfriedhof'], '45': ['Froschberg', 'Stieglbauernstraße'],
  '46': ['Hafenportal', 'Froschberg'], '70': ['Stadtfriedhof', 'Schiffswerft'],
  '71': ['Baintwiese', 'Industriezeile'], '72': ['Schiffswerft', 'Stadtfriedhof'],
  '73': ['Fernheizkraftwerk', 'Baintwiese'], '77': ['Universität', 'Hauptbahnhof'],
  '108': ['Simonystraße', 'Lunzerstraße Ost']
};

/* --- GOOGLE FONT LOADER --- */
const loadGoogleFont = (fontName) => {
  if (!fontName || ['Arial','Verdana','Helvetica','sans-serif','serif','monospace'].includes(fontName)) return;
  const id = `font-comb-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
};

/* --- EDITOR --- */
class LinzMonitorCombinedEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  set hass(hass) { this._hass = hass; if (!this._initialized) { this.render(); this._initialized = true; } }

  render() {
    if (!this._hass || !this._config) return;
    const entities = Object.keys(this._hass.states).filter(k => k.includes('linz_ag') || this._hass.states[k].attributes?.departureList).sort();
    
    const mode = this._config.layout || "maxi"; // maxi, midi, mini

    // Gemeinsame Optionen
    let commonHtml = `
      <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Design Mode</label>
        <select id="layout" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
          <option value="maxi" ${mode === 'maxi' ? 'selected' : ''}>Maxi (Classic)</option>
          <option value="midi" ${mode === 'midi' ? 'selected' : ''}>Midi (Compact)</option>
          <option value="mini" ${mode === 'mini' ? 'selected' : ''}>Mini (Minimal)</option>
        </select>
      </div>
      <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Haltestelle</label>
        <select id="entity" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
          <option value="">Wählen...</option>
          ${entities.map(e => `<option value="${e}" ${this._config.entity === e ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
      </div>
      <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Name (Optional)</label>
        <input id="stop_name_override" type="text" value="${this._config.stop_name_override || ''}" placeholder="Eigener Name..." style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
      </div>
    `;

    // Spezifische Optionen
    let specificHtml = "";

    if (mode === "maxi") {
      specificHtml = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
          <label style="display:flex; align-items:center; gap:8px; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; cursor:pointer;"><input id="show_info" type="checkbox" ${this._config.show_info !== false ? 'checked' : ''} style="transform:scale(1.2);"><span style="font-weight:700;">Info-Zeile</span></label>
          <label style="display:flex; align-items:center; gap:8px; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; cursor:pointer;"><input id="badge_round" type="checkbox" ${this._config.badge_round !== false ? 'checked' : ''} style="transform:scale(1.2);"><span style="font-weight:700;">Badges rund</span></label>
        </div>
      `;
    } else if (mode === "midi") {
       specificHtml = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
          <div><label style="font-weight:bold; display:block;">Zeilenhöhe</label><input id="row_height" type="number" value="${this._config.row_height || 38}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
          <div><label style="font-weight:bold; display:block;">Schrift Zeit</label><input id="font_size" type="number" value="${this._config.font_size || 20}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
        </div>
        <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Schrift Ziel</label><input id="dest_size" type="number" value="${this._config.dest_size || 20}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
       `;
    } else if (mode === "mini") {
       specificHtml = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px; background:#333; padding:8px; border-radius:4px;">
           <div><label style="font-weight:bold; display:block;">Badge Größe (px)</label><input id="badge_size" type="number" value="${this._config.badge_size || 24}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
           <div style="display:flex; align-items:flex-end;"><label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input id="badge_round" type="checkbox" ${this._config.badge_round !== false ? 'checked' : ''} style="transform:scale(1.2);"><span style="font-weight:700;">Kreis / Rund</span></label></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
          <div><label style="font-weight:bold; display:block;">Zeilenhöhe</label><input id="row_height" type="number" value="${this._config.row_height || 32}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
          <div><label style="font-weight:bold; display:block;">Schrift Zeit</label><input id="font_size" type="number" value="${this._config.font_size || 14}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
        </div>
        <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Schrift Ziel</label><input id="dest_size" type="number" value="${this._config.dest_size || 14}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
       `;
    }

    this.innerHTML = `
      <div class="card-config" style="padding:10px;">
        ${commonHtml}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
          <div><label style="font-weight:bold; display:block;">Filter (Linien)</label><input id="filter" type="text" value="${this._config.filter || ''}" placeholder="z.B. 1, 2" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
          <div><label style="font-weight:bold; display:block;">Sortierung</label>
            <select id="sortierung" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
              <option value="echtzeit" ${this._config.sortierung === "echtzeit" ? 'selected' : ''}>Echtzeit</option>
              <option value="plan" ${this._config.sortierung === "plan" ? 'selected' : ''}>Plan</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Anzahl Zeilen</label><input id="anzahl" type="number" value="${this._config.anzahl || 7}" style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
        ${specificHtml}
        <div style="margin-bottom:10px;"><label style="font-weight:bold; display:block;">Google Font (Name)</label><input id="font_family" type="text" value="${this._config.font_family || ''}" placeholder="z.B. Oswald, Roboto..." style="width:100%; padding:8px; background:#222; color:white; border:1px solid #444; border-radius:4px;"></div>
      </div>
    `;

    this.querySelectorAll("select, input").forEach(el => el.addEventListener("change", (ev) => this._update(ev)));
  }

  _update(ev) {
    const t = ev.target;
    let value = (t.type === "checkbox") ? t.checked : (t.type === "number" ? Number(t.value) : t.value);
    const config = { ...this._config, [t.id]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}
customElements.define("linz-monitor-combined-editor", LinzMonitorCombinedEditor);

/* --- MAIN CARD --- */
class LinzMonitorCombined extends HTMLElement {
  static getConfigElement() { return document.createElement("linz-monitor-combined-editor"); }
  static getStubConfig() { return { entity: "", layout: "maxi", anzahl: 7 }; }

  constructor() { super(); this._gone_mem = new Map(); }

  setConfig(config) {
    this._config = { 
      layout: "maxi",
      anzahl: 7, 
      sortierung: "echtzeit", 
      filter: "", 
      stop_name_override: "",
      font_family: "",
      // Maxi Defaults
      show_info: true, 
      badge_round: true,
      // Midi/Mini Defaults
      row_height: config.layout === "mini" ? 32 : 38,
      font_size: config.layout === "mini" ? 14 : 20,
      dest_size: config.layout === "mini" ? 14 : 20,
      badge_size: 24,
      ...config 
    };
    if (this._config.font_family) loadGoogleFont(this._config.font_family);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config.entity || !hass.states[this._config.entity]) {
      if (!this.querySelector("ha-card")) {
        this.innerHTML = `<ha-card style="padding:20px;color:white;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));">Bitte Haltestelle wählen.</ha-card>`;
      }
      return;
    }

    const state = hass.states[this._config.entity];
    const nowTs = Date.now();
    let departures = [...(state.attributes.departureList || [])];

    // 1. FILTER
    const matchesFilter = (line) => {
      if (!this._config.filter) return true;
      const filters = this._config.filter.split(',').map(f => f.trim().toLowerCase()).filter(Boolean);
      if (filters.length === 0) return true;
      const l = (line || "").toLowerCase();
      return filters.includes(l) || filters.includes(l.replace('*', ''));
    };
    departures = departures.filter(d => matchesFilter(d.line));

    // 2. MEMORY (für "gerade weg" Anzeige)
    const currentKeys = new Set(departures.map(d => `${d.line}-${d.scheduled}-${d.direction}`));
    if (this._lastRaw) {
      this._lastRaw.forEach(old => {
        const key = `${old.line}-${old.scheduled}-${old.direction}`;
        if (matchesFilter(old.line) && !currentKeys.has(key) && old.countdown <= 1 && old.countdown >= 0 && !this._gone_mem.has(key)) {
          this._gone_mem.set(key, { ...old, goneAt: nowTs });
        }
      });
    }
    this._lastRaw = departures;
    for (const [key, val] of this._gone_mem) { if (nowTs - val.goneAt > 10000) this._gone_mem.delete(key); }
    const combined = [...departures];
    this._gone_mem.forEach(val => combined.push({ ...val, isGone: true }));

    // 3. SORTIERUNG (Unified Logic aus V1/V2/V3)
    const getSortTime = (d) => {
      const [h, m] = d.scheduled.split(':').map(Number);
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      let schedMins = h * 60 + m;
      if (schedMins < (nowMins - 180)) schedMins += 1440;
      if (this._config.sortierung !== "plan" && typeof d.countdown === 'number') {
         return nowMins + d.countdown;
      }
      return schedMins;
    };
    combined.sort((a, b) => getSortTime(a) - getSortTime(b));

    // ROUTING ZUR RICHTIGEN RENDER METHODE
    const layout = this._config.layout || "maxi";
    if (layout === "mini") {
        this._renderMini(state, combined);
    } else if (layout === "midi") {
        this._renderMidi(state, combined);
    } else {
        this._renderMaxi(state, combined);
    }
  }

  /* ----------------------------------------------------------------------------------
     RENDER: MAXI (V1 Codebase)
     ---------------------------------------------------------------------------------- */
  _renderMaxi(state, departures) {
    const FONT = this._config.font_family ? `'${this._config.font_family}', sans-serif` : "'Exo 2', sans-serif";
    const badgeRadius = (this._config.badge_round === false) ? 6 : 16;
    const showInfo = this._config.show_info !== false;

    // Nur Styles/Container neu setzen wenn Layout gewechselt oder leer
    if (!this.querySelector("ha-card") || this._currentLayout !== 'maxi') {
      this._currentLayout = 'maxi';
      this.innerHTML = `
        <style>
          ha-card { background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); border-radius: 16px !important; padding: 12px !important; color: white !important; font-family: ${FONT} !important; overflow: hidden !important; height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; }
          .header-box { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; padding-bottom: 8px; flex-shrink: 0; }
          .stop-logo { height: 28px; width: 28px; object-fit: contain; }
          .stop-title { font-size: 22px; font-weight: 800; }
          .rows-container { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; min-height: 0; }
          .row { display: flex; align-items: center; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 5px 10px; position: relative; min-height: 48px; border-left: 4px solid transparent; }
          .line-badge { min-width: 40px; height: 32px; border-radius: ${badgeRadius}px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: white; margin-right: 10px; }
          .main-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
          .dest-wrap { overflow: hidden; white-space: nowrap; }
          .dest { font-size: 22px; font-weight: 700; color: #fff; white-space: nowrap; display: inline-block; }
          .ping-pong-scroll { animation: scroll-pingpong 8s linear infinite alternate; --scroll-dist: -50px; }
          @keyframes scroll-pingpong { 0%, 15% { transform: translateX(0); } 85%, 100% { transform: translateX(var(--scroll-dist)); } }
          .count-box-wrapper { display: flex; flex-direction: column; align-items: flex-end; min-width: 80px; }
          .count-box { font-size: 25px; font-weight: 800; line-height: 1; display: flex; align-items: baseline; justify-content: flex-end; white-space: nowrap; }
          .time-small { font-size: 12px; color: #bbb; margin-top: 2px; }
          .delay-red { color: #ff5252; font-weight: 600; }
          .min-u { font-size: 13px; color: #777; margin-left: 3px; font-weight: 600; }
          .gone-txt { text-decoration: line-through; color: #777; }
          .is-cancelled { opacity: 0.6; }
          .is-cancelled .dest { text-decoration: line-through; color: #ff5252; }
          @keyframes bB { 0%, 100% { border-left-color: #4caf50; } 50% { border-left-color: transparent; } }
          .dots { display: flex; justify-content: flex-end; gap: 4px; height: 18px; align-items: center; padding-right: 5px;}
          .dots span { width: 7px; height: 7px; background: #4caf50; border-radius: 50%; animation: dAn 1.5s infinite; opacity: 0.2; }
          .dots span:nth-child(2) { animation-delay: 0.3s; }
          .dots span:nth-child(3) { animation-delay: 0.6s; }
          @keyframes dAn { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
          .row-info { margin-top: 2px; background: rgba(0,0,0,0.3); border-radius: 4px; padding: 1px 6px; font-size: 12px; color: #fff; display: flex; align-items: center; gap: 8px; overflow: hidden; font-weight: 600; }
          .mq-w { flex: 1; overflow: hidden; white-space: nowrap; position: relative; height: 18px; }
          .mq-t { display: inline-block; padding-left: 100%; animation: mMo 25s linear infinite; will-change: transform; line-height: 18px; }
          @keyframes mMo { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
          .alert-style { background: #d32f2f !important; border: 1px solid #ff8a80; }
          .alert-txt { color: white !important; font-weight: 800; text-transform: uppercase; }
          @media (max-width: 450px) {
            .line-badge { min-width: 35px; height: 28px; font-size: 16px; }
            .dest { font-size: 19px; }
            .count-box { font-size: 22px; }
          }
        </style>
        <ha-card>
          <div class="header-box">
            <img class="stop-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Zeichen_224_-_Haltestelle%2C_StVO_2017.svg/1200px-Zeichen_224_-_Haltestelle%2C_StVO_2017.svg.png">
            <div class="stop-title"></div>
          </div>
          <div class="rows-container"></div>
        </ha-card>
      `;
    }

    const container = this.querySelector(".rows-container");
    const stopTitle = this.querySelector(".stop-title");
    const defaultName = (state.attributes.stop_name || "").replace(/Linz\/Donau|Leonding|Linz/gi, "").trim();
    stopTitle.innerText = this._config.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, this._config.anzahl);
    const activeIds = [];

    visibleRows.forEach((d) => {
      const rowId = `r-${d.line}-${d.direction}-${d.scheduled}`.replace(/[^a-z0-9]/gi, "");
      activeIds.push(rowId);
      
      let rowEl = container.querySelector(`[data-id="${rowId}"]`);
      
      const infoLow = (d.infos || "").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;

      let timeVal;
      let metaVal = (!d.isGone && d.delay > 0 && !isCancelled) ? `${d.scheduled} <span class="delay-red">(+${d.delay})</span>` : d.scheduled;

      if (isCancelled) {
         timeVal = `<span style="text-decoration:line-through; color:#ff5252;">${d.scheduled}</span>`;
         metaVal = "";
      } else if (isNow) {
         timeVal = `<div class="dots"><span></span><span></span><span></span></div>`;
      } else if (d.isGone) {
         timeVal = `<span class="gone-txt">${d.scheduled}</span>`;
         metaVal = "";
      } else if (d.countdown >= 45) {
         timeVal = d.scheduled;
         metaVal = ""; 
      } else {
         timeVal = `${d.countdown}<span class="min-u">Min</span>`;
      }

      const cleanL = d.line.replace("*", "");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL === "3" || cleanL === "3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL + "a";
        else lineT = cleanL + "*";
      }

      // INFO HTML
      let styledInfoHtml = "";
      if (isCancelled) {
         styledInfoHtml = `
            <div class="row-info alert-style">
              <span style="color:white">⚠️</span>
              <div class="mq-w"><div class="mq-t" style="animation:none; padding-left:0;"><span class="alert-txt">FAHRT FÄLLT AUS</span></div></div>
            </div>`;
      } else if (showInfo) {
         const infoTextRaw = (d.infos || "").replace(/\n/g, " ").trim();
         if (infoTextRaw.length > 2 && !infoTextRaw.includes("Niederflur")) {
            const parts = infoTextRaw.split(/([.,;])/);
            const buildColoredBlock = () => parts.map(part => `<span>${part}</span>`).join("");
            const block = buildColoredBlock();
            const separator = `<span> &nbsp;&nbsp; +++ &nbsp;&nbsp; </span>`;
            styledInfoHtml = `
              <div class="row-info">
                <span class="warn-icon">⚠️</span>
                <div class="mq-w"><div class="mq-t">${block}${separator}${block}</div></div>
              </div>`;
         }
      }

      if (!rowEl) {
        const tempRow = document.createElement("div");
        tempRow.setAttribute("data-id", rowId);
        tempRow.className = "row";
        tempRow.innerHTML = `
          <div class="line-badge" style="background:${LINE_COLORS[cleanL] || "#444"}">${lineT}</div>
          <div class="main-body">
            <div class="dest-wrap"><div class="dest">${d.direction}</div></div>
            <div class="info-area">${styledInfoHtml}</div>
          </div>
          <div class="count-box-wrapper">
            <div class="count-box">${timeVal}</div>
            <div class="time-meta"><span class="time-small">${metaVal}</span></div>
          </div>
        `;
        container.appendChild(tempRow);
        rowEl = tempRow;
      } else {
        const cBox = rowEl.querySelector(".count-box");
        const mBox = rowEl.querySelector(".time-small");
        const infoArea = rowEl.querySelector(".info-area");
        const badgeEl = rowEl.querySelector(".line-badge");
        if (cBox.innerHTML !== timeVal) cBox.innerHTML = timeVal;
        if (mBox.innerHTML !== metaVal) mBox.innerHTML = metaVal;
        const destEl = rowEl.querySelector(".dest");
        if (destEl && destEl.textContent !== d.direction) destEl.textContent = d.direction;
        if (infoArea && infoArea.innerHTML !== styledInfoHtml) infoArea.innerHTML = styledInfoHtml;
        if (badgeEl) {
          if (badgeEl.textContent !== lineT) badgeEl.textContent = lineT;
          badgeEl.style.background = LINE_COLORS[cleanL] || "#444";
        }
      }

      const badgeEl2 = rowEl.querySelector(".line-badge");
      if (badgeEl2) badgeEl2.style.borderRadius = `${badgeRadius}px`;

      rowEl.style.opacity = (d.isGone || isCancelled) ? "0.6" : "1";
      rowEl.style.borderLeftColor = isNow ? "#4caf50" : (d.isGone ? "#d32f2f" : "transparent");
      rowEl.style.animation = isNow ? "bB 2s infinite" : "none";
      rowEl.className = isCancelled ? "row is-cancelled" : "row";

      // AUTO-SCROLL
      const destEl = rowEl.querySelector(".dest");
      const destWrap = rowEl.querySelector(".dest-wrap");
      if (destWrap && destEl) {
         if (destEl.scrollWidth > destWrap.offsetWidth) {
            const diff = destWrap.offsetWidth - destEl.scrollWidth;
            destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
            destEl.classList.add("ping-pong-scroll");
         } else {
            destEl.classList.remove("ping-pong-scroll");
         }
      }
    });

    Array.from(container.children).forEach(child => {
      if (!activeIds.includes(child.getAttribute("data-id"))) container.removeChild(child);
    });
  }

  /* ----------------------------------------------------------------------------------
     RENDER: MIDI (V2 Codebase)
     ---------------------------------------------------------------------------------- */
  _renderMidi(state, departures) {
    const ROW_H = this._config.row_height || 38;
    const TIME_S = this._config.font_size || 20;
    const DEST_S = this._config.dest_size || 20;
    const BADGE_W = 48;
    const FONT = this._config.font_family ? `'${this._config.font_family}', sans-serif` : "'Exo 2', sans-serif";

    if (!this.querySelector("ha-card") || this._currentLayout !== 'midi') {
      this._currentLayout = 'midi';
      this.innerHTML = `
        <style>
          ha-card { background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); border-radius: 12px !important; padding: 10px !important; color: white !important; font-family: ${FONT} !important; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; isolation: isolate; }
          .title-area { font-size: ${TIME_S}px; font-weight: 700; color: #bbb; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
          .title-icon { height: ${Math.round(TIME_S * 1.3)}px; width: ${Math.round(TIME_S * 1.3)}px; object-fit: contain; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; flex: 1; min-height: 0; }
          tbody { display: block; height: 100%; overflow: hidden; }
          tr { display: table; width: 100%; table-layout: fixed; height: ${ROW_H}px; }
          td { vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
          .col-line { width: ${BADGE_W + 10}px; }
          .col-dest { width: auto; padding-left: 8px; overflow: hidden; white-space: nowrap; }
          .col-time { width: 105px; text-align: right; font-weight: 800; font-size: ${TIME_S + 1}px; z-index: 5; }
          .badge { width: ${BADGE_W}px; height: ${Math.round(ROW_H * 0.8)}px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${TIME_S}px; color: white; }
          .blink-badge { animation: syncBlink 1s infinite steps(1); }
          @keyframes syncBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.5; } }
          .dest-text { font-size: ${DEST_S}px; font-weight: 800; color: #fff; white-space: nowrap; display: inline-block; transition: opacity 0.2s; }
          .ping-pong-scroll { animation: scroll-pingpong 8s linear infinite alternate; --scroll-dist: -50px; }
          @keyframes scroll-pingpong { 0%, 15% { transform: translateX(0); } 85%, 100% { transform: translateX(var(--scroll-dist)); } }
          .info-overlay { position: absolute; top: 0; left: 8px; width: calc(100% - 8px); height: 100%; background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); display: flex; align-items: center; opacity: 0; transition: opacity 0.4s; z-index: 2; pointer-events: none; }
          .info-overlay.visible { opacity: 1; }
          .marquee-wrap { overflow: hidden; flex: 1; position: relative; display: flex; align-items: center; height: 100%; }
          .marquee-text { white-space: nowrap; font-size: ${DEST_S - 2}px; font-weight: 600; color: #fff; display: inline-block; padding-left: 100%; }
          .animating .marquee-text { animation: scrollLeft linear forwards; }
          @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
          .delay-red { font-size: ${Math.max(12, TIME_S - 6)}px; color: #ff5252; margin-right: 4px; font-weight: 800; }
          .is-gone { opacity: 0.3 !important; text-decoration: line-through !important; }
          .is-cancelled { opacity: 0.6; text-decoration: line-through; color: #ff5252 !important; }
          .is-cancelled .dest-text { color: #ff5252 !important; text-decoration: line-through; }
          .alert-style { background: #d32f2f; color: white !important; border: 1px solid #ff8a80; border-radius: 4px; padding: 0 4px; font-weight: 800; }
        </style>
        <ha-card>
          <div class="title-area">
            <img class="title-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Zeichen_224_-_Haltestelle%2C_StVO_2017.svg/1200px-Zeichen_224_-_Haltestelle%2C_StVO_2017.svg.png">
            <span class="stop-name"></span>
          </div>
          <table><tbody id="list"></tbody></table>
        </ha-card>
      `;
    }

    const list = this.querySelector("#list");
    const defaultName = (state.attributes.stop_name || "").replace(/Linz\/Donau|Leonding|Linz/gi, "").trim();
    this.querySelector(".stop-name").innerText = this._config.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, this._config.anzahl);
    const activeIds = [];

    visibleRows.forEach((d) => {
      const rowId = `r-${d.line}-${d.scheduled}-${d.direction}`.replace(/[^a-z0-9]/gi, "");
      activeIds.push(rowId);
      
      let row = list.querySelector(`[data-id="${rowId}"]`);
      const infoLow = (d.infos || "").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;
      const cleanL = d.line.replace("*", "");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL === "3" || cleanL === "3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL + "a";
        else lineT = cleanL + "*";
      }

      if (!row) {
        row = document.createElement("tr");
        row.setAttribute("data-id", rowId);
        row.innerHTML = `<td class="col-line"><div class="badge"></div></td><td class="col-dest"><div class="dest-text"></div><div class="info-overlay"><span style="margin-right:5px">⚠️</span><div class="marquee-wrap"><div class="marquee-text"></div></div></div></td><td class="col-time"></td>`;
        list.appendChild(row);
        row._state = 'dest'; row._next = Date.now() + 10000;
      }
      row.className = d.isGone ? 'is-gone' : (isCancelled ? 'is-cancelled' : '');
      const b = row.querySelector(".badge");
      if(b.innerText !== lineT) b.innerText = lineT;
      b.style.background = LINE_COLORS[cleanL] || "#444";
      b.classList.toggle("blink-badge", isNow);

      const timeCol = row.querySelector(".col-time");
      const delayText = (!d.isGone && !isCancelled && d.delay > 0) ? `<span class="delay-red">(+${d.delay})</span>` : "";

      if (isCancelled) timeCol.innerHTML = `<span style="text-decoration: line-through; color: #ff5252; opacity: 0.9;">${d.scheduled}</span>`;
      else if (isNow) timeCol.innerHTML = `<div style="display:flex;justify-content:flex-end;"><img src="https://www.irmscher.at/linzag/linzlinien-z.png" style="width:22px;height:22px;object-fit:contain;"></div>`;
      else if (d.isGone || d.countdown >= 45) timeCol.innerHTML = `${d.scheduled}`;
      else timeCol.innerHTML = `${delayText}${d.countdown}<span style="font-size:${TIME_S-3}px;opacity:0.6;margin-left:2px">Min</span>`;

      const destEl = row.querySelector(".dest-text");
      if(destEl.innerText !== d.direction) destEl.innerText = d.direction;
      destEl.style.fontSize = `${DEST_S}px`;

      // Auto-Scroll
      const col = row.querySelector(".col-dest");
      if (col && destEl) {
         if (destEl.scrollWidth > col.offsetWidth) {
            const diff = col.offsetWidth - destEl.scrollWidth;
            destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
            destEl.classList.add("ping-pong-scroll");
         } else {
            destEl.classList.remove("ping-pong-scroll");
         }
      }

      // LAUFTEXT & ALARM (Overlaid)
      const overlay = row.querySelector(".info-overlay");
      const marquee = row.querySelector(".marquee-text");
      const wrap = row.querySelector(".marquee-wrap");
      const hideDest = (shouldHide) => { destEl.style.opacity = shouldHide ? "0" : "1"; };

      if (isCancelled) {
        if (marquee.innerText !== "FAHRT FÄLLT AUS") { marquee.innerText = "FAHRT FÄLLT AUS"; marquee.className = "marquee-text alert-style"; }
        if (Date.now() > row._next) {
          row._state = (row._state === 'dest') ? 'warn' : 'dest';
          row._next = Date.now() + 5000;
          if (row._state === 'warn') { overlay.classList.add("visible"); wrap.classList.remove("animating"); hideDest(true); } 
          else { overlay.classList.remove("visible"); hideDest(false); }
        }
      } else if (d.infos && d.infos.length > 5 && !isNow && !d.isGone) {
        const infoText = d.infos.replace(/\n/g, " ").replace("Niederflurfahrzeug", "").trim();
        if (marquee.innerText !== infoText) { marquee.innerText = infoText; marquee.className = "marquee-text"; }
        const duration = Math.max(7, infoText.length * 0.22);
        if (Date.now() > row._next) {
          if (row._state === 'dest') {
             row._state = 'info'; row._next = Date.now() + (duration * 1000) + 500;
             overlay.classList.add("visible"); wrap.classList.add("animating"); marquee.style.animationDuration = `${duration}s`; hideDest(true);
          } else {
             row._state = 'dest'; row._next = Date.now() + 10000;
             overlay.classList.remove("visible"); wrap.classList.remove("animating"); hideDest(false);
          }
        }
      } else {
        overlay.classList.remove("visible"); hideDest(false);
      }
    });

    Array.from(list.children).forEach(c => { if (!activeIds.includes(c.getAttribute("data-id"))) list.removeChild(c); });
  }

  /* ----------------------------------------------------------------------------------
     RENDER: MINI (V3 Codebase)
     ---------------------------------------------------------------------------------- */
  _renderMini(state, departures) {
    const ROW_H = this._config.row_height || 32;
    const TIME_S = this._config.font_size || 14;
    const DEST_S = this._config.dest_size || 14;
    const B_SIZE = this._config.badge_size || 24; 
    const B_ROUND = this._config.badge_round !== false; 
    const B_RADIUS = B_ROUND ? "50%" : "3px"; 
    const B_FONT = Math.round(B_SIZE * 0.60); 
    const FONT = this._config.font_family ? `'${this._config.font_family}', sans-serif` : "'Exo 2', sans-serif";

    if (!this.querySelector("ha-card") || this._currentLayout !== 'mini') {
      this._currentLayout = 'mini';
      this.innerHTML = `
        <style>
          ha-card { background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); border-radius: 10px !important; padding: 8px !important; color: white !important; font-family: ${FONT} !important; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; isolation: isolate; }
          .title-area { font-size: ${TIME_S}px; font-weight: 700; color: #bbb; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
          .title-icon { height: ${Math.round(TIME_S * 1.2)}px; width: ${Math.round(TIME_S * 1.2)}px; object-fit: contain; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; flex: 1; min-height: 0; }
          tbody { display: block; height: 100%; overflow: hidden; }
          tr { display: table; width: 100%; table-layout: fixed; height: ${ROW_H}px; }
          td { vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
          .col-line { width: ${B_SIZE + 4}px; }
          .col-dest { width: auto; padding-left: 3px; overflow: hidden; white-space: nowrap; }
          .col-time { width: 50px; text-align: right; font-weight: 800; font-size: ${TIME_S}px; z-index: 5; }
          .badge { width: ${B_SIZE}px; height: ${B_SIZE}px; border-radius: ${B_RADIUS}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${B_FONT}px; color: white; }
          .blink-badge { animation: syncBlink 1s infinite steps(1); }
          @keyframes syncBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.5; } }
          .dest-text { font-size: ${DEST_S}px; font-weight: 700; color: #fff; white-space: nowrap; display: inline-block; transition: opacity 0.2s; }
          .ping-pong-scroll { animation: scroll-pingpong 8s linear infinite alternate; --scroll-dist: -50px; }
          @keyframes scroll-pingpong { 0%, 15% { transform: translateX(0); } 85%, 100% { transform: translateX(var(--scroll-dist)); } }
          .info-overlay { position: absolute; top: 0; left: 3px; width: calc(100% - 3px); height: 100%; background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); display: flex; align-items: center; opacity: 0; transition: opacity 0.4s; z-index: 2; pointer-events: none; }
          .info-overlay.visible { opacity: 1; }
          .marquee-wrap { overflow: hidden; flex: 1; position: relative; display: flex; align-items: center; height: 100%; }
          .marquee-text { white-space: nowrap; font-size: ${DEST_S - 2}px; font-weight: 600; color: #fff; display: inline-block; padding-left: 100%; }
          .animating .marquee-text { animation: scrollLeft linear forwards; }
          @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
          .delay-red { font-size: ${Math.max(10, TIME_S - 3)}px; color: #ff5252; margin-right: 2px; font-weight: 800; }
          .is-gone { opacity: 0.3 !important; text-decoration: line-through !important; }
          .is-cancelled { opacity: 0.6; text-decoration: line-through; color: #ff5252 !important; }
          .is-cancelled .dest-text { color: #ff5252 !important; text-decoration: line-through; }
          .alert-style { background: #d32f2f; color: white !important; border: 1px solid #ff8a80; border-radius: 4px; padding: 0 4px; font-weight: 800; }
        </style>
        <ha-card>
          <div class="title-area">
            <img class="title-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Zeichen_224_-_Haltestelle%2C_StVO_2017.svg/1200px-Zeichen_224_-_Haltestelle%2C_StVO_2017.svg.png">
            <span class="stop-name"></span>
          </div>
          <table><tbody id="list"></tbody></table>
        </ha-card>
      `;
    }

    const list = this.querySelector("#list");
    const defaultName = (state.attributes.stop_name || "").replace(/Linz\/Donau|Leonding|Linz/gi, "").trim();
    this.querySelector(".stop-name").innerText = this._config.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, this._config.anzahl);
    const activeIds = [];

    visibleRows.forEach((d) => {
      const rowId = `r-${d.line}-${d.scheduled}-${d.direction}`.replace(/[^a-z0-9]/gi, "");
      activeIds.push(rowId);
      
      let row = list.querySelector(`[data-id="${rowId}"]`);
      const infoLow = (d.infos || "").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;
      const cleanL = d.line.replace("*", "");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL === "3" || cleanL === "3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL + "a";
        else lineT = cleanL + "*";
      }

      if (!row) {
        row = document.createElement("tr");
        row.setAttribute("data-id", rowId);
        row.innerHTML = `<td class="col-line"><div class="badge"></div></td><td class="col-dest"><div class="dest-text"></div><div class="info-overlay"><span style="margin-right:5px">⚠️</span><div class="marquee-wrap"><div class="marquee-text"></div></div></div></td><td class="col-time"></td>`;
        list.appendChild(row);
        row._state = 'dest'; row._next = Date.now() + 10000;
      }

      if (d.isGone) row.className = 'is-gone';
      else if (isCancelled) row.className = 'is-cancelled';
      else row.className = '';

      const b = row.querySelector(".badge");
      if(b.innerText !== lineT) b.innerText = lineT;
      b.style.background = LINE_COLORS[cleanL] || "#444";
      b.classList.toggle("blink-badge", isNow);
      b.style.borderRadius = B_RADIUS; 

      const timeCol = row.querySelector(".col-time");
      const delayText = (!d.isGone && !isCancelled && d.delay > 0) ? `<span class="delay-red">(+${d.delay})</span>` : "";

      if (isCancelled) timeCol.innerHTML = `<span style="text-decoration: line-through; color: #ff5252; opacity: 0.9;">${d.scheduled}</span>`;
      else if (isNow) timeCol.innerHTML = `<div style="display:flex;justify-content:flex-end;"><img src="https://www.irmscher.at/linzag/linzlinien-z.png" style="width:${Math.round(B_SIZE*0.8)}px;height:${Math.round(B_SIZE*0.8)}px;object-fit:contain;"></div>`;
      else if (d.isGone || d.countdown >= 45) timeCol.innerHTML = `${d.scheduled}`;
      else timeCol.innerHTML = `${delayText}${d.countdown}`;

      const destEl = row.querySelector(".dest-text");
      if(destEl.innerText !== d.direction) destEl.innerText = d.direction;
      destEl.style.fontSize = `${DEST_S}px`;

      // Auto-Scroll
      const col = row.querySelector(".col-dest");
      if (col && destEl) {
         if (destEl.scrollWidth > col.offsetWidth) {
            const diff = col.offsetWidth - destEl.scrollWidth;
            destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
            destEl.classList.add("ping-pong-scroll");
         } else {
            destEl.classList.remove("ping-pong-scroll");
         }
      }

      // LAUFTEXT (Mini)
      const overlay = row.querySelector(".info-overlay");
      const marquee = row.querySelector(".marquee-text");
      const wrap = row.querySelector(".marquee-wrap");
      const hideDest = (shouldHide) => { destEl.style.opacity = shouldHide ? "0" : "1"; };

      if (isCancelled) {
        if (marquee.innerText !== "FAHRT FÄLLT AUS") { marquee.innerText = "FAHRT FÄLLT AUS"; marquee.className = "marquee-text alert-style"; }
        if (Date.now() > row._next) {
          row._state = (row._state === 'dest') ? 'warn' : 'dest';
          row._next = Date.now() + 5000;
          if (row._state === 'warn') { overlay.classList.add("visible"); wrap.classList.add("animating"); hideDest(true); }
          else { overlay.classList.remove("visible"); wrap.classList.remove("animating"); hideDest(false); }
        }
      } else if (d.infos && d.infos.length > 5 && !isNow && !d.isGone) {
        const infoText = d.infos.replace(/\n/g, " ").replace("Niederflurfahrzeug", "").trim();
        if (marquee.innerText !== infoText) { marquee.innerText = infoText; marquee.className = "marquee-text"; }
        const duration = Math.max(7, infoText.length * 0.22);
        if (Date.now() > row._next) {
          if (row._state === 'dest') {
             row._state = 'info'; row._next = Date.now() + (duration * 1000) + 500;
             overlay.classList.add("visible"); wrap.classList.add("animating"); marquee.style.animationDuration = `${duration}s`; hideDest(true);
          } else {
             row._state = 'dest'; row._next = Date.now() + 10000;
             overlay.classList.remove("visible"); wrap.classList.remove("animating"); hideDest(false);
          }
        }
      } else {
        overlay.classList.remove("visible"); hideDest(false);
      }
    });

    Array.from(list.children).forEach(c => { if (!activeIds.includes(c.getAttribute("data-id"))) list.removeChild(c); });
  }

  getCardSize() { return (this._config.anzahl || 7) + 1; }
}

customElements.define("linz-monitor-combined", LinzMonitorCombined);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "linz-monitor-combined",
  name: "Linz AG Monitor (Combined)",
  description: "Kombinierte Abfahrtstafel (Maxi, Midi, Mini)"
});
