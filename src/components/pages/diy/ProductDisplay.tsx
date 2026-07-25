

import { TopActions } from "./TopActions";
import { InfoBadges } from "./InfoBadges";
import ActionButtons from "./ActionButtons";
import type { BraceletBead, BeadVariant, WristSizeCategory } from "@/types/diy";

interface ProductDisplayProps {
  /** Wrist size category for the info badge */
  wristSize: WristSizeCategory;
  /** Price string for the info badge */
  price: string;
  /** Beads currently placed on the bracelet */
  beads: BraceletBead[];
  /** Whether the bracelet is in scattered mode */
  isScattered: boolean;
  /** Whether the bracelet is in 3D mode */
  isThreeD: boolean;
  /** Clear all beads from the bracelet */
  onClear: () => void;
  /** Toggle scattered mode */
  onToggleScatter: () => void;
  /** Toggle 3D mode */
  onToggleThreeD: () => void;
  /** Finish/submit the current design */
  onFinish: () => void;
  /** Open the instructions modal */
  onOpenInstructions: () => void;
  /** Open the gallery view */
  onOpenGallery: () => void;
  /** Add a bead to the bracelet */
  onBeadAdd: (bead: BeadVariant) => void;
  /** Remove a bead from the bracelet by ID */
  onBeadRemove: (beadId: string) => void;
  /** Reorder a bead from one index to another */
  onBeadReorder: (fromIndex: number, toIndex: number) => void;
}

/** Constants for the bracelet SVG geometry */
const BEAD_SIZE = 28;
const CIRCLE_CX = 200;
const CIRCLE_CY = 195;
const CIRCLE_R = 130;
const HALF_BEAD = BEAD_SIZE / 2;

/**
 * Calculate the x/y position of a bead on the bracelet circle
 * given its angle in radians.
 */
function getBeadPosition(angle: number) {
  return {
    x: CIRCLE_CX + CIRCLE_R * Math.cos(angle),
    y: CIRCLE_CY + CIRCLE_R * Math.sin(angle),
  };
}

/**
 * ProductDisplay — the left panel wrapper for the bracelet designer.
 *
 * Contains the top actions bar, info badges, the bracelet SVG canvas,
 * action buttons, and a tagline.
 */
export default function ProductDisplay({
  wristSize,
  price,
  beads,
  isScattered,
  isThreeD,
  onClear,
  onToggleScatter,
  onToggleThreeD,
  onFinish,
  onOpenInstructions,
  onOpenGallery,
}: ProductDisplayProps) {
  const containerClass = `bracelet-container${isThreeD ? " bracelet-container--3d" : ""}`;

  return (
    <section className="product-display">
      {/* Top row: actions + info badges */}
      <div className="display-top-row">
        <TopActions
          onOpenInstructions={onOpenInstructions}
          onOpenGallery={onOpenGallery}
        />
        <InfoBadges wristSize={wristSize} price={price} />
      </div>

      {/* Body: bracelet canvas, action buttons, tagline */}
      <div className="display-body">
        <div className={containerClass}>
          <svg
            id="bracelet-svg"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="shadow-blur">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id="outer-shadow-blur">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <filter id="highlight-blur">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {/* Empty state hint — only shown when no beads are placed */}
            {beads.length === 0 && (
              <text
                id="empty-hint"
                x={CIRCLE_CX}
                y={CIRCLE_CY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
              >
                点击右侧珠子开始设计
              </text>
            )}

            {/* Dotted circle outline for the bracelet track */}
            <g id="bracelet-circle">
              <circle
                cx={CIRCLE_CX}
                cy={CIRCLE_CY}
                r={CIRCLE_R}
                fill="none"
                stroke="#adacac"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </g>

            {/* Beads — rendered in three layers for visual depth */}
            <g id="beads-container">
              {/* Shadow layer — dark blurred circles offset beneath each bead */}
              <g id="shadows-layer">
                {beads.map((bead) => {
                  const pos = getBeadPosition(bead.position);
                  return (
                    <circle
                      key={`shadow-${bead.id}`}
                      cx={pos.x + 2}
                      cy={pos.y + 3}
                      r={HALF_BEAD}
                      fill="rgba(0,0,0,0.25)"
                      filter="url(#shadow-blur)"
                    />
                  );
                })}
              </g>

              {/* Image layer — the actual bead images */}
              <g id="images-layer">
                {beads.map((bead) => {
                  const pos = getBeadPosition(bead.position);
                  return (
                    <image
                      key={`img-${bead.id}`}
                      href={`/assets/textures/products/${bead.img}`}
                      x={pos.x - HALF_BEAD}
                      y={pos.y - HALF_BEAD}
                      width={BEAD_SIZE}
                      height={BEAD_SIZE}
                    />
                  );
                })}
              </g>

              {/* Highlight layer — small light reflections on each bead */}
              <g id="highlights-layer">
                {beads.map((bead) => {
                  const pos = getBeadPosition(bead.position);
                  return (
                    <ellipse
                      key={`hl-${bead.id}`}
                      cx={pos.x - 4}
                      cy={pos.y - 4}
                      rx={HALF_BEAD * 0.5}
                      ry={HALF_BEAD * 0.35}
                      fill="rgba(255,255,255,0.35)"
                      filter="url(#highlight-blur)"
                    />
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        {/* Bottom action buttons: clear, scatter, 3D toggle, finish */}
        <ActionButtons
          isScattered={isScattered}
          isThreeD={isThreeD}
          onClear={onClear}
          onToggleScatter={onToggleScatter}
          onToggleThreeD={onToggleThreeD}
          onFinish={onFinish}
        />

        {/* Tagline */}
        <p className="tagline">开启你的水晶疗愈之旅</p>
      </div>
    </section>
  );
}
