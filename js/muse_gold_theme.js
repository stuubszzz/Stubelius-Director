// ═══════════════════════════════════════════════════════════════════════════
// STUBELIUS GOLD — total black & neon-gold theme for the ENTIRE ComfyUI UI.
// Every node, every wire, every widget, every menu: gold on black, nothing else.
// Muse nodes additionally get a pulsing gold edge.
// ═══════════════════════════════════════════════════════════════════════════
import { app } from "../../scripts/app.js";

const GOLD       = "#FFD700";
const GOLD_SOFT  = "rgba(255, 215, 0, 0.35)";
const GOLD_DIM   = "#b8960a";
const GOLD_FAINT = "#6b5606";
const GOLD_TEXT  = "#f5e5a0";
const INK        = "#0d0b06";   // title bars
const INK_BODY   = "#14100a";   // node bodies
const INK_DEEP   = "#080704";   // canvas / inputs
const INK_WIDGET = "#0a0804";

function paintNode(node) {
  node.color = INK;
  node.bgcolor = INK_BODY;
  if (node.constructor) {
    node.constructor.title_text_color = GOLD;
  }
}

function paintEverything() {
  const g = app.graph;
  if (!g) return;
  for (const n of g._nodes || []) paintNode(n);
  for (const gr of g._groups || g.groups || []) {
    gr.color = GOLD_FAINT;           // group frame
    if (gr.font_color !== undefined) gr.font_color = GOLD;
  }
  app.canvas?.setDirty(true, true);
}

app.registerExtension({
  name: "stubelius.gold.total",

  setup() {
    const LG = window.LiteGraph;
    const LGC = window.LGraphCanvas;

    // ── LiteGraph global palette (classic canvas renderer) ──
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
      // preset color swatches (right-click > Colors) all become gold/black
      if (LGC?.node_colors) {
        for (const k of Object.keys(LGC.node_colors)) {
          LGC.node_colors[k] = { color: INK, bgcolor: INK_BODY, groupcolor: GOLD_FAINT };
        }
      }
    }
    // every link data-type color -> gold
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

    // ── DOM side: widgets, menus, dialogs, Nodes 2.0, Muse panels ──
    const CSS = `
:root {
  --stub-gold: ${GOLD}; --stub-ink: ${INK_DEEP};
  --comfy-menu-bg: ${INK} !important;
  --comfy-menu-secondary-bg: ${INK_BODY} !important;
  --comfy-input-bg: ${INK_WIDGET} !important;
  --input-text: ${GOLD_TEXT} !important;
  --descrip-text: ${GOLD_DIM} !important;
  --drag-text: ${GOLD} !important;
  --error-text: #ff9d3d !important;
  --border-color: ${GOLD_DIM} !important;
  --fg-color: ${GOLD} !important;
  --bg-color: ${INK_DEEP} !important;
  --content-bg: ${INK_BODY} !important;
  --content-fg: ${GOLD_TEXT} !important;
  --p-primary-color: ${GOLD} !important;
  --p-content-background: ${INK_BODY} !important;
  --p-text-color: ${GOLD_TEXT} !important;
}
body, #graph-canvas { background: ${INK_DEEP} !important; }
input[type="checkbox"], input[type="radio"], input[type="range"], progress {
  accent-color: ${GOLD} !important;
}
input[type="text"], input[type="number"], textarea, select {
  background: ${INK_WIDGET} !important; color: ${GOLD_TEXT} !important;
  border-color: ${GOLD_DIM} !important;
}
select option { background: ${INK_WIDGET}; color: ${GOLD_TEXT}; }
button, .p-button {
  background: ${INK_BODY} !important; color: ${GOLD} !important;
  border: 1px solid ${GOLD_DIM} !important;
}
button:hover, .p-button:hover { border-color: ${GOLD} !important; box-shadow: 0 0 8px ${GOLD_SOFT} !important; }
.litecontextmenu, .litemenu-entry, .comfy-context-menu-filter,
.p-menu, .p-contextmenu, .p-dropdown-panel, .p-select-overlay, .p-popover,
.comfy-modal, .p-dialog, .p-toast-message {
  background: ${INK} !important; color: ${GOLD_TEXT} !important;
  border: 1px solid ${GOLD_DIM} !important;
}
.litemenu-entry:hover, .p-menu-item:hover, .p-select-option:hover {
  background: ${GOLD_FAINT} !important; color: ${GOLD} !important;
}
.p-slider-range, .p-progressbar-value { background: ${GOLD} !important; }
.p-slider-handle { background: ${GOLD} !important; border-color: ${GOLD} !important; }
.p-togglebutton.p-togglebutton-checked, .p-checkbox-checked .p-checkbox-box,
.p-inputswitch-checked .p-inputswitch-slider { background: ${GOLD} !important; border-color: ${GOLD} !important; }
/* Nodes 2.0 DOM nodes */
.lg-node, [data-node-type] {
  background: ${INK_BODY} !important; border-color: ${GOLD_DIM} !important; color: ${GOLD_TEXT} !important;
}
[data-node-type] .node-title, [data-node-type] header { background: ${INK} !important; color: ${GOLD} !important; }
/* Muse dashboards */
[class*="mmd-box"] {
  background: linear-gradient(180deg, ${INK_BODY} 0%, ${INK_DEEP} 100%) !important;
  border-color: ${GOLD_DIM} !important; border-top-color: ${GOLD} !important;
  box-shadow: 0 0 10px rgba(255,215,0,0.12), inset 0 0 12px rgba(255,215,0,0.04) !important;
}
[class*="mmd-"], [class*="mmd-"] label, [class*="mmd-"] .mmd-box-title { color: ${GOLD_TEXT} !important; }
[class*="mmd-box"] [class*="box-title"] { color: ${GOLD} !important; }
[class*="mmd-"] button { background: #1a1408 !important; color: ${GOLD} !important; border: 1px solid ${GOLD_DIM} !important; }
`;
    const style = document.createElement("style");
    style.id = "stubelius-gold-total";
    style.textContent = CSS;
    document.head.appendChild(style);
  },

  nodeCreated(node) {
    paintNode(node);
    // pulsing gold edge for the Muse dashboards only (perf: not on all nodes)
    const cls = node.comfyClass || "";
    if (cls.startsWith("MuseMinimax") || cls === "MuseModelRoute") {
      const orig = node.onDrawForeground;
      node.onDrawForeground = function (ctx) {
        if (!this.flags?.collapsed) {
          ctx.save();
          const t = window.LiteGraph.NODE_TITLE_HEIGHT;
          const pulse = 0.55 + 0.45 * Math.sin(performance.now() / 700);
          ctx.shadowColor = GOLD; ctx.shadowBlur = 7 + 9 * pulse;
          ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-0.5, -t - 0.5, this.size[0] + 1, this.size[1] + t + 1, 8);
          ctx.stroke(); ctx.restore();
          this.setDirtyCanvas(true, false);
        }
        orig?.apply(this, arguments);
      };
    }
  },

  // saved workflows restore their own node/group colors during configure —
  // sweep afterwards so gold/black always wins
  afterConfigureGraph() { paintEverything(); },
  loadedGraphNode(node) { paintNode(node); },
});
