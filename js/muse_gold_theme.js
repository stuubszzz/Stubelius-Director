// ═══════════════════════════════════════════════════════════════════════════
// STUBELIUS GOLD — black & neon-gold theme for the MUSE/STUBELIUS NODES ONLY.
// Scoped: only this pack's nodes (MuseMinimax*, MuseModelRoute, Stubelius*) get the
// gold-on-black paint, outline and widget styling. The rest of the graph, the canvas,
// links, groups and app chrome are left exactly as the user's own theme has them.
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

function isMuse(node) {
  const cls = (node && node.comfyClass) || "";
  return cls.startsWith("MuseMinimax") || cls === "MuseModelRoute" || cls.startsWith("Stubelius");
}
function paintNode(node) {
  if (!isMuse(node)) return;
  node.color = INK;
  node.bgcolor = INK_BODY;
  // per-CLASS title color is safe here: the constructor is one of ours
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
  for (const n of g._nodes || []) paintNode(n);   // no-op for non-Muse nodes
  app.canvas?.setDirty(true, true);
}

app.registerExtension({
  name: "stubelius.gold.graph",

  setup() {
    // (global LiteGraph palette, link colors and canvas background intentionally
    // NOT touched - this theme is scoped to the pack's own nodes and dashboards.)

    // ── DOM: graph-content elements ONLY (no menus/sidebars/dialogs) ──
    const CSS = `
/* Nodes 2.0 DOM-rendered nodes - THIS PACK'S classes only */
[data-node-type^="MuseMinimax"], [data-node-type="MuseModelRoute"], [data-node-type^="Stubelius"] {
  background: ${INK_BODY} !important; border-color: ${GOLD_DIM} !important; color: ${GOLD_TEXT} !important;
}
[data-node-type^="MuseMinimax"] .node-title, [data-node-type^="MuseMinimax"] header,
[data-node-type="MuseModelRoute"] .node-title, [data-node-type="MuseModelRoute"] header,
[data-node-type^="Stubelius"] .node-title, [data-node-type^="Stubelius"] header {
  background: ${INK} !important; color: ${GOLD} !important;
}
[data-node-type^="MuseMinimax"] input[type="checkbox"], [data-node-type^="MuseMinimax"] input[type="range"],
[data-node-type^="Stubelius"] input[type="checkbox"], [data-node-type^="Stubelius"] input[type="range"] {
  accent-color: ${GOLD} !important;
}
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
