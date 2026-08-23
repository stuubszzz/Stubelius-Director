// ═══════════════════════════════════════════════════════════════════════════
// STUBELIUS GOLD — black & neon-gold theme for the GRAPH ONLY.
// Every node, wire, group, node-widget and the canvas: gold on black.
// App chrome (menus, sidebars, workflow tabs, dialogs) is left untouched.
// ═══════════════════════════════════════════════════════════════════════════
import { app } from "../../scripts/app.js";

const GOLD       = "#FFD700";
const GOLD_SOFT  = "rgba(255, 215, 0, 0.35)";
const GOLD_DIM   = "#b8960a";
const GOLD_FAINT = "#6b5606";
const GOLD_TEXT  = "#f5e5a0";
const INK        = "#0d0b06";   // title bars
const INK_BODY   = "#14100a";   // node bodies
const INK_DEEP   = "#080704";   // canvas
const INK_WIDGET = "#0a0804";

function paintNode(node) {
  node.color = INK;
  node.bgcolor = INK_BODY;
  if (node.constructor) node.constructor.title_text_color = GOLD;
}

const TRACK_REST = "#241d08";
function goldifySlider(el) {
  if (el.style.getPropertyValue("--mmd-accent") !== GOLD) {
    el.style.setProperty("--mmd-accent", GOLD);
  }
  const bg = el.style.background;
  if (bg && bg.includes("linear-gradient") && !bg.includes(GOLD)) {
    let i = 0;
    const seq = [GOLD, GOLD, TRACK_REST, TRACK_REST];
    el.style.background = bg.replace(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g,
      () => seq[Math.min(i++, seq.length - 1)]);
  }
}
function goldifyAllSliders(root) {
  (root || document).querySelectorAll?.(".mmd-slider").forEach(goldifySlider);
}
// live guard: their JS rewrites the gradient on every drag - rewrite it right back
let goldifyQueued = false;
const sliderObserver = new MutationObserver((muts) => {
  let sliderTouched = false;
  let nodesAdded = false;
  for (const m of muts) {
    if (m.type === "attributes") {
      if (m.target.classList && m.target.classList.contains("mmd-slider")) {
        goldifySlider(m.target);
        sliderTouched = true;
      }
    } else if (m.type === "childList" && m.addedNodes.length) {
      nodesAdded = true;
    }
  }
  // batch DOM sweeps for added subtrees to one per animation frame
  if (nodesAdded && !goldifyQueued) {
    goldifyQueued = true;
    requestAnimationFrame(() => { goldifyQueued = false; goldifyAllSliders(); });
  }
});

function paintEverything() {
  const g = app.graph;
  if (!g) return;
  for (const n of g._nodes || []) paintNode(n);
  for (const gr of g._groups || g.groups || []) {
    gr.color = GOLD_FAINT;
    if (gr.font_color !== undefined) gr.font_color = GOLD;
  }
  app.canvas?.setDirty(true, true);
}

app.registerExtension({
  name: "stubelius.gold.graph",

  setup() {
    const LG = window.LiteGraph;
    const LGC = window.LGraphCanvas;

    // ── LiteGraph palette: nodes, widgets, links (canvas renderer only) ──
    if (LG) {
      LG.NODE_DEFAULT_COLOR    = INK;
      LG.NODE_DEFAULT_BGCOLOR  = INK_BODY;
      LG.NODE_DEFAULT_BOXCOLOR = GOLD_DIM;
      LG.NODE_TITLE_COLOR      = GOLD;
      LG.NODE_SELECTED_TITLE_COLOR = GOLD;
      LG.NODE_TEXT_COLOR       = GOLD_TEXT;
      LG.NODE_BOX_OUTLINE_COLOR = GOLD;
      LG.WIDGET_BGCOLOR        = INK_WIDGET;
      LG.WIDGET_OUTLINE_COLOR  = GOLD_DIM;
      LG.WIDGET_TEXT_COLOR     = GOLD;
      LG.WIDGET_SECONDARY_TEXT_COLOR = GOLD_TEXT;
      LG.LINK_COLOR            = GOLD;
      LG.EVENT_LINK_COLOR      = GOLD;
      LG.CONNECTING_LINK_COLOR = GOLD;
      LG.DEFAULT_GROUP_FONT_COLOR = GOLD;
      if (LGC?.node_colors) {
        for (const k of Object.keys(LGC.node_colors)) {
          LGC.node_colors[k] = { color: INK, bgcolor: INK_BODY, groupcolor: GOLD_FAINT };
        }
      }
    }
    if (LGC) {
      LGC.link_type_colors = new Proxy({}, { get: () => GOLD, has: () => true });
      LGC.DEFAULT_CONNECTION_COLORS = {
        input_off: GOLD_DIM, input_on: GOLD, output_off: GOLD_DIM, output_on: GOLD,
      };
    }
    if (app.canvas) {
      app.canvas.default_connection_color = {
        input_off: GOLD_DIM, input_on: GOLD, output_off: GOLD_DIM, output_on: GOLD,
      };
      app.canvas.default_connection_color_byType = new Proxy({}, { get: () => GOLD, has: () => true });
      app.canvas.default_connection_color_byTypeOff = new Proxy({}, { get: () => GOLD_DIM, has: () => true });
      app.canvas.clear_background_color = INK_DEEP;
      app.canvas.render_canvas_border = false;
    }

    // ── DOM: graph-content elements ONLY (no menus/sidebars/dialogs) ──
    const CSS = `
/* canvas background */
#graph-canvas { background: ${INK_DEEP} !important; }
/* in-node multiline text widgets (DOM overlays that belong to nodes) */
.comfy-multiline-input, .dom-widget textarea, .dom-widget input, .dom-widget select {
  background: ${INK_WIDGET} !important; color: ${GOLD_TEXT} !important;
  border: 1px solid ${GOLD_DIM} !important;
}
/* Nodes 2.0 DOM-rendered nodes */
.lg-node, [data-node-type] {
  background: ${INK_BODY} !important; border-color: ${GOLD_DIM} !important; color: ${GOLD_TEXT} !important;
}
[data-node-type] .node-title, [data-node-type] header { background: ${INK} !important; color: ${GOLD} !important; }
[data-node-type] input[type="checkbox"], [data-node-type] input[type="range"] { accent-color: ${GOLD} !important; }
/* Muse dashboards (node content) */
[class*="mmd-"] {
  --mmd-accent: ${GOLD} !important;
}
[class*="mmd-box"] {
  background: linear-gradient(180deg, ${INK_BODY} 0%, ${INK_DEEP} 100%) !important;
  border-color: ${GOLD_DIM} !important; border-top-color: ${GOLD} !important;
  box-shadow: 0 0 10px rgba(255,215,0,0.12), inset 0 0 12px rgba(255,215,0,0.04) !important;
}
/* per-box accent stripes (blue/green/red/purple/teal/amber in stock) -> gold */
.mmd-box-generation, .mmd-box-resolution, .mmd-box-sampling, .mmd-box-reference,
.mmd-box-style, .mmd-box-soundscape, .mmd-box-timeline, .mmd-box-promptgen {
  border-top-color: ${GOLD} !important; border-color: ${GOLD_DIM} !important;
}
.mmd-box-promptgen .mmd-box-title { color: ${GOLD} !important; }
[class*="mmd-"] label, [class*="mmd-"] .mmd-box-title, .mmd-box-subtitle, .mmd-chunk-heading { color: ${GOLD_TEXT} !important; }
[class*="mmd-box"] [class*="box-title"] { color: ${GOLD} !important; }
/* every control */
[class*="mmd-"] input[type="checkbox"], [class*="mmd-"] input[type="radio"],
[class*="mmd-"] input[type="range"], .mmd-box-checkbox { accent-color: ${GOLD} !important; }
[class*="mmd-"] input[type="text"], [class*="mmd-"] input[type="number"],
[class*="mmd-"] select, [class*="mmd-"] textarea, .mmd-box-select, .mmd-box-number {
  background: ${INK_WIDGET} !important; color: ${GOLD_TEXT} !important; border: 1px solid ${GOLD_DIM} !important;
}
[class*="mmd-"] select option { background: ${INK_WIDGET}; color: ${GOLD_TEXT}; }
[class*="mmd-"] input:focus, [class*="mmd-"] select:focus, [class*="mmd-"] textarea:focus {
  border-color: ${GOLD} !important; outline: none !important;
}
[class*="mmd-"] button, .mmd-analyze-btn, .mmd-av-trim-btn, .mmd-av-play-btn {
  background: #1a1408 !important; color: ${GOLD} !important; border: 1px solid ${GOLD_DIM} !important;
}
[class*="mmd-"] button:hover { border-color: ${GOLD} !important; box-shadow: 0 0 8px ${GOLD_SOFT} !important; }
/* add/delete bars (stock green/blue/red) */
.mmd-add-cut, .mmd-add-cut-bar, .mmd-add-chunk-bar, .mmd-delete-chunk-bar {
  border-color: ${GOLD_DIM} !important; color: ${GOLD} !important; background: ${INK_BODY} !important;
}
.mmd-add-cut:hover, .mmd-add-cut-bar:hover, .mmd-add-chunk-bar:hover, .mmd-delete-chunk-bar:hover {
  border-color: ${GOLD} !important; color: ${GOLD} !important; background: #1a1408 !important;
}
/* reference image slots (stock purple/amber) + video/audio panels (blue/orange) */
.mmd-char-slot, .mmd-char-slot.mmd-filled, .mmd-char-slot.mmd-bg-slot,
.mmd-av-slot, .mmd-av-slot-video, .mmd-av-slot-audio {
  border-color: ${GOLD_DIM} !important; background: ${INK_BODY} !important;
}
.mmd-char-slot:hover, .mmd-char-slot.mmd-bg-slot:hover, .mmd-av-slot:hover { border-color: ${GOLD} !important; }
.mmd-av-slot-label, .mmd-av-slot-head, .mmd-char-label, .mmd-av-filename, .mmd-av-trim-readout { color: ${GOLD_TEXT} !important; }
.mmd-mode-pill, .mmd-badge { background: rgba(255,215,0,0.13) !important; color: ${GOLD} !important; border-color: ${GOLD_DIM} !important; }
/* ── interactive states: feedback must stay VISIBLE (in gold) ── */
.mmd-speaker-chip, [class*="mmd-"] .mmd-speaker-chip {
  background: #1a1408 !important; color: ${GOLD_TEXT} !important;
  border: 1px solid ${GOLD_DIM} !important; cursor: pointer;
}
.mmd-speaker-chip.mmd-speaker-chip-active,
[class*="mmd-"] .mmd-speaker-chip.mmd-speaker-chip-active {
  background: ${GOLD} !important; color: #14100a !important;
  border-color: ${GOLD} !important; box-shadow: 0 0 10px ${GOLD_SOFT} !important;
  font-weight: 600 !important;
}
[class*="mmd-"].mmd-drag-over, [class*="mmd-"] .mmd-drag-over,
[class*="mmd-"].stub-gold-drag, [class*="mmd-"] .stub-gold-drag {
  border-color: ${GOLD} !important;
  background: rgba(255, 215, 0, 0.14) !important;
  box-shadow: inset 0 0 16px ${GOLD_SOFT}, 0 0 10px ${GOLD_SOFT} !important;
}
[class*="mmd-"] .mmd-active, .mmd-active {
  border-color: ${GOLD} !important; color: ${GOLD} !important;
}
/* catch-all: no foreign border colors anywhere inside the panels */
[class*="mmd-"], [class*="mmd-"] * { border-color: ${GOLD_DIM} !important; }
[class*="mmd-box"] { border-top-color: ${GOLD} !important; }
`;
    const style = document.createElement("style");
    style.id = "stubelius-gold-graph";
    style.textContent = CSS;
    document.head.appendChild(style);

    // drag-hover feedback for ref/media slots: stock code sets an inline
    // borderColor which our !important border rules override - re-provide the
    // highlight as a class the state CSS styles in gold.
    const DRAG_SEL = '[class*="mmd-char-slot"], [class*="mmd-av-slot"]';
    let dragHot = null;
    const clearDrag = () => { if (dragHot) { dragHot.classList.remove("stub-gold-drag"); dragHot = null; } };
    document.addEventListener("dragover", (e) => {
      const s = e.target && e.target.closest ? e.target.closest(DRAG_SEL) : null;
      if (s !== dragHot) { clearDrag(); if (s) { s.classList.add("stub-gold-drag"); dragHot = s; } }
    }, true);
    document.addEventListener("drop", clearDrag, true);
    document.addEventListener("dragend", clearDrag, true);
    document.addEventListener("dragleave", (e) => {
      if (!e.relatedTarget || e.relatedTarget === document.documentElement) clearDrag();
    }, true);

    sliderObserver.observe(document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["style"],
    });
    goldifyAllSliders();
  },

  nodeCreated(node) {
    paintNode(node);
    const s = document.getElementById("stubelius-gold-graph");
    if (s && document.head.lastElementChild !== s) document.head.appendChild(s);
    const cls = node.comfyClass || "";
    if (cls.startsWith("MuseMinimax") || cls === "MuseModelRoute") {
      const orig = node.onDrawForeground;
      node.onDrawForeground = function (ctx) {
        if (!this.flags?.collapsed) {
          ctx.save();
          const t = window.LiteGraph.NODE_TITLE_HEIGHT;
          ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
          ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-0.5, -t - 0.5, this.size[0] + 1, this.size[1] + t + 1, 8);
          ctx.stroke(); ctx.restore();
          // NOTE: no setDirtyCanvas here - a per-frame dirty flag forces the whole
          // canvas to redraw continuously and measurably loads the GPU during renders.
        }
        orig?.apply(this, arguments);
      };
    }
  },

  afterConfigureGraph() {
    paintEverything();
    goldifyAllSliders();
    const s = document.getElementById("stubelius-gold-graph");
    if (s) document.head.appendChild(s);   // move to end -> wins cascade ties
  },
  loadedGraphNode(node) { paintNode(node); },
});
