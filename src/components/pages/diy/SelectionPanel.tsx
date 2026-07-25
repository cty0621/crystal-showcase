

import CrystalSidebar from "./CrystalSidebar";
import CrystalContent from "./CrystalContent";
import { SearchIcon } from "./icons";
import type { CrystalCategory, BeadVariant, BraceletBead } from "@/types/diy";

/* ------------------------------------------------------------------ */
/*  Default crystal categories — used when no external data supplied  */
/* ------------------------------------------------------------------ */

const DEFAULT_CATEGORIES: CrystalCategory[] = [
  { name: "白水晶", img: "prod_052.webp", active: true },
  { name: "紫水晶", img: "prod_067.webp" },
  { name: "黄水晶", img: "prod_088.webp" },
  { name: "粉水晶", img: "prod_064.webp" },
  { name: "茶水晶", img: "prod_073.webp" },
  { name: "幽灵水晶", img: "prod_019.webp" },
  { name: "发晶", img: "prod_013.webp" },
  { name: "兔毛水晶", img: "prod_001.webp" },
  { name: "胶花水晶", img: "prod_071.webp" },
  { name: "海蓝宝", img: "prod_039.webp" },
  { name: "草莓晶", img: "prod_076.webp" },
  { name: "萤石", img: "prod_078.webp" },
  { name: "曜石", img: "prod_028.webp" },
  { name: "葡萄石", img: "prod_080.webp" },
  { name: "天河石", img: "prod_016.webp" },
  { name: "虎眼石", img: "prod_084.webp" },
  { name: "太阳石", img: "prod_017.webp" },
  { name: "月光石", img: "prod_034.webp" },
  { name: "蔷薇石", img: "prod_082.webp" },
  { name: "玉石", img: "prod_043.webp" },
  { name: "玛瑙", img: "prod_045.webp" },
  { name: "朱砂", img: "prod_036.jpg" },
  { name: "文玩", img: "prod_022.webp" },
  { name: "其他", img: "prod_003.webp" },
];

/** Default bead variants for the active category (白水晶). */
const DEFAULT_BEADS: BeadVariant[] = [
  { name: "净体白水晶", size: "6mm", price: "¥3", img: "prod_052.webp" },
  { name: "净体白水晶", size: "8mm", price: "¥5", img: "prod_052.webp" },
  { name: "净体白水晶", size: "10mm", price: "¥8", img: "prod_052.webp" },
  { name: "净体白水晶", size: "12mm", price: "¥12", img: "prod_052.webp" },
  { name: "奶白晶", size: "8mm", price: "¥5", img: "prod_053.webp" },
  { name: "奶白晶", size: "10mm", price: "¥8", img: "prod_053.webp" },
  { name: "奶白晶", size: "12mm", price: "¥12", img: "prod_053.webp" },
  { name: "婚纱闪白阿塞", size: "8mm", price: "¥5", img: "prod_054.jpg" },
  { name: "婚纱闪白阿塞", size: "10mm", price: "¥8", img: "prod_054.jpg" },
  { name: "婚纱闪白阿塞", size: "12mm", price: "¥12", img: "prod_054.jpg" },
  { name: "白水晶小熊", size: "12mm", price: "¥12", img: "prod_057.webp", unavailable: true },
  { name: "白水晶方体随形", size: "10mm", price: "¥8", img: "prod_058.webp" },
  { name: "白水晶立方（小）", size: "10mm", price: "¥8", img: "prod_059.webp" },
  { name: "白水晶立方（大）", size: "14mm", price: "¥16", img: "prod_059.webp" },
  { name: "白水晶药片珠", size: "9×5mm", price: "¥3", img: "prod_060.webp" },
  { name: "白水晶蝴蝶结", size: "12mm", price: "¥12", img: "prod_061.webp", unavailable: true },
  { name: "白水晶跑环", size: "15×4mm", price: "¥3", img: "prod_062.webp" },
  { name: "白水晶随形", size: "8×10mm", price: "¥8", img: "prod_063.webp" },
  { name: "白水晶 Kitty 猫", size: "12mm", price: "¥12", img: "prod_055.webp", unavailable: true },
  { name: "白水晶刻面方糖", size: "10mm", price: "¥8", img: "prod_056.webp" },
];

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SelectionPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: CrystalCategory[];
  activeCategory: string;
  onSelectCategory: (name: string) => void;
  currentBeads: BeadVariant[];
  onAddBead: (bead: BeadVariant) => void;
  onPreviewBead: (bead: BeadVariant) => void;
  beadsInUse: BraceletBead[];
  beadTotalCount: number;
  beadTypeCount: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SelectionPanel({
  searchQuery = "",
  onSearchChange,
  categories = DEFAULT_CATEGORIES,
  activeCategory = "白水晶",
  onSelectCategory,
  currentBeads = DEFAULT_BEADS,
  onAddBead,
  onPreviewBead,
  beadsInUse = [],
  beadTotalCount = 0,
  beadTypeCount = 0,
}: SelectionPanelProps) {
  return (
    <section className="selection-panel">
      {/* --- Search Header --- */}
      <div className="panel-search-header">
        <div className="search-container">
          <SearchIcon />
          <input
            id="search-input"
            className="ui-input ui-focus-ring"
            type="text"
            placeholder="搜索水晶名称…"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* --- Panel Body --- */}
      <div className="panel-body">
        {/* In-Use Section */}
        <section className="section section-in-use">
          <div className="in-use-container">
            <div className="in-use-title-box">
              <h3 className="section-title">正在使用</h3>
              <div className="ui-chip-row mt-2">
                <span className="ui-chip ui-chip--sm">{beadTotalCount}颗</span>
                <span className="ui-chip ui-chip--sm">{beadTypeCount}种</span>
              </div>
            </div>
            <div className="in-use-content-box ui-scrollbar ui-scrollbar--thin">
              {beadsInUse.length > 0 ? (
                <div id="beads-in-use" className="beads-in-use-grid">
                  {beadsInUse.map((bead) => (
                    <div key={bead.id} className="bead-card">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div id="empty-state-in-use" className="empty-state show">
                  <br />
                  还没有添加珠子
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Crystal Browser Section */}
        <section className="section section-crystal">
          <div className="crystal-container">
            <CrystalSidebar
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={onSelectCategory ?? (() => {})}
            />
            <CrystalContent
              crystalName={activeCategory}
              beadCount={currentBeads.length}
              beads={currentBeads}
              onAddBead={onAddBead ?? (() => {})}
              onPreviewBead={onPreviewBead ?? (() => {})}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
