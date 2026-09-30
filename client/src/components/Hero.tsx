import React from "react";

interface HeroProps {
  onStartQuiz: () => void;
  onApplyPreset: (presetKey: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartQuiz, onApplyPreset }) => {
  return (
    <section className="hero-banner glass-panel">
      <div className="hero-badge">
        <span className="badge-dot"></span>
        EVIDENCE-BASED GIFT MATCHING ENGINE
      </div>

      <h1 className="hero-headline">
        Stop Guessing Gifts. <br />
        <span className="gold-text-gradient">Solve Them With Clues.</span>
      </h1>

      <p className="hero-subtext">
        Every great gift has a rationale. Our recommendation engine investigates your recipient's
        hobbies, personality traits, favorite colors, dislikes, and budget in ₹ (INR) to deliver
        recommendations with <strong>clear detective deductions</strong>.
      </p>

      {/* Primary Action */}
      <div className="hero-actions">
        <button
          type="button"
          className="btn-primary-glow"
          onClick={onStartQuiz}
        >
          <span>🔍</span> Launch Gift Investigation
        </button>
      </div>

      {/* Quick Case Study Presets */}
      <div className="hero-presets">
        <span className="presets-label">Or test a sample case file:</span>
        <div className="presets-list">
          <button
            type="button"
            className="preset-chip"
            onClick={() => onApplyPreset("sister_painting")}
          >
            🎨 Sister (21, Painting & Purple, ₹1k–2k)
          </button>
          <button
            type="button"
            className="preset-chip"
            onClick={() => onApplyPreset("partner_tech")}
          >
            🎧 Partner (Tech, Coffee & Focus, ₹2k–4k)
          </button>
          <button
            type="button"
            className="preset-chip"
            onClick={() => onApplyPreset("friend_gaming")}
          >
            🎮 Best Friend (Gaming & Desk Decor, ₹1k–3k)
          </button>
          <button
            type="button"
            className="preset-chip"
            onClick={() => onApplyPreset("mom_wellness")}
          >
            🌿 Mother (Wellness & Herbal Tea, ₹1k–2.5k)
          </button>
        </div>
      </div>
    </section>
  );
};
