

import {
  InfoIcon,
  GalleryIcon,
} from "@/components/pages/diy/icons";

/**
 * Props for the TopActions component.
 */
export interface TopActionsProps {
  /** Callback when the Instructions button is clicked */
  onOpenInstructions?: () => void;
  /** Callback when the Gallery button is clicked */
  onOpenGallery?: () => void;
}

/**
 * TopActions — top-left action bar with Instructions and Gallery
 * （英文语言切换与官网入口已按产品要求移除）
 *
 * DOM structure:
 *   div.display-top-actions
 *   ├── div.instructions-badge > button#instructions-btn.ui-top-action (InfoIcon + "使用说明")
 *   └── button#open-gallery-btn.ui-top-action (GalleryIcon + "灵感广场")
 */
export function TopActions({
  onOpenInstructions,
  onOpenGallery,
}: TopActionsProps) {
  return (
    <div className="display-top-actions">
      {/* Instructions */}
      <div className="instructions-badge">
        <button
          id="instructions-btn"
          className="ui-top-action"
          type="button"
          onClick={onOpenInstructions}
        >
          <InfoIcon aria-hidden="true" />
          <span className="ui-top-action__label">使用说明</span>
        </button>
      </div>

      {/* Gallery */}
      <button
        id="open-gallery-btn"
        className="ui-top-action"
        type="button"
        onClick={onOpenGallery}
      >
        <GalleryIcon aria-hidden="true" />
        <span className="ui-top-action__label">灵感广场</span>
      </button>
    </div>
  );
}
