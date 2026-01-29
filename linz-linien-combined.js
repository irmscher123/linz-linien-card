/* Linz AG Monitor - Multi (V1+V2+V3 in one single card)
   Single custom element: linz-monitor-card
   Usage: type: 'custom:linz-monitor-card'
   Provide config.version: 'v1'|'v2'|'v3' and subconfigs v1:{...}, v2:{...}, v3:{...}
*/

/* --------------------- Shared constants & helpers --------------------- */
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

const loadGoogleFont = (fontName) => {
  if (!fontName || ['Arial','Verdana','Helvetica','sans-serif','serif','monospace'].includes(fontName)) return;
  const id = `linz-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
};

const unifiedSortTime = (d, preferRealtime=true) => {
  const [h, m] = d.scheduled.split(':').map(Number);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let schedMins = h * 60 + m;
  if (schedMins < (nowMins - 180)) schedMins += 1440;
  if (preferRealtime && typeof d.countdown === 'number') return nowMins + d.countdown;
  return schedMins;
};

/* --------------------- Editor (simple) --------------------- */
class LinzMonitorCardEditorCombined extends HTMLElement {
  setConfig(config) { this._config = config || {}; this.render(); }
  set hass(hass) { this._hass = hass; if (!this._initialized) { this.render(); this._initialized = true; } }
  render() {
    if (!this._hass || !this._config) return;
    const cfg = JSON.stringify(this._config, null, 2);
    this.innerHTML = `
      <div style="padding:10px;color:var(--primary-text-color,#fff);font-family:inherit;">
        <label style="font-weight:700;display:block;margin-bottom:6px">Version</label>
        <select id="version" style="width:100%;padding:8px;margin-bottom:10px;background:#222;color:#fff;border:1px solid #444;border-radius:6px">
          <option value="v1" ${this._config.version==='v1'?'selected':''}>V1 - Maxi</option>
          <option value="v2" ${this._config.version==='v2'?'selected':''}>V2 - Midi</option>
          <option value="v3" ${this._config.version==='v3'?'selected':''}>V3 - Mini</option>
        </select>
        <label style="font-weight:700;display:block;margin-bottom:6px">Full config (JSON)</label>
        <textarea id="full" style="width:100%;height:250px;padding:8px;background:#111;color:#ddd;border:1px solid #333;border-radius:6px">${cfg}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="save" style="padding:8px 10px;background:#2f8b2f;border:none;color:white;border-radius:6px;cursor:pointer">Apply</button>
          <button id="reset" style="padding:8px 10px;background:#8b2f2f;border:none;color:white;border-radius:6px;cursor:pointer">Reset</button>
        </div>
        <p style="font-size:12px;color:#aaa;margin-top:8px">Hinweis: Für feingranulare Anpassung können Sie die v1/v2/v3 Unterobjekte nutzen. Beispiel: { version: 'v2', v2: { entity:'sensor...', anzahl:8, row_height:38 } }</p>
      </div>
    `;
    this.querySelector('#version').addEventListener('change', (e)=> {
      const c = {...this._config, version: e.target.value};
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: c }, bubbles:true, composed:true }));
    });
    this.querySelector('#save').addEventListener('click', ()=> {
      try {
        const parsed = JSON.parse(this.querySelector('#full').value);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: parsed }, bubbles:true, composed:true }));
      } catch(err) { alert('Ungültiges JSON: ' + err.message); }
    });
    this.querySelector('#reset').addEventListener('click', ()=> {
      this.querySelector('#full').value = JSON.stringify(this._config, null, 2);
    });
  }
}
if (!customElements.get('linz-monitor-card-editor-combined')) customElements.define('linz-monitor-card-editor-combined', LinzMonitorCardEditorCombined);

/* --------------------- Single combined card --------------------- */
class LinzMonitorCardCombined extends HTMLElement {
  static getConfigElement() { return document.createElement('linz-monitor-card-editor-combined'); }
  constructor() {
    super();
    this._gone_mem = new Map();
  }

  setConfig(config) {
    const defaultV1 = { entity: "sensor.linz_ag_monitor", anzahl:7, sortierung:"echtzeit", stop_name_override:"", filter:"", font_family:"", show_info:true, badge_round:true };
    const defaultV2 = { entity: "sensor.linz_ag_monitor", anzahl:8, row_height:38, font_size:20, dest_size:20, sortierung:"echtzeit", stop_name_override:"", filter:"", font_family:"" };
    const defaultV3 = { entity: "sensor.linz_ag_monitor", anzahl:5, row_height:32, font_size:14, dest_size:14, sortierung:"echtzeit", stop_name_override:"", filter:"", font_family:"", badge_size:24, badge_round:true };
    this._config = config || {};
    this._version = this._config.version || 'v1';
    this._v1 = Object.assign({}, defaultV1, this._config.v1 || {});
    this._v2 = Object.assign({}, defaultV2, this._config.v2 || {});
    this._v3 = Object.assign({}, defaultV3, this._config.v3 || {});
    // load fonts if provided
    if (this._v1.font_family) loadGoogleFont(this._v1.font_family);
    if (this._v2.font_family) loadGoogleFont(this._v2.font_family);
    if (this._v3.font_family) loadGoogleFont(this._v3.font_family);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Decide which sub-config to use
    const cfg = this._getActiveConfig();
    if (!cfg || !cfg.entity || !hass.states[cfg.entity]) {
      if (!this.querySelector("ha-card")) {
        this.innerHTML = `<ha-card style="padding:20px;color:white;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));">Bitte Haltestelle wählen.</ha-card>`;
      }
      return;
    }
    this._state = hass.states[cfg.entity];
    this._lastRaw = this._lastRaw || [];
    // take departureList
    const nowTs = Date.now();
    let departures = [...(this._state.attributes.departureList || [])];

    // filter by version-config
    const matchesFilter = (line) => {
      const f = (cfg.filter || "");
      if (!f) return true;
      const filters = f.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
      if (filters.length===0) return true;
      const l = (line||"").toLowerCase();
      return filters.includes(l) || filters.includes(l.replace('*',''));
    };
    departures = departures.filter(d=>matchesFilter(d.line));

    // memory logic (gone vehicles)
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
    this._gone_mem.forEach(v => combined.push({ ...v, isGone: true }));

    // unified sorting
    combined.sort((a,b) => unifiedSortTime(a, cfg.sortierung !== 'plan') - unifiedSortTime(b, cfg.sortierung !== 'plan'));

    // call version-specific renderer
    if (this._version === 'v2') this._renderV2(this._state, combined);
    else if (this._version === 'v3') this._renderV3(this._state, combined);
    else this._renderV1(this._state, combined);
  }

  _getActiveConfig() {
    if (this._version === 'v2') return this._v2;
    if (this._version === 'v3') return this._v3;
    return this._v1;
  }

  /* ---------------- V1 (Maxi) renderer ---------------- */
  _renderV1(state, departures) {
    const cfg = this._v1;
    const FONT = cfg.font_family ? `'${cfg.font_family}', sans-serif` : "'Exo 2', sans-serif";
    const badgeRadius = (cfg.badge_round === false) ? 6 : 16;
    const showInfo = cfg.show_info !== false;

    if (!this.querySelector("ha-card") || (this.querySelector("ha-card")?.innerText || "").includes("Bitte Haltestelle")) {
      this.innerHTML = `
        <style>
          ha-card { background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); border-radius: 16px !important; padding: 12px !important; color: white !important; font-family: ${FONT} !important; overflow: hidden !important; height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; }
          .header-box { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; padding-bottom: 8px; flex-shrink: 0; }
          .stop-logo { height: 28px; width: 28px; object-fit: contain; }
          .stop-title { font-size: 22px; font-weight: 800; }
          .rows-container { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; min-height: 0; }
          .row { display: flex; align-items: center; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 5px 10px; position: relative; min-height: 48px; border-left: 4px solid transparent; }
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
          .row-info { margin-top: 2px; background: rgba(0,0,0,0.3); border-radius: 4px; padding: 1px 6px; font-size: 12px; color: #fff; display: flex; align-items: center; gap: 8px; overflow: hidden; font-weight: 600; }
          .mq-w { flex: 1; overflow: hidden; white-space: nowrap; position: relative; height: 18px; }
          .mq-t { display: inline-block; padding-left: 100%; animation: mMo 25s linear infinite; will-change: transform; line-height: 18px; }
          @keyframes mMo { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
          .alert-style { background: #d32f2f !important; border: 1px solid #ff8a80; }
          .alert-txt { color: white !important; font-weight: 800; text-transform: uppercase; }
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
    stopTitle.innerText = cfg.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, cfg.anzahl);

    visibleRows.forEach(d => {
      const rowId = `r-v1-${d.line}-${d.direction}-${d.scheduled}`.replace(/[^a-z0-9]/gi,"");
      let rowEl = container.querySelector(`[data-id="${rowId}"]`);

      const infoLow = (d.infos||"").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;

      let timeVal;
      let metaVal = (!d.isGone && d.delay > 0 && !isCancelled) ? `${d.scheduled} <span class="delay-red">(+${d.delay})</span>` : d.scheduled;
      if (isCancelled) {
        timeVal = `<span style="text-decoration:line-through; color:#ff5252;">${d.scheduled}</span>`;
        metaVal = "";
      } else if (isNow) {
        timeVal = `<div style="display:flex;justify-content:flex-end;"><div style="width:18px;height:18px;border-radius:50%;background:#4caf50"></div></div>`;
      } else if (d.isGone) {
        timeVal = `<span class="gone-txt">${d.scheduled}</span>`;
        metaVal = "";
      } else if (d.countdown >= 45) {
        timeVal = d.scheduled; metaVal = "";
      } else {
        timeVal = `${d.countdown}<span class="min-u">Min</span>`;
      }

      const cleanL = d.line.replace("*","");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL==="3"||cleanL==="3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL + "a";
        else lineT = cleanL + "*";
      }

      let styledInfoHtml = "";
      if (isCancelled) {
        styledInfoHtml = `<div class="row-info alert-style"><span style="color:white">⚠️</span><div class="mq-w"><div class="mq-t" style="animation:none;padding-left:0;"><span class="alert-txt">FAHRT FÄLLT AUS</span></div></div></div>`;
      } else if (showInfo) {
        const infoTextRaw = (d.infos||"").replace(/\n/g," ").trim();
        if (infoTextRaw.length>2 && !infoTextRaw.includes("Niederflur")) {
          const parts = infoTextRaw.split(/([.,;])/);
          const block = parts.map(p=>`<span>${p}</span>`).join("");
          const separator = `<span> &nbsp;&nbsp; +++ &nbsp;&nbsp; </span>`;
          styledInfoHtml = `<div class="row-info"><span class="warn-icon">⚠️</span><div class="mq-w"><div class="mq-t">${block}${separator}${block}</div></div></div>`;
        }
      }

      if (!rowEl) {
        const tempRow = document.createElement("div");
        tempRow.setAttribute("data-id", rowId);
        tempRow.className = "row";
        tempRow.innerHTML = `
          <div class="line-badge" style="background:${LINE_COLORS[cleanL]||'#444'}">${lineT}</div>
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
      rowEl.style.opacity = (d.isGone || isCancelled) ? "0.6":"1";
      rowEl.style.borderLeftColor = isNow ? "#4caf50" : (d.isGone ? "#d32f2f" : "transparent");
      rowEl.style.animation = isNow ? "bB 2s infinite" : "none";
      rowEl.className = isCancelled ? "row is-cancelled" : "row";

      const destEl = rowEl.querySelector(".dest");
      const destWrap = rowEl.querySelector(".dest-wrap");
      if (destWrap && destEl) {
        if (destEl.scrollWidth > destWrap.offsetWidth) {
          const diff = destWrap.offsetWidth - destEl.scrollWidth;
          destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
          destEl.classList.add("ping-pong-scroll");
        } else destEl.classList.remove("ping-pong-scroll");
      }
    });

    const activeIds = visibleRows.map(d => `r-v1-${d.line}-${d.direction}-${d.scheduled}`.replace(/[^a-z0-9]/gi,""));
    Array.from(container.children).forEach(child => { if (!activeIds.includes(child.getAttribute("data-id"))) container.removeChild(child); });
  }

  /* ---------------- V2 (Midi) renderer ---------------- */
  _renderV2(state, departures) {
    const cfg = this._v2;
    const ROW_H = cfg.row_height || 38;
    const TIME_S = cfg.font_size || 20;
    const DEST_S = cfg.dest_size || 20;
    const BADGE_W = 48;
    const FONT = cfg.font_family ? `'${cfg.font_family}', sans-serif` : "'Exo 2', sans-serif";

    if (!this.querySelector("ha-card") || (this.querySelector("ha-card")?.innerText || "").includes("Bitte Haltestelle")) {
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
    this.querySelector(".stop-name").innerText = cfg.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, cfg.anzahl);
    const activeIds = [];

    visibleRows.forEach(d => {
      const rowId = `r-v2-${d.line}-${d.scheduled}-${d.direction}`.replace(/[^a-z0-9]/gi,"");
      activeIds.push(rowId);

      let row = list.querySelector(`[data-id="${rowId}"]`);
      const infoLow = (d.infos||"").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;

      const cleanL = d.line.replace("*","");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL==="3"||cleanL==="3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL+"a";
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
      if (b.innerText !== lineT) b.innerText = lineT;
      b.style.background = LINE_COLORS[cleanL] || "#444";
      b.classList.toggle("blink-badge", isNow);

      const timeCol = row.querySelector(".col-time");
      const delayText = (!d.isGone && !isCancelled && d.delay > 0) ? `<span class="delay-red">(+${d.delay})</span>` : "";

      if (isCancelled) timeCol.innerHTML = `<span style="text-decoration: line-through; color: #ff5252; opacity: 0.9;">${d.scheduled}</span>`;
      else if (isNow) timeCol.innerHTML = `<div style="display:flex;justify-content:flex-end;"><img src="https://www.irmscher.at/linzag/linzlinien-z.png" style="width:22px;height:22px;object-fit:contain;"></div>`;
      else if (d.isGone || d.countdown >= 45) timeCol.innerHTML = `${d.scheduled}`;
      else timeCol.innerHTML = `${delayText}${d.countdown}<span style="font-size:${TIME_S-3}px;opacity:0.6;margin-left:2px">Min</span>`;

      const destEl = row.querySelector(".dest-text");
      if (destEl.innerText !== d.direction) destEl.innerText = d.direction;
      destEl.style.fontSize = `${DEST_S}px`;

      const col = row.querySelector(".col-dest");
      if (col && destEl) {
        if (destEl.scrollWidth > col.offsetWidth) {
          const diff = col.offsetWidth - destEl.scrollWidth;
          destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
          destEl.classList.add("ping-pong-scroll");
        } else destEl.classList.remove("ping-pong-scroll");
      }

      const overlay = row.querySelector(".info-overlay");
      const marquee = row.querySelector(".marquee-text");
      const wrap = row.querySelector(".marquee-wrap");

      const hideDest = (shouldHide) => { if (shouldHide) destEl.style.opacity = "0"; else destEl.style.opacity = "1"; };

      if (isCancelled) {
        const alarmMsg = "FAHRT FÄLLT AUS";
        if (marquee.innerText !== alarmMsg) { marquee.innerText = alarmMsg; marquee.className = "marquee-text alert-style"; }
        if (Date.now() > row._next) {
          row._state = (row._state === 'dest') ? 'warn' : 'dest';
          row._next = Date.now() + 5000;
          if (row._state === 'warn') { overlay.classList.add("visible"); wrap.classList.remove("animating"); hideDest(true); }
          else { overlay.classList.remove("visible"); hideDest(false); }
        }
      } else if (d.infos && d.infos.length > 5 && !isNow && !d.isGone) {
        const infoText = d.infos.replace(/\n/g," ").replace("Niederflurfahrzeug","").trim();
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
      } else { overlay.classList.remove("visible"); hideDest(false); }
    });

    Array.from(list.children).forEach(c => { if (!activeIds.includes(c.getAttribute("data-id"))) list.removeChild(c); });
  }

  /* ---------------- V3 (Mini) renderer ---------------- */
  _renderV3(state, departures) {
    const cfg = this._v3;
    const ROW_H = cfg.row_height || 32;
    const TIME_S = cfg.font_size || 14;
    const DEST_S = cfg.dest_size || 14;
    const B_SIZE = cfg.badge_size || 24;
    const B_ROUND = cfg.badge_round !== false;
    const B_RADIUS = B_ROUND ? "50%" : "3px";
    const FONT = cfg.font_family ? `'${cfg.font_family}', sans-serif` : "'Exo 2', sans-serif";

    if (!this.querySelector("ha-card") || (this.querySelector("ha-card")?.innerText || "").includes("Bitte Haltestelle")) {
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
          .badge { width: ${B_SIZE}px; height: ${B_SIZE}px; border-radius: ${B_RADIUS}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${Math.round(B_SIZE*0.6)}px; color: white; }
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
    this.querySelector(".stop-name").innerText = cfg.stop_name_override || defaultName;

    const visibleRows = departures.slice(0, cfg.anzahl);
    const activeIds = [];

    visibleRows.forEach(d => {
      const rowId = `r-v3-${d.line}-${d.scheduled}-${d.direction}`.replace(/[^a-z0-9]/gi,"");
      activeIds.push(rowId);

      let row = list.querySelector(`[data-id="${rowId}"]`);
      const infoLow = (d.infos||"").toLowerCase();
      const isCancelled = d.canceled || d.cancelled || infoLow.includes("fällt aus") || infoLow.includes("entfällt");
      const isNow = d.countdown === 0 && !d.isGone && !isCancelled;

      const cleanL = d.line.replace("*","");
      const isStandard = STANDARD_ROUTES[cleanL]?.includes(d.direction);
      let lineT = d.line;
      if (!isStandard && STANDARD_ROUTES[cleanL]) {
        const dest = d.direction.toLowerCase();
        if ((cleanL==="3"||cleanL==="3a") && (dest.includes("neue welt") || dest.includes("remise kleinmünchen"))) lineT = cleanL+"a";
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
      if (b.innerText !== lineT) b.innerText = lineT;
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
      if (destEl.innerText !== d.direction) destEl.innerText = d.direction;
      destEl.style.fontSize = `${DEST_S}px`;

      const col = row.querySelector(".col-dest");
      if (col && destEl) {
        if (destEl.scrollWidth > col.offsetWidth) {
          const diff = col.offsetWidth - destEl.scrollWidth;
          destEl.style.setProperty('--scroll-dist', `${diff - 5}px`);
          destEl.classList.add("ping-pong-scroll");
        } else destEl.classList.remove("ping-pong-scroll");
      }

      const overlay = row.querySelector(".info-overlay");
      const marquee = row.querySelector(".marquee-text");
      const wrap = row.querySelector(".marquee-wrap");
      const hideDest = (shouldHide) => { if (shouldHide) destEl.style.opacity = "0"; else destEl.style.opacity = "1"; };

      if (isCancelled) {
        const alarmMsg = "FAHRT FÄLLT AUS";
        if (marquee.innerText !== alarmMsg) { marquee.innerText = alarmMsg; marquee.className = "marquee-text alert-style"; }
        if (Date.now() > row._next) {
          row._state = (row._state === 'dest') ? 'warn' : 'dest';
          row._next = Date.now() + 5000;
          if (row._state === 'warn') { overlay.classList.add("visible"); wrap.classList.add("animating"); hideDest(true); }
          else { overlay.classList.remove("visible"); wrap.classList.remove("animating"); hideDest(false); }
        }
      } else if (d.infos && d.infos.length > 5 && !isNow && !d.isGone) {
        const infoText = d.infos.replace(/\n/g," ").replace("Niederflurfahrzeug","").trim();
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
      } else { overlay.classList.remove("visible"); hideDest(false); }
    });

    Array.from(list.children).forEach(c => { if (!activeIds.includes(c.getAttribute("data-id"))) list.removeChild(c); });
  }

  getCardSize() {
    const cfg = this._getActiveConfig();
    return (cfg && cfg.anzahl) ? cfg.anzahl + 1 : 6;
  }
}

if (!customElements.get('linz-monitor-card')) customElements.define('linz-monitor-card', LinzMonitorCardCombined);

/* register for card picker (optional) */
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'linz-monitor-card',
  name: 'Linz AG Monitor - Combined (v1/v2/v3)',
  description: 'Alle 3 Monitor-Varianten in einer einzigen Karte',
  preview: true
});
