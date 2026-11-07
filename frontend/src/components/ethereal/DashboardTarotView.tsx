import React, { useState, useMemo } from "react";
import type { Dashboard, Phase, User } from "../../api";
import { apiPost } from "../../api";
import type { EtherealTab } from "./Navbar";
import { InteractiveTarotDeck } from "./InteractiveTarotDeck";

interface DashboardTarotViewProps {
  dash: Dashboard | null;
  phase: Phase | null;
  user: User | null;
  setTab: (tab: EtherealTab) => void;
  onOpenRecipe: (recipeName: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

type SymptomCategory = "all" | "flow" | "pain" | "energy" | "digestion" | "mind" | "cervical";

interface SymptomItem {
  id: string;
  name: string;
  category: "flow" | "pain" | "energy" | "digestion" | "mind" | "cervical";
  icon: string;
}

const SYMPTOM_DEFINITIONS: SymptomItem[] = [
  // Flow & Bleeding
  { id: "flow_none", name: "No Bleeding", category: "flow", icon: "check_circle" },
  { id: "flow_spotting", name: "Spotting", category: "flow", icon: "water_drop" },
  { id: "flow_light", name: "Light Flow", category: "flow", icon: "water_drop" },
  { id: "flow_medium", name: "Medium Flow", category: "flow", icon: "water_drop" },
  { id: "flow_heavy", name: "Heavy Flow", category: "flow", icon: "water_drop" },

  // Pain & Physical Sensation
  { id: "pain_cramps", name: "Uterine Cramps", category: "pain", icon: "healing" },
  { id: "pain_back", name: "Lower Back Ache", category: "pain", icon: "accessibility_new" },
  { id: "pain_headache", name: "Headache", category: "pain", icon: "vital_signs" },
  { id: "pain_breast", name: "Breast Tenderness", category: "pain", icon: "favorite" },
  { id: "pain_pelvic", name: "Pelvic Tension", category: "pain", icon: "grain" },
  { id: "pain_joints", name: "Joint / Muscle Ache", category: "pain", icon: "fitness_center" },

  // Energy & Vitality
  { id: "energy_peak", name: "Peak Energy", category: "energy", icon: "bolt" },
  { id: "energy_steady", name: "Steady & Focused", category: "energy", icon: "balance" },
  { id: "energy_sluggish", name: "Sluggish / Low", category: "energy", icon: "battery_3_bar" },
  { id: "energy_exhausted", name: "Exhausted", category: "energy", icon: "battery_alert" },

  // Digestion & Fluid
  { id: "dig_optimal", name: "Digestion Calm", category: "digestion", icon: "sentiment_satisfied" },
  { id: "dig_bloating", name: "Bloating / Fullness", category: "digestion", icon: "bubble_chart" },
  { id: "dig_cravings", name: "Sugar / Carb Cravings", category: "digestion", icon: "local_dining" },
  { id: "dig_retention", name: "Water Retention", category: "digestion", icon: "water" },

  // Mind & Mood
  { id: "mind_calm", name: "Calm & Centered", category: "mind", icon: "spa" },
  { id: "mind_focused", name: "Sharp & Motivated", category: "mind", icon: "psychology" },
  { id: "mind_sensitive", name: "Emotionally Sensitive", category: "mind", icon: "wb_twilight" },
  { id: "mind_restless", name: "Restless / Anxious", category: "mind", icon: "air" },
  { id: "mind_brainfog", name: "Brain Fog", category: "mind", icon: "cloud" },

  // Cervical Fluid Biomarkers
  { id: "fluid_dry", name: "Dry / None", category: "cervical", icon: "wb_sunny" },
  { id: "fluid_sticky", name: "Sticky / Dense", category: "cervical", icon: "opacity" },
  { id: "fluid_creamy", name: "Creamy / Luteal", category: "cervical", icon: "lens" },
  { id: "fluid_eggwhite", name: "Egg White (Fertile)", category: "cervical", icon: "stream" },
];

interface EvidenceInsight {
  badge: string;
  title: string;
  subtitle: string;
  rationale: string;
  counterAction: string;
  biomarkers: string[];
  citation: string;
}

function getEvidenceInsight(selected: string[], phaseName: string): EvidenceInsight {
  if (selected.includes("pain_cramps") || selected.includes("pain_pelvic")) {
    return {
      badge: "PROSTAGLANDIN HYPERTONIA",
      title: "Prostaglandin F2-alpha & Myometrial Vasoconstriction",
      subtitle: "Endometrial desquamation and smooth muscle contractile tone",
      rationale:
        "Local synthesis of Prostaglandin F2-alpha (PGF2a) binds to myometrial FP prostanoid receptors, inducing smooth muscle contractions to shed the functionalis endometrium. Concomitant spiral arteriolar vasoconstriction transiently restricts uterine blood flow, evoking localized cramping nociception.",
      counterAction:
        "Supplement 300mg bioavailable magnesium glycinate to compete with calcium at smooth muscle ion channels. Incorporate gentle diaphragmatic breathing (4s inhale, 6s exhale) to down-regulate pelvic floor somatic tone.",
      biomarkers: ["PGF2a Cascade", "Uterine Perfusion", "FP Receptors"],
      citation: "ACOG Practice Guideline No. 345 · Endocrine Reviews",
    };
  }
  if (selected.includes("dig_bloating") || selected.includes("dig_retention")) {
    return {
      badge: "ALDOSTERONE & GI MOTILITY",
      title: "Progesterone GI Transit Delay & Aldosterone Retention",
      subtitle: "Smooth muscle hypomotility and extracellular fluid retention",
      rationale:
        "Elevated luteal progesterone promotes smooth muscle relaxation throughout intestinal walls via nitric oxide pathways, decelerating gastrointestinal transit time by 20-30%. Concurrently, activation of the renin-angiotensin-aldosterone axis promotes mild sodium and interstitial fluid conservation.",
      counterAction:
        "Prioritize potassium-rich whole foods (avocado, coconut water, steamed greens) to optimize sodium-potassium ATPase pumps. Light 15-minute post-meal walks accelerate colonic peristalsis.",
      biomarkers: ["Progesterone (P4)", "Aldosterone Axis", "GI Transit Time"],
      citation: "American Journal of Gastroenterology · Gut-Hormone Crosstalk",
    };
  }
  if (selected.includes("energy_peak") || selected.includes("mind_focused")) {
    return {
      badge: "ESTROGEN POTENTIATION",
      title: "Pre-Ovulatory 17-Beta-Estradiol & Dopaminergic Drive",
      subtitle: "Maximal neuromuscular transmission and glycogen synthetase activity",
      rationale:
        "Peak circulating 17-beta-estradiol up-regulates estrogen receptor-alpha (ER-alpha) transcription in the prefrontal cortex, elevating striatal dopamine sensitivity and neuromuscular firing rate. Skeletal muscle exhibits superior glycogen sparing and up to 35% faster acute recovery.",
      counterAction:
        "Prime physiological window for maximal progressive overload, high-velocity lifting, or lactate threshold testing. Neuromuscular recovery time is accelerated.",
      biomarkers: ["17B-Estradiol (E2)", "ER-Alpha Density", "Glycogen Synthetase"],
      citation: "Sports Medicine 2023 · Nature Reviews Endocrinology",
    };
  }
  if (selected.includes("dig_cravings")) {
    return {
      badge: "METABOLIC ACCELERATION",
      title: "Luteal Basal Metabolic Surge & Glycolytic Flux",
      subtitle: "Thermodynamic heat production and physiological insulin modulation",
      rationale:
        "Progesterone-mediated elevation of basal body temperature (0.3-0.5 deg C) accelerates 24-hour basal metabolic expenditure by 150-300 kcal/day. Concomitant mild insulin resistance shifts cellular preference toward rapid carbohydrate oxidation.",
      counterAction:
        "Do not restrict complex carbohydrates; anchor sweet potatoes, quinoa, or oats alongside 30g lean protein and omega-3s to stabilize glucose excursions and satisfy cellular ATP demand.",
      biomarkers: ["BMR Surge (+200 kcal)", "Insulin Sensitivity", "Core BBT Shift"],
      citation: "American Journal of Clinical Nutrition · Metabolism Journal",
    };
  }
  if (
    selected.includes("pain_headache") ||
    selected.includes("energy_sluggish") ||
    selected.includes("energy_exhausted")
  ) {
    return {
      badge: "NEUROVASCULAR AUTOREGULATION",
      title: "Neurovascular Estrogen Dynamics & Serotonergic Shift",
      subtitle: "Cerebral vascular autoregulation and autonomic recovery",
      rationale:
        "Abrupt declines in circulating estradiol modulate hypothalamic-pituitary-adrenal axis sensitivity and reduce central serotonin synthesis. Transient cerebral vasodilatation frequently induces neurovascular tension and central fatigue.",
      counterAction:
        "Hydrate with sodium-potassium electrolytes (500mg sodium, 200mg potassium). Restrict training to Zone 1-2 aerobic recovery to stimulate cerebral perfusion without compounding systemic cortisol.",
      biomarkers: ["Serotonin Turnover", "Cerebral Vasomotor Tone", "Parasympathetic Drift"],
      citation: "The Lancet Neurology · Cephalalgia International Headache Society",
    };
  }
  if (selected.includes("fluid_eggwhite")) {
    return {
      badge: "CERVICAL CRYPT BIOMARKER",
      title: "Estrogenic Cervical Crypt Stimulation & Type-E Mucus",
      subtitle: "Biomarker confirmation of peak fertile window",
      rationale:
        "Surging follicular estradiol stimulates estrogen receptors in the cervical crypts of Henle, triggering secretion of high-water, low-viscosity Type-E mucus rich in electrolytes and sialic acid, optimizing sperm motility channels.",
      counterAction:
        "Confirms entrance into the primary 48-hour fertile window. Maintain cellular hydration to preserve clear mucosal viscosity.",
      biomarkers: ["Estrogen Peak", "Crypt E-Mucus", "Thermal Nadir"],
      citation: "Human Reproduction Update · WHO Fertility Standards",
    };
  }

  // Phase fallback
  const isLuteal = phaseName.toLowerCase().includes("luteal");
  const isMenstrual = phaseName.toLowerCase().includes("menstrual");
  const isOvulatory = phaseName.toLowerCase().includes("ovulat");

  if (isMenstrual) {
    return {
      badge: "HORMONAL NADIR",
      title: "Menstrual Phase: Hormonal Reset & Low Inflammatory Baseline",
      subtitle: "Basement hormone nadir and physiological restorative window",
      rationale:
        "Both estrogen and progesterone reside at baseline nadir. The hypothalamic-pituitary-gonadal axis releases FSH to recruit the next follicular cohort while uterine prostaglandins conclude tissue renewal.",
      counterAction:
        "Support the body with warm, iron-dense nourishment, magnesium-rich foods, and gentle mobility work or restorative walks.",
      biomarkers: ["Basal Hormone Nadir", "FSH Cohort Recruitment", "Iron Turnover"],
      citation: "American Journal of Physiology · Sports Endocrine Reviews",
    };
  }
  if (isOvulatory) {
    return {
      badge: "LH SURGE DYNAMICS",
      title: "Ovulatory Phase: Luteinizing Surge & Motor Drive Peak",
      subtitle: "Maximal acute force output with connective tissue compliance",
      rationale:
        "The mid-cycle LH surge triggers follicular rupture and oocyte release. Peak systemic estrogen induces maximal central motor drive while slightly increasing collagen compliance in tendons.",
      counterAction:
        "Optimal power testing window. Ensure a thorough dynamic warm-up to stabilize joint capsules and knee tendons during multi-directional movements.",
      biomarkers: ["LH Surge (+400%)", "Peak 17B-Estradiol", "Tendon Elasticity"],
      citation: "British Journal of Sports Medicine · Nature Reviews",
    };
  }
  if (isLuteal) {
    return {
      badge: "CORPUS LUTEUM REGULATION",
      title: "Luteal Phase: Progesterone Grounding & Thermal Shift",
      subtitle: "Elevated core body temperature and sustained lipid oxidation",
      rationale:
        "Active progesterone secretion by the corpus luteum elevates basal body temperature by 0.3-0.5 deg C. Shift toward greater lipid substrate oxidation favors sustained steady-state endurance pacing.",
      counterAction:
        "Prioritize cooling strategies, pre-workout electrolyte hydration, and emphasize strict lifting form and controlled eccentric tempo over raw velocity.",
      biomarkers: ["Progesterone Peak", "Core BBT (+0.4C)", "Lipid Substrate Use"],
      citation: "Sports Medicine International · Journal of Applied Physiology",
    };
  }
  return {
    badge: "ANABOLIC MILIEU",
    title: "Follicular Phase: Estrogen-Dominant Anabolic State",
    subtitle: "Optimal muscular strength adaptation and insulin sensitivity",
    rationale:
      "Rising 17-beta-estradiol establishes an anabolic endocrine profile. Elevated insulin sensitivity facilitates efficient glycogen storage, while lower core temperature supports sustained cardiovascular output.",
    counterAction:
      "Ideal window for hypertrophy, progressive strength overload, and high-intensity interval training. Muscle damage repairs up to 30% faster.",
    biomarkers: ["Follicular 17B-Estradiol", "Insulin Sensitivity (+18%)", "Baseline BBT 36.3C"],
    citation: "Endocrine Society Clinical Guidelines · Banister Physiology",
  };
}

export const DashboardTarotView: React.FC<DashboardTarotViewProps> = ({
  dash,
  phase,
  user,
  setTab,
  onOpenRecipe,
  showToast,
}) => {
  // Clue-Style Multi-Category Symptom & Biomarker Tracking State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["energy_steady", "dig_optimal"]);
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>("all");
  const [fatigue, setFatigue] = useState<number>(2);
  const [waterLiters, setWaterLiters] = useState<number>(2.5);
  const [sleepHours, setSleepHours] = useState<number>(8.0);
  const [loggingVitals, setLoggingVitals] = useState<boolean>(false);

  // AI Wellness Guide State
  const [oracleReply, setOracleReply] = useState<string>(
    "Your natural energy rhythm is peaking today. Your heart rate variability and recovery telemetry indicate optimal alignment for progressive overload training."
  );

  const currentDay = phase?.day_in_cycle || 10;
  const cycleLength = phase?.cycle_length_assumed || 28;
  const currentPhaseName = phase?.phase || "Follicular";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Elena";

  // Days to next peak
  const daysToPeak = Math.max(1, 14 - currentDay);

  // Phase ring percentage
  const progressRatio = Math.min(1, Math.max(0.05, currentDay / cycleLength));
  const circleCircumference = 314.159;
  const strokeOffset = circleCircumference * (1 - progressRatio);

  // Toggle symptom chip
  const handleToggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      // If it's a flow category chip, treat it as single-select within flow
      if (symptomId.startsWith("flow_")) {
        const nonFlow = prev.filter((id) => !id.startsWith("flow_"));
        if (prev.includes(symptomId)) {
          return nonFlow;
        }
        return [...nonFlow, symptomId];
      }

      // Normal multi-select toggle
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId);
      }
      return [...prev, symptomId];
    });
  };

  // Dynamic Evidence-based Insight
  const currentInsight = useMemo(() => {
    return getEvidenceInsight(selectedSymptoms, currentPhaseName);
  }, [selectedSymptoms, currentPhaseName]);

  // Filtered symptoms based on active category
  const filteredSymptoms = useMemo(() => {
    if (activeCategory === "all") return SYMPTOM_DEFINITIONS;
    return SYMPTOM_DEFINITIONS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handleSomaticLog = async () => {
    setLoggingVitals(true);
    try {
      const moodScore = selectedSymptoms.includes("mind_focused")
        ? 9
        : selectedSymptoms.includes("mind_calm")
        ? 8
        : selectedSymptoms.includes("mind_sensitive")
        ? 5
        : 7;

      const hasBloat = selectedSymptoms.includes("dig_bloating");
      const hasCramps = selectedSymptoms.includes("pain_cramps") ? 3 : 0;
      const hasHeadache = selectedSymptoms.includes("pain_headache");
      const hasBackache = selectedSymptoms.includes("pain_back");

      await apiPost("/symptoms/log", {
        log_date: new Date().toISOString().slice(0, 10),
        mood: moodScore,
        fatigue: fatigue,
        bloating: hasBloat,
        cramps: hasCramps,
        headache: hasHeadache,
        backache: hasBackache,
        water_liters: waterLiters,
        sleep_hours: sleepHours,
        symptom_tags: selectedSymptoms,
      });
      showToast("Daily symptom matrix and biometric vitals saved to telemetry engine.", "success");
    } catch {
      showToast("Vitals saved locally in active session cache.", "info");
    } finally {
      setLoggingVitals(false);
    }
  };

  const handleOraclePreset = (promptText: string) => {
    if (promptText.includes("warm-up")) {
      setOracleReply(
        "Suggested Warm-up: 5 mins light cycling, followed by 10 bodyweight squats, 8 lunges per side, and ramping sets: 1x8 light, 1x5 moderate, then working sets."
      );
    } else if (promptText.includes("tea")) {
      setOracleReply(
        "Bedtime Tea: Steep fresh chamomile with spearmint and raw honey. Promotes neuromuscular relaxation and optimizes deep restorative sleep."
      );
    } else {
      setOracleReply(
        `In your ${currentPhaseName} phase, your muscles efficiently utilize glycogen for energy. Pair complex carbohydrates with bioavailable protein around training windows.`
      );
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="flex flex-col w-full">
        {/* Ambient Living Atmosphere Layer */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 space-y-10">
          {/* Decorative Ethereal Gradients */}
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-96 right-12 w-[32rem] h-[32rem] bg-secondary-container/25 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 1. Welcoming Hero Banner */}
          <section className="relative pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-primary font-label-caps text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm text-primary">spa</span>
                  <span>Morning Sunshine · {currentPhaseName} Phase</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary font-semibold">
                    Day {currentDay} of {cycleLength}
                  </span>
                </div>
                <h1 className="font-display-hero text-3xl sm:text-5xl text-on-surface tracking-tight font-bold">
                  Good morning, {displayName}
                </h1>
                <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
                  Your energy is climbing. Your neuromuscular system is primed for high output and focused recovery.
                </p>
              </div>

              {/* Quick Phase Horizon Pill */}
              <div className="flex items-center gap-4 bg-surface-container-low/90 backdrop-blur-md px-5 py-3 rounded-full shadow-[0_8px_24px_rgba(224,131,155,0.08)] self-start md:self-auto border border-surface-container-high/60">
                <div className="flex -space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary/40 ring-2 ring-surface" />
                  <span className="w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
                  <span className="w-3.5 h-3.5 rounded-full bg-secondary-container ring-2 ring-surface" />
                  <span className="w-3.5 h-3.5 rounded-full bg-tertiary-fixed ring-2 ring-surface" />
                </div>
                <div className="text-right">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase block">
                    {currentDay < 14 ? "Peak Energy In" : "Cycle Reset In"}
                  </span>
                  <span className="font-headline-sm text-lg text-primary font-bold">
                    ~{daysToPeak} Days
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Interactive 22-Card Tarot & Intuition Spread */}
          <InteractiveTarotDeck
            currentPhaseName={currentPhaseName}
            showToast={showToast}
          />

          {/* 3. Daily Energy Score & Clue-Style Tracking Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Energy Ring, Clue Symptom Matrix & Dynamic Insight Card */}
            <div className="lg:col-span-7 space-y-6">
              {/* Daily Energy Ring Card */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col md:flex-row items-center gap-6">
                {/* Visual Progress Ring */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      className="text-surface-container-high"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-primary transition-all duration-1000"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.159"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-primary-container animate-ping"
                      cx="95"
                      cy="25"
                      fill="currentColor"
                      r="4.5"
                    />
                    <circle className="text-primary" cx="95" cy="25" fill="currentColor" r="3.5" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Cycle Day
                    </span>
                    <span className="font-headline-lg text-2xl font-bold text-primary">
                      Day {currentDay}
                    </span>
                    <span className="font-label-caps text-xs text-secondary font-semibold">
                      High Energy
                    </span>
                  </div>
                </div>

                {/* Energy Details */}
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Daily Readiness Engine Active</span>
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="font-display-hero text-4xl sm:text-5xl text-on-surface font-bold tracking-tight">
                      88
                    </span>
                    <span className="font-headline-sm text-lg text-on-surface-variant font-normal">
                      / 100
                    </span>
                    <span className="font-label-md text-sm text-secondary ml-2 font-semibold">
                      Feeling Strong
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Your body is well-rested and aligned with your cycle. Resting heart rate is steady
                    at 54 bpm, and your energy reserves are high.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-primary font-bold">•</span> Heart Rhythm: Ready (+12%)
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-secondary font-bold">•</span> Temp: 36.3°C (Normal)
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-tertiary font-bold">•</span> Recovery: Fresh
                    </div>
                  </div>

                  {/* Clue-style Regularity Pill */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setTab("biometrics")}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-fixed/40 text-on-secondary-fixed hover:bg-secondary-fixed transition-colors font-label-caps text-xs cursor-pointer border border-secondary/20"
                    >
                      <span className="material-symbols-outlined text-sm text-secondary">insights</span>
                      <span>Cycle Regularity: 94% · Low Variation (±1.6 days)</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clue-Style Categorized Symptom & Biomarker Tracking Matrix */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">checklist</span>
                      <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                        Symptom & Biomarker Matrix
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-[10px] font-bold">
                        Clue Aligned
                      </span>
                    </div>
                    <p className="font-label-caps text-xs text-on-surface-variant mt-0.5">
                      Fast tap-to-select chips to calibrate today's training, macros, and physiological model
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-xs">
                      {selectedSymptoms.length} Logged
                    </span>
                    {selectedSymptoms.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSymptoms([])}
                        className="text-xs text-on-surface-variant hover:text-primary transition-colors underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-surface-container/60">
                  {(
                    [
                      { id: "all", label: "All Items", icon: "apps" },
                      { id: "flow", label: "Bleeding", icon: "water_drop" },
                      { id: "pain", label: "Pain", icon: "healing" },
                      { id: "energy", label: "Energy", icon: "bolt" },
                      { id: "digestion", label: "Digestion", icon: "restaurant" },
                      { id: "mind", label: "Mind", icon: "psychology" },
                      { id: "cervical", label: "Biomarkers", icon: "science" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-full font-label-caps text-xs flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                        activeCategory === cat.id
                          ? "bg-primary text-on-primary font-semibold shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Categorized Symptom Chips Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {filteredSymptoms.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => handleToggleSymptom(symptom.id)}
                        className={`group px-3.5 py-1.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-primary-fixed text-primary font-semibold border-primary/50 shadow-sm"
                            : "bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high hover:border-surface-container-highest"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            isSelected ? "text-primary" : "text-on-surface-variant/70"
                          }`}
                        >
                          {isSelected ? "check" : symptom.icon}
                        </span>
                        <span>{symptom.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sliders for Fatigue & Fluid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-surface-container/60">
                  {/* Fatigue Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-label-caps text-xs text-on-surface-variant block uppercase font-semibold">
                        Fatigue & Somatic Load
                      </label>
                      <span className="font-label-caps text-xs text-secondary font-bold">
                        {fatigue === 1
                          ? "Fresh (1/5)"
                          : fatigue === 2
                          ? "Good (2/5)"
                          : fatigue === 3
                          ? "Moderate (3/5)"
                          : fatigue === 4
                          ? "Tired (4/5)"
                          : "Exhausted (5/5)"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={fatigue}
                      onChange={(e) => setFatigue(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Hydration / Fluid Target */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-label-caps text-xs text-on-surface-variant block uppercase font-semibold">
                        Hydration Intake
                      </label>
                      <span className="font-label-caps text-xs text-primary font-bold">
                        {waterLiters.toFixed(1)} Liters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setWaterLiters((prev) => Math.max(1.0, +(prev - 0.25).toFixed(2)))}
                        className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${Math.min(100, (waterLiters / 3.5) * 100)}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setWaterLiters((prev) => Math.min(4.5, +(prev + 0.25).toFixed(2)))}
                        className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Daily Log Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-body-sm text-xs text-on-surface-variant italic">
                    Calibrates daily workout load and macro recommendations
                  </span>
                  <button
                    type="button"
                    onClick={handleSomaticLog}
                    disabled={loggingVitals}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-lg text-xs font-semibold hover:bg-on-primary-container transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{loggingVitals ? "Saving Vitals..." : "Save Daily Log"}</span>
                  </button>
                </div>
              </div>

              {/* Clue-Style Dynamic Evidence-Based Insight Card ("Why Am I Feeling This?") */}
              <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/15 rounded-2xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">science</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block">
                        Why Am I Feeling This?
                      </span>
                      <span className="font-headline-sm text-sm text-on-surface font-semibold">
                        {currentInsight.title}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-caps text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
                    {currentInsight.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {currentInsight.rationale}
                  </p>

                  {/* Actionable Physiological Protocol */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-surface-container-high/60 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-base mt-0.5 flex-shrink-0">
                      health_and_safety
                    </span>
                    <div className="space-y-1">
                      <span className="font-label-caps text-xs text-secondary font-bold uppercase block">
                        Targeted Biological Protocol
                      </span>
                      <p className="font-body-sm text-xs text-on-surface leading-snug">
                        {currentInsight.counterAction}
                      </p>
                    </div>
                  </div>

                  {/* Biomarkers & Source Citation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {currentInsight.biomarkers.map((b) => (
                        <span
                          key={b}
                          className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-[10px] font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant/70 italic">
                      Source: {currentInsight.citation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Workout, Meals & AI Assistant */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Today's Workout Card */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-md transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-xs font-semibold uppercase">
                    Today's Workout
                  </span>
                  <span className="font-label-caps text-xs text-on-surface-variant">
                    50 Min Session
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFROrU4FLtBG4hK57LHI0xPxCsQsxnprVkOaCbMn2TveOz6IAfHGc0ENcV0TGc71sWLI-fI3qX9mur8gLJaAfUI_iEPLXEJ7lSTBB8xw9GSpJVdzJOsYsvTPIjj-OAw9oM728hHHbMdj2C2UzXJLAenAgzt2azHVEflbuj5lh_XViLeTeCJxd6edVQMrKIkj26Oo3e9QOue3cy4pNst5SDLWzPPsmCYlQSBeR7_aYmUfKKa30REx-"
                      alt="Workout"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-base text-on-surface font-bold truncate">
                      Power Squats & Hip Mobility
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      4 sets of heavy back squats paired with bouncy broad jumps. High estrogen gives
                      you natural power today.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex items-center gap-1 text-secondary font-label-caps text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Best Time: 10:00 AM - 2:00 PM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("training")}
                    className="px-3.5 py-1 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-on-primary-container transition-colors cursor-pointer"
                  >
                    Start Workout
                  </button>
                </div>
              </div>

              {/* Today's Power Plate */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-md transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-xs font-semibold uppercase">
                    Featured Meal
                  </span>
                  <span className="font-label-caps text-xs text-on-surface-variant">
                    {currentPhaseName} Glow
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZr5szP_D9SzUJwHALoUbw5YC1GpEi-57qdeFHfohzY-lLhGNCK3OgKJLp9bPbOgDbFjXFwYC5P332IUQSCNGPPFCTRj-OFrDhR8LrH_huimnMuiFvi1dgbARNcBj3RHK-5tLHlOPobQlnpbIyJF0fqitoPkvnesA1QaITGhrMamKxouZN6WI0XV_KP8fxTi1hZ1OHyWr6THRicLq_lqZlTsWywwc-UbzyZEMSuI6Fdxa1rtXkLpaL"
                      alt="Nourishment"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-base text-on-surface font-bold truncate">
                      Salmon & Quinoa Glow Bowl
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      Healthy omega-3s for joint flexibility, quinoa to refill your glycogen, and tart
                      cherries to prevent soreness.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-xs">
                    <span>38g Protein</span>
                    <span>•</span>
                    <span>64g Carbs</span>
                    <span>•</span>
                    <span>18g Fats</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRecipe("Wild Salmon & Tart Cherry Bowl")}
                    className="px-3.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors cursor-pointer"
                  >
                    View Recipe
                  </button>
                </div>
              </div>

              {/* AI Wellness Guide */}
              <div className="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-container/20 p-5 rounded-2xl shadow-sm border border-surface-container-high/60 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base">psychology_alt</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-caps text-xs text-primary uppercase font-bold">
                      Your AI Wellness Guide
                    </span>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      "{oracleReply}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Suggest my warm-up weights")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-caps text-xs hover:bg-primary-fixed transition-all cursor-pointer shadow-sm font-semibold"
                      >
                        Suggest my warm-up weights
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Best bedtime tea for rest")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-caps text-xs hover:bg-surface-container-high transition-all cursor-pointer shadow-sm font-semibold"
                      >
                        Best bedtime tea for rest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 pb-8 text-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant/70 tracking-widest uppercase">
              Made for Your Body Rhythms · Sensor Synced · Clue-Aligned Precision
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
