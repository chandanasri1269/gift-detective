import type { User } from "../services/api";

interface HeaderProps {
  activeTab: "quiz" | "results" | "casebook" | "catalog";
  setActiveTab: (tab: "quiz" | "results" | "casebook" | "catalog") => void;
  savedCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  user,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="header-container glass-panel">
      <div className="header-content">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => setActiveTab("quiz")}
          style={{ cursor: "pointer" }}
        >
          <span className="logo-icon">🕵️‍♂️</span>
          <div className="logo-text">
            <span className="logo-title">GIFT DETECTIVE</span>
            <span className="logo-tagline">CLUE-BASED RECOMMENDATION ENGINE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            <span>🔍</span> Investigate
          </button>

          {activeTab === "results" && (
            <button
              type="button"
              className="nav-btn active"
              onClick={() => setActiveTab("results")}
            >
              <span>📊</span> Results
            </button>
          )}

          <button
            type="button"
            className={`nav-btn ${activeTab === "casebook" ? "active" : ""}`}
            onClick={() => setActiveTab("casebook")}
          >
            <span>🔖</span> Casebook
            {savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            <span>📦</span> Catalog
          </button>
        </nav>

        {/* User Actions */}
        <div className="header-user">
          {user ? (
            <div className="user-profile">
              <span className="user-badge">Agent</span>
              <span className="user-name">{user.name}</span>
              <button
                type="button"
                className="user-logout-btn"
                onClick={onLogout}
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="auth-trigger-btn"
              onClick={onOpenAuth}
            >
              <span>🔑</span> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
