import { useState } from "react";
import type { RecipientProfile, OccasionDetails, BudgetCriteria } from "../services/giftDetectiveClient";
import type { RecipientRecord } from "../services/api";

interface StepperProps {
  initialRecipient: RecipientProfile;
  initialOccasion: OccasionDetails;
  initialBudget: BudgetCriteria;
  savedRecipients?: RecipientRecord[];
  onAnalyze: (recipient: RecipientProfile, occasion: OccasionDetails, budget: BudgetCriteria) => void;
}

export const QuestionnaireStepper: React.FC<StepperProps> = ({
  initialRecipient,
  initialOccasion,
  initialBudget,
  savedRecipients,
  onAnalyze,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [name, setName] = useState(initialRecipient.name || "");
  const [relationship, setRelationship] = useState(initialRecipient.relationship || "Sister");
  const [age, setAge] = useState<string>(initialRecipient.age ? String(initialRecipient.age) : "");
  const [gender, setGender] = useState(initialRecipient.gender || "");

  const [occasionType, setOccasionType] = useState(initialOccasion.type || "Birthday");
  const [occasionTitle, setOccasionTitle] = useState(initialOccasion.title || "");

  const [interests, setInterests] = useState<string[]>(initialRecipient.interests || []);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(initialRecipient.personalityTraits || []);
  const [customInterest, setCustomInterest] = useState("");

  const [favoriteColors, setFavoriteColors] = useState<string[]>(initialRecipient.favoriteColors || []);
  const [likes, setLikes] = useState<string[]>(initialRecipient.likes || []);
  const [dislikes, setDislikes] = useState<string>(
    Array.isArray(initialRecipient.dislikes) ? initialRecipient.dislikes.join(", ") : initialRecipient.dislikes || ""
  );

  const [budgetMin, setBudgetMin] = useState<string>(initialBudget.min ? String(initialBudget.min) : "1000");
  const [budgetMax, setBudgetMax] = useState<string>(initialBudget.max ? String(initialBudget.max) : "2500");

  // Options
  const relationships = [
    "Sister", "Brother", "Partner", "Mother", "Father", "Best Friend", "Colleague", "Child", "Other"
  ];

  const occasions = [
    { type: "Birthday", icon: "🎂" },
    { type: "Anniversary", icon: "💍" },
    { type: "Housewarming", icon: "🏡" },
    { type: "Graduation", icon: "🎓" },
    { type: "Valentine's Day", icon: "💝" },
    { type: "Holiday / Festive", icon: "✨" },
    { type: "Just Because", icon: "🎁" },
  ];

  const interestOptions = [
    { label: "Painting & Art", value: "painting" },
    { label: "Specialty Coffee", value: "coffee" },
    { label: "Gaming & PC", value: "gaming" },
    { label: "Reading & Books", value: "books" },
    { label: "Tech & Gadgets", value: "tech" },
    { label: "Cooking & Baking", value: "cooking" },
    { label: "Skincare & Spa", value: "wellness" },
    { label: "Yoga & Fitness", value: "fitness" },
    { label: "Travel & Trips", value: "travel" },
    { label: "Home Decor", value: "decor" },
    { label: "Candles & Scents", value: "candle" },
    { label: "Music & Audio", value: "music" },
    { label: "Crafting & DIY", value: "diy" },
    { label: "Fashion & Jewelry", value: "jewelry" },
  ];

  const personalityOptions = [
    { label: "Creative & Artistic", value: "creative" },
    { label: "Cozy & Introverted", value: "introvert" },
    { label: "Adventurous & Active", value: "adventurous" },
    { label: "Minimalist & Functional", value: "minimalist" },
    { label: "Tech-Savvy & Curious", value: "tech-savvy" },
    { label: "Foodie & Gourmet", value: "foodie" },
    { label: "Calm & Mindful", value: "calm" },
    { label: "Sentimental & Romantic", value: "sentimental" },
  ];

  const colorOptions = [
    { label: "Purple", value: "purple", color: "#a855f7" },
    { label: "Emerald", value: "green", color: "#10b981" },
    { label: "Rose Pink", value: "pink", color: "#f43f5e" },
    { label: "Midnight Blue", value: "blue", color: "#38bdf8" },
    { label: "Classic Black", value: "black", color: "#1e293b" },
    { label: "Gold", value: "gold", color: "#fbbf24" },
  ];

  const likeOptions = [
    "cute items", "personalized gifts", "practical daily use", "aesthetic desk decor", "gourmet snacks"
  ];

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomInterest = () => {
    const trimmed = customInterest.trim().toLowerCase();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCustomInterest("");
    }
  };

  const handlePresetBudget = (min: number, max: number) => {
    setBudgetMin(String(min));
    setBudgetMax(String(max));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipient: RecipientProfile = {
      name: name.trim() || undefined,
      relationship,
      age: age ? parseInt(age, 10) : undefined,
      gender: gender || undefined,
      interests,
      personalityTraits,
      favoriteColors,
      likes,
      dislikes: dislikes ? dislikes.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : [],
    };

    const occasion: OccasionDetails = {
      type: occasionType,
      title: occasionTitle.trim() || undefined,
    };

    const budget: BudgetCriteria = {
      min: budgetMin ? parseFloat(budgetMin) : undefined,
      max: budgetMax ? parseFloat(budgetMax) : undefined,
    };

    onAnalyze(recipient, occasion, budget);
  };

  return (
    <div className="stepper-card glass-panel">
      {/* Stepper Progress Bar */}
      <div className="stepper-header">
        <div className="stepper-title-row">
          <span className="case-file-badge">CASE FILE #2026</span>
          <span className="step-counter">Step {step} of 5</span>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        <div className="steps-indicators">
          {["The Subject", "Occasion", "Passions", "Preferences", "Budget"].map((label, idx) => (
            <button
              key={label}
              type="button"
              className={`step-dot ${step === idx + 1 ? "active" : ""} ${step > idx + 1 ? "completed" : ""}`}
              onClick={() => setStep(idx + 1)}
            >
              <span className="dot-number">{idx + 1}</span>
              <span className="dot-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stepper-form-content">
        {/* STEP 1: The Subject */}
        {step === 1 && (
          <div className="step-panel animate-fade-in">
            <h2 className="step-title">👤 Who is the recipient?</h2>
            <p className="step-desc">
              Every investigation starts with identifying the subject.
            </p>

            {savedRecipients && savedRecipients.length > 0 && (
              <div className="saved-recipients-selector glass-panel" style={{ padding: "12px 14px", marginBottom: "16px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 700, letterSpacing: "1px" }}>
                  📂 LOAD SAVED DOSSIER:
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                  {savedRecipients.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      className="filter-pill"
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => {
                        setName(rec.name);
                        setRelationship(rec.relationship);
                        if (rec.age) setAge(String(rec.age));
                        if (rec.gender) setGender(rec.gender);
                        if (rec.interests && rec.interests.length > 0) setInterests(rec.interests);
                        if (rec.personalityTraits && rec.personalityTraits.length > 0) setPersonalityTraits(rec.personalityTraits);
                        if (rec.favoriteColors && rec.favoriteColors.length > 0) setFavoriteColors(rec.favoriteColors);
                        if (rec.likes && rec.likes.length > 0) setLikes(rec.likes);
                        if (rec.dislikes) setDislikes(rec.dislikes);
                        if (rec.budgetMin) setBudgetMin(String(rec.budgetMin));
                        if (rec.budgetMax) setBudgetMax(String(rec.budgetMax));
                      }}
                    >
                      {rec.name} ({rec.relationship})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Recipient's Name (or Nickname)</label>
              <input
                type="text"
                placeholder="e.g. Ananya, Rahul, Mom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Relationship to You</label>
              <div className="chips-grid">
                {relationships.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    className={`chip-btn ${relationship === rel ? "selected" : ""}`}
                    onClick={() => setRelationship(rel)}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Age (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 21"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-field"
                  min="1"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label>Gender Preference (Optional)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-field"
                >
                  <option value="">Any / Not specified</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Occasion */}
        {step === 2 && (
          <div className="step-panel animate-fade-in">
            <h2 className="step-title">🎉 What is the occasion?</h2>
            <p className="step-desc">
              Gifts must suit the context of the milestone or celebration.
            </p>

            <div className="chips-grid occasion-grid">
              {occasions.map((occ) => (
                <button
                  key={occ.type}
                  type="button"
                  className={`chip-card ${occasionType === occ.type ? "selected" : ""}`}
                  onClick={() => setOccasionType(occ.type)}
                >
                  <span className="card-emoji">{occ.icon}</span>
                  <span className="card-label">{occ.type}</span>
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label>Special Note or Milestone (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 21st Birthday, 5th Work Anniversary, Housewarming party"
                value={occasionTitle}
                onChange={(e) => setOccasionTitle(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Passions & Personality */}
        {step === 3 && (
          <div className="step-panel animate-fade-in">
            <h2 className="step-title">🧩 What are their hobbies & passions?</h2>
            <p className="step-desc">
              Select key interests the detective can match against catalog clues.
            </p>

            <div className="form-group">
              <label>Hobbies & Favorite Activities (Select all that apply)</label>
              <div className="chips-grid">
                {interestOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`chip-btn ${interests.includes(opt.value) ? "selected" : ""}`}
                    onClick={() => toggleArrayItem(interests, setInterests, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom Interest Input */}
              <div className="custom-input-row">
                <input
                  type="text"
                  placeholder="Add custom hobby (e.g. pottery, anime, baking)..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomInterest();
                    }
                  }}
                  className="input-field small"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCustomInterest}
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "28px" }}>
              <label>Personality Vibe & Demeanor</label>
              <div className="chips-grid">
                {personalityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`chip-btn ${personalityTraits.includes(opt.value) ? "selected" : ""}`}
                    onClick={() => toggleArrayItem(personalityTraits, setPersonalityTraits, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preferences & Restrictions */}
        {step === 4 && (
          <div className="step-panel animate-fade-in">
            <h2 className="step-title">🎨 Colors, Likes & Dislikes</h2>
            <p className="step-desc">
              Detective safeguards: prioritize what they adore, actively avoid what they dislike.
            </p>

            {/* Favorite Colors */}
            <div className="form-group">
              <label>Favorite Colors</label>
              <div className="color-swatches-grid">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-swatch-btn ${favoriteColors.includes(c.value) ? "selected" : ""}`}
                    onClick={() => toggleArrayItem(favoriteColors, setFavoriteColors, c.value)}
                  >
                    <span
                      className="swatch-circle"
                      style={{ backgroundColor: c.color }}
                    ></span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* General Likes */}
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Specific Types of Gifts They Appreciate</label>
              <div className="chips-grid">
                {likeOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`chip-btn ${likes.includes(item) ? "selected" : ""}`}
                    onClick={() => toggleArrayItem(likes, setLikes, item)}
                  >
                    ✨ {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Dislikes */}
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>🚫 Things They Dislike or Avoid (Crucial Safeguard)</label>
              <input
                type="text"
                placeholder="e.g. generic gifts, coffee, scented candles, plastic clutter"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="input-field"
              />
              <span className="field-hint">
                The engine heavily penalizes any gifts matching these items.
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: Budget Parameters */}
        {step === 5 && (
          <div className="step-panel animate-fade-in">
            <h2 className="step-title">💰 Set Your Budget in ₹ (INR)</h2>
            <p className="step-desc">
              The detective strictly prioritizes items within your selected price corridor.
            </p>

            {/* Quick Presets */}
            <div className="preset-budget-row">
              <button
                type="button"
                className={`budget-preset-btn ${budgetMin === "0" && budgetMax === "1000" ? "active" : ""}`}
                onClick={() => handlePresetBudget(0, 1000)}
              >
                Under ₹1,000
              </button>
              <button
                type="button"
                className={`budget-preset-btn ${budgetMin === "1000" && budgetMax === "2500" ? "active" : ""}`}
                onClick={() => handlePresetBudget(1000, 2500)}
              >
                ₹1,000 – ₹2,500
              </button>
              <button
                type="button"
                className={`budget-preset-btn ${budgetMin === "2500" && budgetMax === "5000" ? "active" : ""}`}
                onClick={() => handlePresetBudget(2500, 5000)}
              >
                ₹2,500 – ₹5,000
              </button>
              <button
                type="button"
                className={`budget-preset-btn ${budgetMin === "5000" && budgetMax === "15000" ? "active" : ""}`}
                onClick={() => handlePresetBudget(5000, 15000)}
              >
                ₹5,000+ Luxury
              </button>
            </div>

            {/* Custom Min / Max Inputs */}
            <div className="form-row-2" style={{ marginTop: "24px" }}>
              <div className="form-group">
                <label>Minimum Budget (₹)</label>
                <div className="currency-input-wrap">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="input-field with-currency"
                    placeholder="500"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Maximum Budget (₹)</label>
                <div className="currency-input-wrap">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="input-field with-currency"
                    placeholder="3000"
                    min="100"
                    step="100"
                  />
                </div>
              </div>
            </div>

            {/* Investigation Summary Preview */}
            <div className="investigation-summary-box">
              <span className="summary-title">🔍 Ready for Deduction:</span>
              <p>
                Gifting your <strong>{relationship} {name ? `(${name})` : ""}</strong> for their{" "}
                <strong>{occasionType}</strong> with a budget of{" "}
                <strong>₹{parseInt(budgetMin || "0").toLocaleString("en-IN")} – ₹{parseInt(budgetMax || "0").toLocaleString("en-IN")}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="stepper-actions">
          {step > 1 && (
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep(step - 1)}
            >
              ← Back
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(step + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary-glow btn-detect-submit"
            >
              <span>🔎</span> Detect My Gift
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
