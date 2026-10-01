import { useState, useEffect } from "react";
import { INITIAL_GIFTS } from "../data/seedGifts";
import type { GiftItem } from "../data/seedGifts";
import { apiGetGifts } from "../services/api";

interface CatalogProps {
  onQuickInspect: (gift: GiftItem) => void;
}

export const GiftCatalog: React.FC<CatalogProps> = ({ onQuickInspect }) => {
  const [giftsList, setGiftsList] = useState<GiftItem[]>(INITIAL_GIFTS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetGifts()
      .then((data) => {
        if (data && data.length > 0) {
          setGiftsList(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(giftsList.map((g) => g.category)))];

  const filtered = giftsList.filter((gift) => {
    const matchesCat = selectedCategory === "all" || gift.category === selectedCategory;
    const matchesPrice = gift.estimatedPrice <= maxPrice;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      gift.title.toLowerCase().includes(query) ||
      gift.description.toLowerCase().includes(query) ||
      gift.tags.some((t) => t.toLowerCase().includes(query)) ||
      (gift.detectiveClue && gift.detectiveClue.toLowerCase().includes(query));

    return matchesCat && matchesPrice && matchesSearch;
  });

  return (
    <div className="catalog-container animate-fade-in">
      {/* Catalog Header */}
      <div className="catalog-header glass-panel">
        <div>
          <span className="case-status-badge">EVIDENCE ARCHIVE</span>
          <h1 className="catalog-title">Curated Gift Catalog</h1>
          <p className="catalog-subtitle">
            Explore <strong>{INITIAL_GIFTS.length} curated items</strong> with built-in detective clues across Technology, Fashion, Hobbies, and Living.
          </p>
        </div>

        {/* Search Input */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search gifts, tags, or clues (e.g. coffee, painting, leather)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="catalog-controls glass-panel">
        <div className="category-filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="price-slider-wrap">
          <label>Max Price: <strong>₹{maxPrice.toLocaleString("en-IN")}</strong></label>
          <input
            type="range"
            min="500"
            max="10000"
            step="250"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="price-slider"
          />
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "1rem", color: "var(--accent-gold)" }}>
          <span>🔍 Synchronizing detective evidence archive...</span>
        </div>
      )}

      {/* Grid */}
      <div className="catalog-grid">
        {filtered.map((gift) => (
          <div key={gift.id} className="catalog-item-card glass-panel">
            <div className="catalog-img-wrap">
              <img
                src={gift.imageUrl}
                alt={gift.title}
                className="catalog-img"
                loading="lazy"
              />
              <span className="category-badge">{gift.category}</span>
            </div>

            <div className="catalog-body">
              <div className="catalog-meta-row">
                <span className="catalog-price">₹{gift.estimatedPrice.toLocaleString("en-IN")}</span>
                {gift.vibe && <span className="vibe-tag">{gift.vibe}</span>}
              </div>

              <h3 className="catalog-item-title">{gift.title}</h3>
              <p className="catalog-item-desc">{gift.description}</p>

              {/* Detective Clue Preview */}
              <div className="clue-preview-box">
                <span className="clue-tag">Clue:</span>
                <span className="clue-text">{gift.detectiveClue}</span>
              </div>

              <div className="catalog-actions">
                <button
                  type="button"
                  className="btn-quick-inspect"
                  onClick={() => onQuickInspect(gift)}
                >
                  Investigate Matching Profile 🔍
                </button>
                <a
                  href={gift.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-store-link"
                >
                  Store ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
