import { useState } from "react";
import type { SavedGiftItem } from "../services/api";

interface CasebookProps {
  savedGifts: SavedGiftItem[];
  onUpdateStatus: (id: string, status: "CONSIDERING" | "PURCHASED" | "ARCHIVED") => void;
  onRemove: (id: string) => void;
  onStartNewQuiz: () => void;
}

export const Casebook: React.FC<CasebookProps> = ({
  savedGifts,
  onUpdateStatus,
  onRemove,
  onStartNewQuiz,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filtered = savedGifts.filter((item) => {
    if (filterStatus === "ALL") return true;
    return item.status === filterStatus;
  });

  // Calculate financials (Planned, Spent, Remaining)
  const totalConsidering = savedGifts
    .filter((s) => s.status === "CONSIDERING")
    .reduce((sum, s) => sum + s.giftIdea.estimatedPrice, 0);

  const totalSpent = savedGifts
    .filter((s) => s.status === "PURCHASED")
    .reduce((sum, s) => sum + s.giftIdea.estimatedPrice, 0);

  // Planned budget is the total value of items considering + purchased (or minimum 5000 if empty)
  const [allocatedBudget, setAllocatedBudget] = useState<number | null>(null);
  const totalPlanned = allocatedBudget !== null ? allocatedBudget : Math.max(totalConsidering + totalSpent, 3000);
  const totalRemaining = Math.max(0, totalPlanned - totalSpent);

  return (
    <div className="casebook-container animate-fade-in">
      {/* Casebook Banner */}
      <div className="casebook-banner glass-panel">
        <div className="casebook-title-row">
          <div>
            <span className="case-status-badge">DETECTIVE DOSSIER</span>
            <h1 className="casebook-title">Your Casebook of Saved Gifts</h1>
            <p className="casebook-subtitle" style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Track your investigative shortlist, budget allocation, and purchased items.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary-glow"
            onClick={onStartNewQuiz}
          >
            + New Investigation
          </button>
        </div>

        {/* Budget Tracker Cards: Planned, Spent, Remaining */}
        <div className="financials-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "20px" }}>
          <div className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="stat-label">Planned Budget</span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-gold)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "0 4px",
                }}
                onClick={() => {
                  const val = window.prompt("Enter your target planned budget in ₹:", String(totalPlanned));
                  if (val && !isNaN(Number(val))) {
                    setAllocatedBudget(Math.max(500, Number(val)));
                  }
                }}
              >
                Edit ✏️
              </button>
            </div>
            <span className="stat-val text-gold">₹{totalPlanned.toLocaleString("en-IN")}</span>
            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Total allocated funds</small>
          </div>

          <div className="stat-card">
            <span className="stat-label">Spent</span>
            <span className="stat-val text-emerald">₹{totalSpent.toLocaleString("en-IN")}</span>
            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              {savedGifts.filter((s) => s.status === "PURCHASED").length} gift(s) purchased
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-label">Remaining</span>
            <span className={`stat-val ${totalRemaining > 0 ? "text-emerald" : "text-gold"}`}>
              ₹{totalRemaining.toLocaleString("en-IN")}
            </span>
            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Balance available</small>
          </div>

          <div className="stat-card">
            <span className="stat-label">Considering Leads</span>
            <span className="stat-val">{savedGifts.filter((s) => s.status === "CONSIDERING").length}</span>
            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              ₹{totalConsidering.toLocaleString("en-IN")} potential
            </small>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="casebook-filter-bar glass-panel">
        <div className="status-tabs">
          {["ALL", "CONSIDERING", "PURCHASED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-tab ${filterStatus === st ? "active" : ""}`}
              onClick={() => setFilterStatus(st)}
            >
              {st} ({st === "ALL" ? savedGifts.length : savedGifts.filter((s) => s.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <span className="empty-icon">📁</span>
          <h3>No records found in this dossier</h3>
          <p>
            {savedGifts.length === 0
              ? "You haven't saved any gift leads yet. Run an investigation to uncover tailored recommendations."
              : `No items currently marked with status "${filterStatus}".`}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={onStartNewQuiz}
            style={{ marginTop: "16px" }}
          >
            Start an Investigation 🔍
          </button>
        </div>
      ) : (
        /* Saved Gifts Grid */
        <div className="casebook-grid">
          {filtered.map((item) => (
            <div key={item.id} className="casebook-item-card glass-panel">
              <div className="item-thumb-wrap">
                <img
                  src={item.giftIdea.imageUrl || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600"}
                  alt={item.giftIdea.title}
                  className="item-thumb"
                />
                <span className={`status-pill ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="item-details">
                <div className="item-target">
                  Target: <strong>{item.recipientName || "General Recipient"}</strong>
                </div>

                <h3 className="item-title">{item.giftIdea.title}</h3>
                <span className="item-price">₹{item.giftIdea.estimatedPrice.toLocaleString("en-IN")}</span>

                <p className="item-desc">{item.giftIdea.description}</p>

                {/* Status Switcher & Remove */}
                <div className="item-actions-row">
                  <div className="status-select-wrap">
                    <label>Status:</label>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                      className="status-dropdown"
                    >
                      <option value="CONSIDERING">Considering</option>
                      <option value="PURCHASED">Purchased ✓</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => onRemove(item.id)}
                    title="Remove from casebook"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
