import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { QuestionnaireStepper } from "./components/QuestionnaireStepper";
import { AnalyzingOverlay } from "./components/AnalyzingOverlay";
import { RecommendationResults } from "./components/RecommendationResults";
import { Casebook } from "./components/Casebook";
import { GiftCatalog } from "./components/GiftCatalog";
import { AuthModal } from "./components/AuthModal";

import {
  apiGetMe,
  apiAnalyzeQuiz,
  getSavedGiftsLocal,
  saveGiftLocal,
  removeSavedGiftLocal,
  updateSavedGiftStatusLocal,
  removeToken,
} from "./services/api";
import type { User, SavedGiftItem } from "./services/api";

import type {
  RecipientProfile,
  OccasionDetails,
  BudgetCriteria,
  ScoredRecommendation,
} from "./services/giftDetectiveClient";

import type { GiftItem } from "./data/seedGifts";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<"quiz" | "results" | "casebook" | "catalog">("quiz");
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [savedGifts, setSavedGifts] = useState<SavedGiftItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Investigation state
  const [recipient, setRecipient] = useState<RecipientProfile>({
    name: "Ananya",
    relationship: "Sister",
    age: 21,
    interests: ["painting", "music"],
    personalityTraits: ["creative"],
    favoriteColors: ["purple"],
    likes: ["cute items", "personalized gifts"],
    dislikes: ["generic gifts"],
  });

  const [occasion, setOccasion] = useState<OccasionDetails>({
    type: "Birthday",
    title: "21st Milestone Birthday",
  });

  const [budget, setBudget] = useState<BudgetCriteria>({
    min: 1000,
    max: 2000,
  });

  const [recommendations, setRecommendations] = useState<ScoredRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load initial data
  useEffect(() => {
    // Check saved token / current user
    apiGetMe().then((u) => {
      if (u) setUser(u);
    });

    // Load local saved casebook
    setSavedGifts(getSavedGiftsLocal());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Run Investigation
  const handleAnalyze = async (
    recProfile: RecipientProfile,
    occDetails: OccasionDetails,
    budgCriteria: BudgetCriteria
  ) => {
    setRecipient(recProfile);
    setOccasion(occDetails);
    setBudget(budgCriteria);
    setIsAnalyzing(true);

    try {
      // Simulate radar scan interval for dramatic detective effect
      const [result] = await Promise.all([
        apiAnalyzeQuiz(recProfile, occDetails, budgCriteria),
        new Promise((resolve) => setTimeout(resolve, 1400)),
      ]);

      setRecommendations(result.recommendations);
      setActiveTab("results");
      showToast(`🕵️‍♂️ Found ${result.recommendations.length} solved gift leads!`);
    } catch {
      showToast("Error processing investigation");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preset quick runner
  const handleApplyPreset = (presetKey: string) => {
    if (presetKey === "sister_painting") {
      const p: RecipientProfile = {
        name: "Ananya",
        relationship: "Sister",
        age: 21,
        interests: ["painting", "diy"],
        personalityTraits: ["creative"],
        favoriteColors: ["purple"],
        likes: ["cute items", "personalized gifts"],
        dislikes: ["generic gifts"],
      };
      const o: OccasionDetails = { type: "Birthday", title: "21st Birthday" };
      const b: BudgetCriteria = { min: 1000, max: 2000 };
      handleAnalyze(p, o, b);
    } else if (presetKey === "partner_tech") {
      const p: RecipientProfile = {
        name: "Rohan",
        relationship: "Partner",
        age: 27,
        interests: ["tech", "coffee", "music"],
        personalityTraits: ["tech-savvy", "minimalist"],
        favoriteColors: ["black"],
        likes: ["practical daily use"],
        dislikes: ["clutter"],
      };
      const o: OccasionDetails = { type: "Anniversary", title: "3rd Anniversary" };
      const b: BudgetCriteria = { min: 2000, max: 4000 };
      handleAnalyze(p, o, b);
    } else if (presetKey === "friend_gaming") {
      const p: RecipientProfile = {
        name: "Vikram",
        relationship: "Best Friend",
        age: 24,
        interests: ["gaming", "desk", "tech"],
        personalityTraits: ["tech-savvy"],
        favoriteColors: ["blue"],
        likes: ["aesthetic desk decor"],
        dislikes: ["clothes"],
      };
      const o: OccasionDetails = { type: "Birthday", title: "Birthday Bash" };
      const b: BudgetCriteria = { min: 1000, max: 3000 };
      handleAnalyze(p, o, b);
    } else if (presetKey === "mom_wellness") {
      const p: RecipientProfile = {
        name: "Mom",
        relationship: "Mother",
        age: 52,
        interests: ["tea", "plants", "wellness"],
        personalityTraits: ["calm", "thoughtful"],
        favoriteColors: ["green"],
        likes: ["practical daily use", "organic"],
        dislikes: ["sugar"],
      };
      const o: OccasionDetails = { type: "Mother's Day", title: "Special Appreciation" };
      const b: BudgetCriteria = { min: 1000, max: 2500 };
      handleAnalyze(p, o, b);
    }
  };

  // Inspect from catalog
  const handleQuickInspect = (gift: GiftItem) => {
    const p: RecipientProfile = {
      name: "Special Someone",
      relationship: "Friend",
      interests: gift.tags.slice(0, 2),
      personalityTraits: [gift.vibe],
      likes: ["practical daily use"],
    };
    const o: OccasionDetails = { type: "Just Because" };
    const b: BudgetCriteria = {
      min: Math.max(0, gift.estimatedPrice - 500),
      max: gift.estimatedPrice + 1000,
    };
    handleAnalyze(p, o, b);
  };

  // Save Gift handler
  const handleSaveGift = (recommendation: ScoredRecommendation) => {
    const item: SavedGiftItem = {
      id: `saved-${recommendation.gift.id}-${Date.now()}`,
      giftIdea: {
        id: recommendation.gift.id,
        title: recommendation.gift.title,
        description: recommendation.gift.description,
        estimatedPrice: recommendation.gift.estimatedPrice,
        currency: recommendation.gift.currency,
        category: recommendation.gift.category,
        imageUrl: recommendation.gift.imageUrl,
        vibe: recommendation.gift.vibe,
      },
      recipientName: `${recipient.relationship} ${recipient.name ? `(${recipient.name})` : ""}`,
      status: "CONSIDERING",
      savedAt: new Date().toISOString(),
    };

    const updated = saveGiftLocal(item);
    setSavedGifts(updated);
    showToast(`🔖 Saved "${recommendation.gift.title}" to Casebook!`);
  };

  // Update Status handler
  const handleUpdateStatus = (id: string, status: "CONSIDERING" | "PURCHASED" | "ARCHIVED") => {
    const updated = updateSavedGiftStatusLocal(id, status);
    setSavedGifts(updated);
    showToast(`Status updated to ${status}`);
  };

  // Remove handler
  const handleRemoveSavedGift = (id: string) => {
    const updated = removeSavedGiftLocal(id);
    setSavedGifts(updated);
    showToast("Removed from Casebook");
  };

  // Logout
  const handleLogout = () => {
    removeToken();
    setUser(null);
    showToast("Signed out successfully");
  };

  const savedGiftIds = savedGifts.map((s) => s.giftIdea.id);

  return (
    <div className="app-shell">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedGifts.length}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <main className="app-main">
        {isAnalyzing ? (
          <AnalyzingOverlay recipientName={recipient.name || "the recipient"} />
        ) : (
          <>
            {activeTab === "quiz" && (
              <div className="quiz-tab-view animate-fade-in">
                <Hero
                  onStartQuiz={() => {
                    const el = document.getElementById("investigation-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  onApplyPreset={handleApplyPreset}
                />

                <div id="investigation-section">
                  <QuestionnaireStepper
                    initialRecipient={recipient}
                    initialOccasion={occasion}
                    initialBudget={budget}
                    onAnalyze={handleAnalyze}
                  />
                </div>
              </div>
            )}

            {activeTab === "results" && (
              <RecommendationResults
                recommendations={recommendations}
                recipient={recipient}
                occasion={occasion}
                budget={budget}
                onSaveGift={handleSaveGift}
                savedGiftIds={savedGiftIds}
                onRefineClues={() => setActiveTab("quiz")}
              />
            )}

            {activeTab === "casebook" && (
              <Casebook
                savedGifts={savedGifts}
                onUpdateStatus={handleUpdateStatus}
                onRemove={handleRemoveSavedGift}
                onStartNewQuiz={() => setActiveTab("quiz")}
              />
            )}

            {activeTab === "catalog" && (
              <GiftCatalog onQuickInspect={handleQuickInspect} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer glass-panel">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🕵️‍♂️ Gift Detective</span>
            <p>Personalized Gift Investigation & Evidence-Based Matching Engine</p>
          </div>
          <div className="footer-meta">
            <span>Prices in Indian Rupees (₹ INR) • Curated with Clues</span>
            <span className="footer-copy">© 2026 Gift Detective. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          showToast(`Welcome, Agent ${u.name}!`);
        }}
      />
    </div>
  );
}

export default App;
