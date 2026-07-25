

import type { BeadVariant } from "@/types/diy";

interface CrystalContentProps {
  crystalName: string;
  beadCount: number;
  beads: BeadVariant[];
  onAddBead: (bead: BeadVariant) => void;
  onPreviewBead: (bead: BeadVariant) => void;
}

export default function CrystalContent({
  crystalName,
  beadCount,
  beads,
  onAddBead,
  onPreviewBead,
}: CrystalContentProps) {
  return (
    <div className="crystal-content-box">
      <div className="ui-panel-header">
        <div className="ui-panel-title">{crystalName}</div>
        <div className="ui-chip ui-chip--sm">{beadCount}</div>
      </div>
      <div
        id="crystal-detail-view"
        className="detail-view ui-scrollbar ui-scrollbar--thin"
      >
        <div className="detail-grid">
          {beads.map((bead, index) => (
            <button
              key={index}
              type="button"
              className={`bead-card ui-focus-ring${bead.unavailable ? " bead-card--unavailable" : ""}`}
              onClick={() => onAddBead(bead)}
              onMouseEnter={() => onPreviewBead(bead)}
              disabled={bead.unavailable}
            >
              <img
                className="bead-image"
                src={`/assets/textures/products/${bead.img}`}
                alt={bead.name}
                draggable={false}
              />
              <div className="bead-name">{bead.name}</div>
              <div className="bead-details">
                <span className="bead-size">{bead.size}</span>
                <span className="bead-price">{bead.price}</span>
              </div>
              {bead.unavailable && (
                <div className="bead-stock-pill">库存不足</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
