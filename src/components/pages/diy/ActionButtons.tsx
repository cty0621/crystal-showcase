

import { TrashIcon, ScatterIcon, ThreeDIcon, CheckIcon } from "@/components/pages/diy/icons";

interface ActionButtonsProps {
  isScattered: boolean;
  isThreeD: boolean;
  onClear: () => void;
  onToggleScatter: () => void;
  onToggleThreeD: () => void;
  onFinish: () => void;
}

export default function ActionButtons({
  isScattered,
  isThreeD,
  onClear,
  onToggleScatter,
  onToggleThreeD,
  onFinish,
}: ActionButtonsProps) {
  return (
    <div className="display-actions">
      <button id="clear-btn" className="btn btn-reset ui-focus-ring" onClick={onClear}>
        <TrashIcon />
        <span className="btn-label">清空</span>
      </button>

      <button
        id="scatter-toggle-btn"
        className={`btn btn-scatter ui-focus-ring${isScattered ? " is-scattered" : ""}`}
        onClick={onToggleScatter}
      >
        <ScatterIcon />
        <span className="btn-label">解开盘珠</span>
      </button>

      <button
        id="three-toggle-btn"
        className={`btn btn-three ui-focus-ring${isThreeD ? " is-three-d" : ""}`}
        onClick={onToggleThreeD}
      >
        <ThreeDIcon />
        <span className="btn-label">立体旋转</span>
      </button>

      <button id="finish-btn" className="btn btn-finish ui-focus-ring" onClick={onFinish}>
        <CheckIcon />
        <span className="btn-label">完成</span>
      </button>
    </div>
  );
}
