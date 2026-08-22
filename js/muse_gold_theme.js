// Muse Gold fork theme — black & neon-gold reskin for the Muse Minimax nodes.
// Loads after the stock stylesheet and overrides it; also golds the node frames
// on the classic canvas renderer.
import { app } from "../../scripts/app.js";

const GOLD = "#FFD700";
const GOLD_SOFT = "rgba(255, 215, 0, 0.35)";
const GOLD_DIM = "#b8960a";
const INK = "#0d0b06";
const INK_BODY = "#14100a";

const CSS = `
/* ── Muse Gold: dashboard reskin (overrides the stock .mmd-* styles) ── */
[class*="mmd-box"] {
  background: linear-gradient(180deg, ${INK_BODY} 0%, #0a0804 100%) !important;
  border-color: ${GOLD_DIM} !important;
  border-top-color: ${GOLD} !important;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.12), inset 0 0 12px rgba(255, 215, 0, 0.04) !important;
}
[class*="mmd-"] input[type="checkbox"],
[class*="mmd-"] input[type="radio"] {
  accent-color: ${GOLD} !important;
  box-shadow: 0 0 6px ${GOLD_SOFT};
}
[class*="mmd-"] input[type="range"] { accent-color: ${GOLD} !important; }
[class*="mmd-"] input[type="text"], [class*="mmd-"] input[type="number"],
[class*="mmd-"] select, [class*="mmd-"] textarea {
  background: #0a0804 !important; color: #f5e5a0 !important;
  border: 1px solid ${GOLD_DIM} !important;
}
[class*="mmd-"] button:not(.mmd-gear-btn) {
  background: #1a1408 !important; color: ${GOLD} !important;
  border: 1px solid ${GOLD_DIM} !important;
}
[class*="mmd-"] button:hover { border-color: ${GOLD} !important; box-shadow: 0 0 8px ${GOLD_SOFT} !important; }
[class*="mmd-box"] [class*="box-title"], [class*="mmd-"] .mmd-box-title { color: ${GOLD} !important; }
@keyframes muse-gold-breathe {
  0%, 100% { box-shadow: 0 0 6px ${GOLD_SOFT}; }
  50%      { box-shadow: 0 0 18px rgba(255, 215, 0, 0.55); }
}
[data-node-type^="MuseMinimax"], [data-node-type="MuseModelRoute"] {
  background: ${INK_BODY} !important;
  border: 1.5px solid ${GOLD} !important;
  border-radius: 10px !important;
  animation: muse-gold-breathe 3s ease-in-out infinite !important;
}
`;

app.registerExtension({
  name: "muse.gold.fork.theme",
  setup() {
    const style = document.createElement("style");
    style.id = "muse-gold-fork-theme";
    style.textContent = CSS;
    document.head.appendChild(style);
  },
  nodeCreated(node) {
    const cls = node.comfyClass || "";
    if (!cls.startsWith("MuseMinimax") && cls !== "MuseModelRoute") return;
    node.color = INK;
    node.bgcolor = INK_BODY;
    const orig = node.onDrawForeground;
    node.onDrawForeground = function (ctx) {
      if (!this.flags?.collapsed) {
        ctx.save();
        const t = LiteGraph.NODE_TITLE_HEIGHT;
        const pulse = 0.55 + 0.45 * Math.sin(performance.now() / 700);
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 7 + 9 * pulse;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-0.5, -t - 0.5, this.size[0] + 1, this.size[1] + t + 1, 8);
        ctx.stroke();
        ctx.restore();
        this.setDirtyCanvas(true, false);
      }
      orig?.apply(this, arguments);
    };
  },
});
