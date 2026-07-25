

interface InfoBadgesProps {
  wristSize: "偏小" | "合适" | "偏大";
  price: string;
}

export function InfoBadges({ wristSize, price }: InfoBadgesProps) {
  return (
    <div className="display-info-badges">
      <div className="info-badge size-badge">
        <img
          className="badge-icon"
          src="/assets/textures/icons/hand.svg"
          alt="Hand"
          width={24}
          height={24}
        />
        <div className="badge-content">
          <div className="badge-label">手围</div>
          <div className="badge-value">{wristSize}</div>
        </div>
      </div>
      <div className="info-badge price-badge">
        <img
          className="badge-icon"
          src="/assets/textures/icons/dollar.svg"
          alt="Price"
          width={24}
          height={24}
        />
        <div className="badge-content">
          <div className="badge-label">价格</div>
          <div className="badge-value">{price}</div>
        </div>
      </div>
    </div>
  );
}
