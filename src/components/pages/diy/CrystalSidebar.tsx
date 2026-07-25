

import type { CrystalCategory } from "@/types/diy";

interface CrystalSidebarProps {
  categories: CrystalCategory[];
  activeCategory: string;
  onSelectCategory: (name: string) => void;
}

export default function CrystalSidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: CrystalSidebarProps) {
  return (
    <div className="crystal-sidebar-box">
      <div id="crystal-sidebar-header" className="crystal-sidebar-header">
        <h3 className="section-title">水晶</h3>
        <div id="crystal-in-use-entry" />
      </div>

      <div
        id="crystal-master-list"
        className="master-list ui-scrollbar ui-scrollbar--thin"
      >
        {categories.map((cat) => {
          const isActive = cat.name === activeCategory;

          return (
            <button
              key={cat.name}
              className={`master-item master-item-with-icon ui-focus-ring${isActive ? " active" : ""}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <span className="master-item-icon">
                <img
                  className="master-item-icon-img"
                  src={`/assets/textures/products/${cat.img}`}
                  alt={cat.name}
                />
              </span>
              <span className="master-item-text">
                <span className="master-item-text__static">{cat.name}</span>
                <span className="master-item-text__marquee">{cat.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
