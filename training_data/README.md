# SELENE Training Datasets Directory

This dedicated folder contains all training and benchmark datasets used for training, evaluating, and validating the predictive models in the **SELENE** phase-intelligent athletic framework.

---

## Directory Organization

```
training_data/
├── README.md                                     # This data dictionary and usage guide
├── real/
│   └── real_human_cycles_fedcycle.csv            # Real empirical cycle dataset (1,665 cycles / 159 women)
├── synthetic/
│   ├── synthetic_biometric_strain_cohort_10k.csv # 10,000 physiological biometric instances for XGBoost Models
│   └── synthetic_longitudinal_cycles_4200.csv    # 4,200 multi-cycle longitudinal time-series for LSTM Model 1
└── intent/
    └── somatic_intent_queries_4000.csv           # 4,000 clinical somatic queries across 8 classes for Model 4
```

---

## 1. Real Empirical Dataset (`training_data/real/`)

### File: `real_human_cycles_fedcycle.csv`
- **Data Origin:** Anonymized real-world menstrual cycle dataset from client fertility and cycle tracking records (FedCycle / Marquette NFP cohort).
- **Scale:** **1,665 real longitudinal cycles from 159 distinct real women** (with 80 clinical parameters).
- **Key Parameters:**
  - `ClientID`: Unique participant identifier (e.g. `nfp8122`).
  - `CycleNumber`: Longitudinal cycle index per woman.
  - `LengthofCycle`: True observed cycle length (Mean: 29.21 +/- 3.62 days).
  - `EstimatedDayofOvulation`: Clinically verified ovulation marker (Mean: Day 15.98 +/- 3.54).
  - `LengthofLutealPhase`: True luteal duration (Mean: 13.24 +/- 2.52 days).
  - `LengthofMenses`: Bleeding duration (Mean: 5.25 +/- 1.28 days).
  - `MensesScoreDayOne` through `MensesScoreDayFive`: Daily flow intensity scores (1 to 5).
  - Anthropometrics: `Age`, `Height`, `Weight`, `BMI`.
- **Primary Use:** Simulation-to-Real (Sim2Real) validation benchmark and real human phase accuracy evaluation.

---

## 2. Synthetic Physiological Datasets (`training_data/synthetic/`)

### A. `synthetic_biometric_strain_cohort_10k.csv`
- **Scale:** **10,000 multi-parametric training instances**.
- **Target Variables:**
  - `target_strain_pct`: Daily athletic strain capacity (30% to 95% 1RM) based on Borg RPE and VO2max.
  - `target_recovery_hours`: Required neuromuscular recovery window (8 to 48 hours).
- **Features Monitored:** `phase`, `phenotype` (Elite, Intermediate, Recreational), `hrv_rmssd`, `resting_hr`, `spo2_pct`, `fatigue_score` (1-10), `mood_score` (1-10).
- **Primary Use:** Used to train Model 2 (`intensity_xgb.joblib`) and Model 3 (`recovery_model.joblib`).

### B. `synthetic_longitudinal_cycles_4200.csv`
- **Scale:** **4,200 longitudinal cycles across 322 distinct simulated athletic profiles**.
- **Physiological Basis:** Generated via bounded Ornstein-Uhlenbeck stochastic differential equations anchored to empirical parameters from Treloar et al. and Bull et al. (npj Digital Medicine 2019).
- **Signals Included:** Phase-coupled biphasic nocturnal skin temperature (+0.35C luteal shift), resting heart rate elevation (+5-10 bpm), and HRV rMSSD depression (-12 ms).
- **Primary Use:** Used for pre-training Model 1 (`lstm_phase.pth`) sequential time-series windows (W = 14 days).

---

## 3. Somatic Clinical Intent Dataset (`training_data/intent/`)

### File: `somatic_intent_queries_4000.csv`
- **Scale:** **4,000 queries uniformly distributed across 8 somatic clinical domains** (500 queries per class).
- **Domains Monitored:**
  1. `nutrition_fuel`: Pre/post-workout fueling, luteal carbohydrate loading, hydration.
  2. `training_load`: 1RM lift readiness, intensity % targets, cardio vs. strength scheduling.
  3. `recovery_soreness`: DOMS relief, rest window hours, active recovery protocols.
  4. `symptom_cramps`: Pelvic pain management, ginger/turmeric, pelvic floor postures.
  5. `sleep_insomnia`: Progesterone-induced sleep latency, bedroom temperature hygiene.
  6. `hormone_phase_inquiry`: Biological cycle status, estrogen/progesterone dynamics.
  7. `ovulation_fertility`: BBT thermal shift, ovulation detection, velocity peak.
  8. `injury_laxity_prevention`: Estrogen-mediated ACL joint laxity, neuromuscular warmups.
- **Split Breakdown:** 70% Train (2,800 queries), 10% Val (400 queries), 20% Test (800 queries).
- **Primary Use:** Used to train Model 4 (`oracle_intent_model.joblib`) TF-IDF classifier.

---

## Reproducing Model Training

To retrain and evaluate all models using the data in this directory:

```powershell
# In tracker/backend:
cd backend
.\.venv\Scripts\activate

# 1. Train Model 2 & Model 3 (XGBoost Strain & Recovery):
python scripts/train_models.py

# 2. Run Real-World Validation Benchmark against FedCycle Data:
python scripts/evaluate_real_cycle_data.py
```
