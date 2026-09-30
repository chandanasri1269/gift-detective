import { useState } from "react";
import { apiLogin, apiRegister } from "../services/api";
import type { User } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Name is required");
        const res = await apiRegister({ name, email, password });
        onSuccess(res.user);
      } else {
        const res = await apiLogin({ email, password });
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    const demoUser: User = {
      id: "agent-demo-007",
      name: "Special Agent",
      email: "agent@giftdetective.com",
    };
    onSuccess(demoUser);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal glass-panel animate-fade-in">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-header">
          <span className="auth-icon">🕵️‍♂️</span>
          <h2 className="auth-title">
            {isRegister ? "Enlist as Gift Detective" : "Agent Sign In"}
          </h2>
          <p className="auth-subtitle">
            {isRegister
              ? "Create your detective profile to sync casebooks and recipients."
              : "Sign in to access your saved cases and investigations."}
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Agent Name</label>
              <input
                type="text"
                placeholder="e.g. Inspector John"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="agent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Passcode</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-glow btn-auth-submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : isRegister ? "Create Detective Account" : "Access Case Files"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn-secondary btn-demo-auth"
          onClick={handleGuestDemo}
        >
          ⚡ Continue as Guest Agent (Instant Access)
        </button>

        <div className="auth-toggle-row">
          {isRegister ? (
            <span>
              Already an agent?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
              >
                Sign in here
              </button>
            </span>
          ) : (
            <span>
              Need an agent account?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
              >
                Register here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
