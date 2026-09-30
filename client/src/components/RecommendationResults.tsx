import { useState } from "react";
import type { ScoredRecommendation, RecipientProfile, OccasionDetails, BudgetCriteria } from "../services/giftDetectiveClient";

interface ResultsProps {
  recommendations: ScoredRecommendation[];
  recipient: RecipientProfile;
  occasion: OccasionDetails;
  budget: BudgetCriteria;
  onSaveGift: (recommendation: ScoredRecommendation) => void;
  savedGiftIds: string[];
  onRefineClues: () => void;
}

export const RecommendationResults: React.FC<ResultsProps> = ({
  recommendations,
  recipient,
  occasion,
  budget,
  onSaveGift,
  savedGiftIds,
  onRefineClues,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "price_asc" | "price_desc">("score");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(recommendations.map((r) => r.gift.category)))];

  // Filter & sort
  let filtered = recommendations.filter((r) => {
    if (selectedCategory === "all") return true;
    return r.gift.category === selectedCategory;
  });

  filtered.sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "price_asc") return a.gift.estimatedPrice - b.gift.estimatedPrice;
    if (sortBy === "price_desc") return b.gift.estimatedPrice - a.gift.estimatedPrice;
    return 0;
  });

  const handleCopyReason = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Investigation Dossier Banner */}
      <div className="dossier-card glass-panel">
        <div className="dossier-header-row">
          <div>
            <span className="case-status-badge">INVESTIGATION CONCLUDED</span>
            <h1 className="dossier-title">
              Top Recommendations for{" "}
              <span className="gold-text">
                {recipient.relationship} {recipient.name ? `(${recipient.name})` : ""}
              </span>
            </h1>
          </div>

          <button
            type="button"
            className="btn-secondary btn-refine"
            onClick={onRefineClues}
          >
            ✏️ Refine Clues
          </button>
        </div>

        {/* Clue Summary Chips */}
        <div className="dossier-chips-wrap">
          <div className="dossier-chip">
            <span className="chip-label">Occasion:</span>
            <span className="chip-val">{occasion.type || "General"}</span>
          </div>

          <div className="dossier-chip">
            <span className="chip-label">Budget:</span>
            <span className="chip-val">
              {budget.max
                ? `₹${(budget.min || 0).toLocaleString("en-IN")} – ₹${budget.max.toLocaleString("en-IN")}`
                : "Flexible"}
            </span>
          </div>

          {recipient.interests && recipient.interests.length > 0 && (
            <div className="dossier-chip">
              <span className="chip-label">Key Passions:</span>
              <span className="chip-val">{recipient.interests.join(", ")}</span>
            </div>
          )}

          {recipient.favoriteColors && recipient.favoriteColors.length > 0 && (
            <div className="dossier-chip">
              <span className="chip-label">Colors:</span>
              <span className="chip-val">{recipient.favoriteColors.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="results-controls-bar glass-panel">
        <div className="category-filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "All Recommendations" : cat}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="score">Highest Detective Score</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count-banner">
        <span>
          Showing <strong>{filtered.length}</strong> prioritized gifts solved from your evidence.
        </span>
      </div>

      {/* Recommendation Match Cards Grid */}
      <div className="matches-grid">
        {filtered.map((item, index) => {
          const isSaved = savedGiftIds.includes(item.gift.id);
          const isTopMatch = index === 0;

          return (
            <div
              key={item.gift.id}
              className={`match-card glass-panel ${isTopMatch ? "top-match-card" : ""}`}
            >
              {isTopMatch && (
                <div className="top-breakthrough-ribbon">
                  ⭐ DETECTIVE'S TOP BREAKTHROUGH
                </div>
              )}

              {/* Card Image & Badges */}
              <div className="card-image-wrap">
                <img
                  src={item.gift.imageUrl}
                  alt={item.gift.title}
                  className="card-img"
                  loading="lazy"
                />
                <div className="image-overlay-chips">
                  <span className="category-badge">{item.gift.category}</span>
                  {item.gift.vibe && (
                    <span className="vibe-badge">{item.gift.vibe}</span>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="card-body">
                {/* Score & Match Level */}
                <div className="score-row">
                  <div className="score-meter">
                    <span className="score-number">{item.score}%</span>
                    <span className="score-label">Detective Score</span>
                  </div>
                  <span className={`match-level-pill ${item.score >= 80 ? "breakthrough" : ""}`}>
                    {item.matchLevel}
                  </span>
                </div>

                {/* Title & Price */}
                <div className="title-price-row">
                  <h3 className="gift-title">{item.gift.title}</h3>
                  <div className="gift-price-block">
                    <span className="gift-price">₹{item.gift.estimatedPrice.toLocaleString("en-IN")}</span>
                    {budget.max && item.gift.estimatedPrice <= budget.max && (
                      <span className="budget-tag within">In Budget ✓</span>
                    )}
                  </div>
                </div>

                <p className="gift-desc">{item.gift.description}</p>

                {/* THE CORE DETECTIVE DEDUCTION BOX */}
                <div className="detective-reasoning-box">
                  <div className="reasoning-header">
                    <span className="reasoning-icon">🔎</span>
                    <span className="reasoning-title">DETECTIVE'S DEDUCTION</span>
                  </div>
                  <p className="reasoning-text">{item.detectiveClue}</p>

                  {/* Clue Checklist */}
                  <div className="clues-checklist">
                    {item.reasons.map((r, i) => (
                      <div key={i} className="clue-check-item">
                        <span className="check-icon">✓</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {item.potentialConcern && (
                    <div className="concern-alert">
                      <span className="concern-icon">⚠️</span>
                      <span>{item.potentialConcern}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <button
                    type="button"
                    className={`btn-save-casebook ${isSaved ? "saved" : ""}`}
                    onClick={() => onSaveGift(item)}
                  >
                    {isSaved ? "✓ Saved to Casebook" : "🔖 Save to Casebook"}
                  </button>

                  <button
                    type="button"
                    className="btn-copy-reason"
                    onClick={() => handleCopyReason(item.gift.id, item.detectiveClue)}
                    title="Copy explanation"
                  >
                    {copiedId === item.gift.id ? "✓ Copied" : "📋 Copy Deduction"}
                  </button>

                  <a
                    href={item.gift.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-view-store"
                  >
                    Store ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
