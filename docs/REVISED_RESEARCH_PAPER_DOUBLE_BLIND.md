# A Personalized Menstrual Health Framework for Phase-Specific Optimization of Diet, Physical Training, and Recovery Using Time-Series Modeling and Wearable Physiological Signals

**Anonymous Authors**  
*Department and Institution Omitted for Double-Blind Review*  

---

### Abstract
Female athletic conditioning has historically been constrained by phase-agnostic training paradigms calibrated predominantly on male physiological baselines. Throughout the eumenorrheic menstrual cycle, endogenous fluctuations of steroid hormones—primarily $17\beta$-estradiol and progesterone—modulate basal metabolic rate, substrate oxidation kinetics, thermoregulation, and neuromuscular recovery latency. Concurrently, existing commercial reproductive health platforms persist granular biometric and menstrual logs on centralized cloud infrastructure without cryptographic privacy boundaries, introducing substantial data brokerage and legal discovery liabilities. 

This paper proposes an integrated, privacy-preserving digital health platform that couples multi-modal time-series machine learning with client-side zero-knowledge cryptography to optimize female athletic performance and phase-calibrated metabolic nutrition. The framework integrates: (1) a recurrent Long Short-Term Memory (LSTM) network that classifies four distinct cycle phases from continuous multivariate wearable telemetry (resting heart rate, heart rate variability, nocturnal skin temperature, and sleep actigraphy), (2) a regularized gradient-boosted regressor (XGBoost) modulating daily athletic strain capacity ($30\%\text{--}95\%$ 1RM), (3) a multi-target recovery kinetics regressor predicting post-exercise restoration latency ($8\text{--}48\text{ hours}$) and luteal thermogenic expenditure ($+180\text{ kcal/day}$), and (4) a sub-millisecond edge natural language intent engine operating across eight somatic domains. 

To guarantee absolute data sovereignty, qualitative symptom logs and private reflections are encrypted client-side using Authenticated Encryption with Associated Data (AES-GCM-256) with PBKDF2 key derivation ($100{,}000$ iterations). The database persistence layer possesses zero knowledge of master passphrases or unencrypted records, achieving semantic security under adaptive chosen-ciphertext attacks (IND-CCA2). The framework was evaluated on an empirical-synthetic unified cohort of $N = 4{,}200$ longitudinal menstrual cycles ($118{,}440$ daily observations from $322$ subjects), partitioned strictly by subject ID. Experimental results demonstrate $90.1\%$ phase classification accuracy (macro F1 = $0.90$), an RMSE of $4.8$ on athletic strain estimation, an $R^2$ of $0.862$ on recovery latency, sub-millisecond edge inference, negligible cryptographic overhead ($8.4\text{ ms}$ encryption latency), and an empirical database Shannon entropy of $7.989\text{ bits/byte}$, confirming the feasibility of mathematically private, hormone-synchronized sports conditioning.

**Index Terms—** female athletic performance, menstrual cycle phases, wearable biosensing, time-series forecasting, LSTM, XGBoost, zero-knowledge architecture, AES-GCM-256, relative energy deficiency in sport (RED-S), data privacy.

---

## I. INTRODUCTION

Modern sports physiology and athletic load-monitoring frameworks predominantly rely on linear impulse-response models (such as the Banister impulse-response model) that presuppose a homeostatic physiological baseline. While empirically robust for male athletes, these linear assumptions fail fundamentally when applied to eumenorrheic female athletes. Across a standard 28-to-32-day ovulatory cycle, systemic circulating concentrations of $17\beta$-estradiol ($E_2$) and progesterone ($P_4$) fluctuate by up to ten-fold, systematically altering autonomic tone, substrate oxidation, glycogenolysis, core body temperature, and neuromuscular recovery kinetics [1].

During the mid-follicular and ovulatory phases, elevated $17\beta$-estradiol enhances skeletal muscle insulin sensitivity, facilitates lipid oxidation, and promotes glycogen sparing during submaximal endurance exercise [2]. Consequently, this phase presents a primed biological window for maximal power output, progressive resistance overload, and high-intensity interval training (HIIT). Conversely, following ovulation, luteal-phase progesterone acts upon the preoptic thermoregulatory center of the hypothalamus, elevating basal body temperature by $0.3^\circ\text{C}$ to $0.5^\circ\text{C}$, elevating resting heart rate (RHR) by $5$ to $10\text{ bpm}$, suppressing vagally-mediated heart rate variability (HRV), and accelerating resting metabolic rate by $100$ to $300\text{ kcal/day}$ [3]. During menses, acute uterine blood and hemoglobin loss deplete elemental iron stores, increasing cardiovascular strain and reducing oxygen delivery capacity.

When athletic training volume and nutritional intake are not dynamically synchronized with these cyclical endocrinological shifts, female athletes experience an elevated incidence of Relative Energy Deficiency in Sport (RED-S) [8]. Prolonged luteal energy deficits induce low energy availability (LEA $< 30\text{ kcal/kg}$ fat-free mass/day), triggering functional hypothalamic amenorrhea, accelerated osteopenia/osteoporosis, and chronic autonomic central nervous system fatigue [8]. In competitive collegiate and elite environments, coaching staff frequently misinterpret luteal-phase autonomic suppression as lack of athletic discipline or deconditioning, paradoxically increasing training volume precisely when neuromuscular recovery is compromised.

Concurrently, commercial digital reproductive tracking applications (e.g., Flo, Clue, Premom) introduce critical privacy vulnerabilities. Commercial mHealth platforms routinely aggregate granular fertility, symptom, menstrual flow, and geolocation telemetry on centralized, unencrypted cloud servers, exposing users to commercial data brokerage, third-party analytics trackers, and law enforcement discovery subpoenas [10]. Following recent international legal shifts regarding reproductive health data, centralized storage of reproductive logs creates profound surveillance liabilities, discouraging athletes from digitally recording their cycles.

To address this dual deficit—the physiological neglect of female hormonal cycles and the cryptographic insecurity of reproductive mHealth platforms—this paper presents an open, privacy-preserving digital health platform. The framework makes the following primary contributions:
1. **Multi-Modal Time-Series Phase Estimation:** A recurrent deep learning architecture (LSTM) that continuously identifies menstrual phase boundaries from non-invasive wearable biometrics (RHR, HRV rMSSD, nocturnal skin temperature, sleep actigraphy), eliminating dependence on rigid calendar arithmetic.
2. **Hormonally-Calibrated Athletic Strain & Recovery Modeling:** A regularized gradient-boosted decision tree architecture (XGBoost) that dynamically prescribes daily athletic strain capacity ($30\%\text{--}95\%$ 1RM) and neuromuscular recovery windows ($8\text{--}48\text{ hours}$).
3. **Endocrinologically-Justified Nutritional Formulations:** An adaptive metabolic engine combining the Mifflin-St Jeor basal formulation with phase-specific adjustments: compensating for luteal thermogenesis ($+180\text{ kcal/day}$), providing phase-scaled protein allocations ($1.4\text{--}1.9\text{ g/kg}$), menstrual iron support ($18\text{ mg/day}$), and luteal dietary fiber ($32\text{ g/day}$) to support hepatic estrogen clearance.
4. **Host-Blind Zero-Knowledge Architecture:** A client-side cryptographic vault enforcing Authenticated Encryption with Associated Data (AES-GCM-256) and PBKDF2-HMAC-SHA256 key derivation within the browser sandbox, mathematically guaranteeing that database servers possess zero plaintext knowledge of sensitive reflections or logs.
5. **Rigorous Empirical and Synthetic Benchmarking:** A structured evaluation protocol distinguishing real-world empirical wearable data ($N_{\text{real}} = 1{,}850$ cycles) from synthetic physiological cohorts ($N_{\text{syn}} = 2{,}350$ cycles), demonstrating consistent model generalizability across held-out subjects.

---

## II. RELATED WORK

### A. Commercial Reproductive Health Platforms
First-generation cycle applications (e.g., Clue, Flo, Period Tracker) rely on static calendar subtraction derived from the Ogino-Knaus rhythm method [11]. These heuristics presuppose an unvarying 28-day cycle with ovulation occurring precisely on day 14. However, large-scale epidemiological studies demonstrate that fewer than $13\%$ of eumenorrheic women exhibit standard 28-day cycles, with normal biological cycle lengths ranging from 21 to 35 days and follicular phases exhibiting substantial intra-individual variance (standard deviation $\pm 4.2\text{ days}$) [18]. While advanced tools such as Natural Cycles incorporate waking basal body temperature (BBT) for retrospective contraceptive confirmation, existing platforms are phase-agnostic regarding athletic performance, providing static, non-personalized training and nutritional guidelines. Furthermore, commercial applications universally persist raw reproductive records on centralized cloud infrastructure, exposing athletes to data governance and surveillance vulnerabilities [10], [12].

### B. Wearable Athletic Conditioning & Strain Models
Consumer wearable devices (e.g., Whoop, Oura Ring, Garmin) compute cardiovascular strain scores ($0\text{--}21$) and recovery readiness scores using resting heart rate, sleep architecture, and time-domain HRV metrics [13]. However, their proprietary algorithms assume a male-calibrated homeostatic baseline. In eumenorrheic females, luteal-phase progesterone-induced tachycardia (an increase of $5\text{--}10\text{ bpm}$) and concomitant parasympathetic suppression (a $10\text{--}20\text{ ms}$ decline in HRV rMSSD) are routinely misclassified by commercial wearables as residual physiological fatigue, systemic illness, or poor cardiovascular fitness [1], [18]. Consequently, athletes are instructed to restrict physical effort during late follicular and ovulatory phases when muscle protein synthesis and neuromuscular capacity are biologically optimal [2], [9]. Over $74\%$ of surveyed elite female athletes report cyclical performance decrements, yet commercial wearables offer no hormone-adjusted strain calibration [9].

### C. Cryptographic Privacy in Digital Health Systems
End-to-end encryption protocols (such as the Signal Protocol [14]) have achieved widespread adoption in peer-to-peer messaging architectures, but remain virtually absent from commercial mHealth databases. While Fully Homomorphic Encryption (FHE) permits mathematical computation over encrypted ciphertexts without intermediate decryption [15], its prohibitive computational overhead ($>10^3\times$ latency and memory expansion) renders client-side execution in mobile web browsers technically infeasible. In contrast, Authenticated Encryption with Associated Data (AEAD) schemes—specifically AES-GCM-256—offer hardware-accelerated confidentiality, integrity, and authenticity directly within browser execution environments via the standardized W3C Web Crypto API (`window.crypto.subtle`). When coupled with salted key derivation functions (PBKDF2-HMAC-SHA256), client-side encryption enforces a verifiable cryptographic trust boundary that eliminates plaintext exposure at rest and in transit.

---

## III. PROBLEM FORMULATION & THREAT MODEL

### A. Mathematical Problem Formulation
Let an athlete's longitudinal physiological state at day $t$ be represented by a multi-modal telemetry observation vector:
$$\mathbf{x}_t = [r_t, h_t, \tau_t, s_t, f_t, m_t, \lambda_t, d_t]^T \in \mathbb{R}^8$$
where $r_t$ denotes nocturnal resting heart rate (bpm), $h_t$ denotes heart rate variability root mean square of successive differences ($\text{rMSSD}$, ms), $\tau_t$ denotes nocturnal skin temperature ($^\circ\text{C}$), $s_t$ denotes total sleep duration (hours), $f_t \in [1, 5]$ denotes self-reported somatic fatigue, $m_t \in [1, 5]$ denotes mood valence, $\lambda_t$ denotes historical mean cycle length (days), and $d_t$ denotes current elapsed cycle day.

The optimization objective comprises three coupled mappings:
1. **Phase Inference Mapping:** Predict discrete biological menstrual phase $y_{\text{phase}} \in \{\text{Menstrual}, \text{Follicular}, \text{Ovulatory}, \text{Luteal}\}$ from a historical temporal context window of length $W = 14$:
   $$\hat{\mathbf{p}}_t = \mathcal{F}_{\text{LSTM}}(\mathbf{X}_{t-W+1:t}) \in \Delta^3$$
2. **Strain & Recovery Mapping:** Determine target neuromuscular strain intensity $S_{\text{strain}} \in [30\%, 95\%]\text{ 1RM}$ and required post-exercise recovery window $\hat{y}_{\text{rec}} \in [8, 48]\text{ hours}$:
   $$\hat{S}_{\text{strain}}, \hat{y}_{\text{rec}} = \mathcal{G}_{\text{XGB}}(\hat{\mathbf{p}}_t, \mathbf{x}_t)$$
3. **Metabolic Energy Compensation:** Determine Total Daily Energy Expenditure ($\text{TDEE}$) incorporating thermogenic phase adjustments:
   $$\text{TDEE}_t = \text{BMR}(\text{Weight}, \text{Height}, \text{Age}) \times \text{PAL} + \Delta_{\text{phase}}(\hat{\mathbf{p}}_t)$$

### B. Cryptographic Threat Model
The system operates under the **Honest-but-Curious (Semi-Honest) Server Model** with potential for active persistence tier compromise. 
- **Adversary Capabilities:** The adversary may possess complete access to the database persistence layer (e.g., through compromised server credentials, physical storage theft, SQL injection, or legal discovery/subpoenas). The adversary can inspect all stored tables, schema structures, disk snapshots, and network transit packets between the client and application server.
- **Trusted Computing Base (TCB):** The TCB is strictly confined to the user's local browser runtime environment (client-side DOM sandbox and Web Worker memory space). Master passphrases, derived encryption keys, and plaintext reflections are strictly retained in volatile client memory and are never transmitted over network boundaries.
- **Security Goal (Semantic Security / Zero Knowledge of Plaintext):** For any two plaintext reflections $M_0, M_1$ chosen by an adversary, the adversary cannot distinguish between their corresponding ciphertexts $C_0, C_1$ with probability non-negligibly greater than $1/2$ (IND-CCA2 security). Formally, the server persistence layer possesses zero algorithmic knowledge of user qualitative reflections, symptom notes, or attached images.

---

## IV. SYSTEM ARCHITECTURE

```
+-----------------------------------------------------------------------------------+
|                        CLIENT TIER (React 18 / TypeScript / Vite)                 |
|                                                                                   |
|  +---------------------------+  Web Bluetooth API  +---------------------------+  |
|  |   Universal Smartwatches  |===================> |   Web Worker Crypto Vault |  |
|  | (Apple Watch, Garmin, Oura)|                     |  (AES-GCM-256 / PBKDF2)   |  |
|  +---------------------------+                     +---------------------------+  |
|  +---------------------------+                                    |               |
|  | ESP32 Biosensing Hardware |                                    |               |
|  | (MAX30205, MAX30102, OLED)|                                    | (C, IV, Salt) |
+-------------------------------------------------------------------|---------------+
                                    | (Biometric Telemetry Vector)  | Only Ciphertext
                                    v                               v
+-----------------------------------------------------------------------------------+
|                      APPLICATION TIER (FastAPI / Asynchronous Uvicorn)            |
|                                                                                   |
|   +--------------------------+  REST APIs   +----------------------------------+  |
|   |  JWT Session Controller  | <----------> |  Pydantic Request Validation     |  |
|   +--------------------------+              +----------------------------------+  |
+-----------------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                      INTELLIGENCE & PREDICTIVE TIER (Four Models)                 |
|                                                                                   |
|  +-----------------------------+          +------------------------------------+  |
|  | Model 1: PyTorch LSTM       |          | Model 2: Regularized XGBoost       |  |
|  | (Continuous Phase Boundary) |          | (Athletic Strain 30%-95% 1RM)      |  |
|  +-----------------------------+          +------------------------------------+  |
|                 |                                           |                     |
|                 v                                           v                     |
|  +-----------------------------+          +------------------------------------+  |
|  | Model 3: Multi-Target XGB   |          | Model 4: Sublinear TF-IDF + LLaMA  |  |
|  | (Recovery Latency & TDEE)   |          | (8-Domain Edge Somatic Intent)     |  |
|  +-----------------------------+          +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                      PERSISTENCE TIER (Encrypted SQLite / PostgreSQL)             |
|                                                                                   |
|     Table: journal_entries                                                        |
|     - entry_id: UUID (Primary Key)                                                |
|     - user_id: UUID (Foreign Key)                                                 |
|     - encrypted_payload: BLOB (Ciphertext only; zero plaintext bytes)             |
|     - iv: TEXT (Base64 random 96-bit nonce)                                       |
|     - salt: TEXT (Base64 random 128-bit PBKDF2 salt)                              |
|     - created_at: TIMESTAMP                                                       |
+-----------------------------------------------------------------------------------+
```

The system implements a four-tier architecture enforcing a cryptographic boundary at the client interface:
1. **Client Tier:** Implemented in React 18 with TypeScript and Vite. Biometric visualization, strain dial rendering, and zero-knowledge cryptographic operations execute in a dedicated background Web Worker thread, ensuring sub-16ms UI frame rates without blocking the main event loop.
2. **Application Tier:** Built with asynchronous FastAPI, Uvicorn ASGI, and Pydantic validation schemas. REST endpoints process inference pipelines with sub-50ms round-trip latency.
3. **Intelligence Tier:** Houses four synchronized predictive models:
   - *Model 1 (`lstm_phase.pth`):* 2-layer recurrent LSTM estimating phase boundaries.
   - *Model 2 (`intensity_xgb.joblib`):* Regularized gradient-boosted decision tree predicting athletic strain percentage.
   - *Model 3 (`recovery_model.joblib`):* Multi-target XGBoost regressor predicting post-exercise recovery latency ($8\text{--}48\text{h}$) and dynamic caloric targets.
   - *Model 4 (`oracle_intent_model.joblib`):* Sublinear TF-IDF intent classifier routing somatic queries across eight clinical domains to an offline-resilient local LLaMA 3.2 3B instance.
4. **Persistence Tier:** Implemented using SQLAlchemy ORM over an encrypted storage schema. Plaintext reflection text and uploaded images never cross the network boundary.

### A. Device-Agnostic Hybrid Ingestion Tier
The architecture supports dual ingestion modalities:
- **Custom ESP32 IoT Wearable Biosensing Prototype:** A custom hardware unit incorporating a clinical-grade skin temperature sensor (MAX30205, $\pm 0.1^\circ\text{C}$ resolution from $0^\circ\text{C}$ to $50^\circ\text{C}$), a photoplethysmography sensor (MAX30102) for continuous RHR and SpO2 acquisition, an MPU-6050 six-axis inertial measurement unit (IMU) for sleep actigraphy, and an SSD1306 display. Telemetry is streamed over 2.4 GHz Wi-Fi via HTTP POST endpoints.
- **Universal Consumer Smartwatch Compatibility:** Implements the W3C Web Bluetooth API (`navigator.bluetooth`) to establish direct peer-to-peer connections from consumer smartwatches (Apple Watch, Wear OS, Garmin) directly to the browser client using standardized Bluetooth SIG GATT profiles: Heart Rate Service (`0x180D`, characteristic `0x2A37`) and Health Thermometer Service (`0x1809`, characteristic `0x2A1C`).

---

## V. METHODOLOGY & EXPERIMENTAL BENCHMARKING

### A. Dataset Partitioning & Synthetic-Real Distinction
To address clinical data sparsity while establishing verifiable real-world generalization, we constructed a unified multi-cohort benchmark totaling $N = 4{,}200$ longitudinal menstrual cycles ($118{,}440$ daily observations from $322$ distinct subjects/profiles). The dataset explicitly distinguishes between real empirical observations and synthetic physiological cohorts, summarized in Table I.

### TABLE I: Multi-Cohort Dataset Composition & Sources
| Cohort Type | Source Repository | Distinct Subjects | Complete Cycles | Total Days | Features Monitored | Verification / Ground Truth |
|---|---|:---:|:---:|:---:|---|---|
| **Real Empirical** | Open Humans Wearable Project | 58 | 720 | 20,304 | RHR, HRV rMSSD, Skin Temp, Sleep, SpO2 | Wearable sync + user cycle logs |
| **Real Empirical** | PhysioNet Physiological Repositories | 44 | 550 | 15,510 | Continuous ECG/PPG, RHR, HRV | Clinical polysomnography & telemetry |
| **Real Empirical** | Clue by Biowink Anonymized Open Study | 40 | 580 | 16,356 | BBT, cycle length, somatic symptoms | Self-reported menstrual logs & BBT |
| **Synthetic Physiological** | Bounded Stochastic Simulation (Treloar/Bull) | 180 | 2,350 | 66,270 | RHR, HRV, Temp, SpO2, Fatigue, Mood | Parametric physiological distribution |
| **Total Unified Dataset** | Combined Multi-Cohort Benchmark | **322** | **4,200** | **118,440** | Full 8-dimensional telemetry vector | Subject-stratified cross-validation |

#### 1) Synthetic Cohort Generation Methodology
The $2{,}350$ synthetic cycles were generated using a bounded multi-variable Ornstein-Uhlenbeck stochastic differential equation framework anchored to empirical endocrine parameters published by Treloar et al. [11] and Bull et al. [18]. For each synthetic athlete profile $j$, a baseline cycle length was sampled from a log-normal distribution ($\mu = 29.1\text{ days}, \sigma = 3.4\text{ days}$, bounded within $[21, 35]\text{ days}$). 

The biological phase lengths were parameterized as:
- *Menstrual Phase:* Uniform integer $\mathcal{U}(3, 6)\text{ days}$.
- *Follicular Phase:* Truncated Gaussian $\mathcal{N}(8.5, 2.1)\text{ days}$.
- *Ovulatory Phase:* Fixed biological window $\mathcal{U}(2, 3)\text{ days}$.
- *Luteal Phase:* Truncated Gaussian $\mathcal{N}(13.8, 1.4)\text{ days}$, reflecting biological conservation of luteal duration.

Daily telemetry signals were simulated by superimposing phase-dependent endocrine drift terms onto autoregressive noise processes:
$$\tau_t = \mu_{\tau} + \Delta_{\tau} \cdot \mathbb{I}(t \in \text{Luteal}) + \xi_t, \quad \xi_t = \rho \xi_{t-1} + \epsilon_t, \quad \epsilon_t \sim \mathcal{N}(0, \sigma^2)$$
where $\Delta_{\tau} \in [+0.3^\circ\text{C}, +0.5^\circ\text{C}]$, autocorrelation coefficient $\rho = 0.65$, and circadian variance $\sigma = 0.08^\circ\text{C}$. Equivalent coupled equations governed the $+5\text{--}10\text{ bpm}$ luteal RHR elevation and concomitant $-15\text{ ms}$ HRV rMSSD depression.

#### 2) Subject-Stratified Split (Eliminating Data Leakage)
To prevent cross-temporal data leakage, dataset partitioning was enforced strictly at the **Subject ID level** (rather than shuffling random daily vectors). The $322$ subjects were partitioned into:
- **Training Set (70%):** $225$ subjects ($2{,}940$ cycles, $40{,}600$ sequential 14-day sliding windows).
- **Validation Set (15%):** $48$ subjects ($630$ cycles, $8{,}700$ sequential 14-day sliding windows).
- **Held-Out Test Set (15%):** $49$ subjects ($630$ cycles, $8{,}700$ sequential 14-day sliding windows).

Continuous features were normalized per subject using empirical z-score standardization:
$$z_{u,t} = \frac{x_{u,t} - \mu_u}{\sigma_u}$$
where $\mu_u$ and $\sigma_u$ are computed exclusively across each subject's training windows. Missing wearable telemetry ($<3.2\%$ of records) was forward-filled up to a maximum threshold of two consecutive days, followed by median imputation.

---

### B. Model 1: Recurrent LSTM Phase Classifier
Because hormonal transitions exhibit temporal dependency spanning multiple weeks, we formulated phase classification using a 2-layer stacked Long Short-Term Memory (LSTM) recurrent neural network.

The input vector at day $t$ comprises five continuous signals:
$$\mathbf{v}_t = [z_{\text{RHR}}, z_{\text{HRV}}, z_{\text{Temp}}, \lambda_u, d_{u,t}]^T \in \mathbb{R}^5$$
where $\lambda_u$ represents the user's historical median cycle length and $d_{u,t}$ represents the elapsed day within the current cycle.

The recurrence relations follow standard gating formulations:
$$\mathbf{f}_t = \sigma(\mathbf{W}_f [\mathbf{h}_{t-1}, \mathbf{v}_t] + \mathbf{b}_f), \quad \mathbf{i}_t = \sigma(\mathbf{W}_i [\mathbf{h}_{t-1}, \mathbf{v}_t] + \mathbf{b}_i)$$
$$\tilde{\mathbf{C}}_t = \tanh(\mathbf{W}_c [\mathbf{h}_{t-1}, \mathbf{v}_t] + \mathbf{b}_c), \quad \mathbf{C}_t = \mathbf{f}_t \odot \mathbf{C}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{C}}_t$$
$$\mathbf{o}_t = \sigma(\mathbf{W}_o [\mathbf{h}_{t-1}, \mathbf{v}_t] + \mathbf{b}_o), \quad \mathbf{h}_t = \mathbf{o}_t \odot \tanh(\mathbf{C}_t)$$
The final hidden state $\mathbf{h}_{14} \in \mathbb{R}^{128}$ is projected through a multi-layer perceptron with dropout ($p=0.3$), batch normalization, and ReLU activation:
$$\hat{\mathbf{y}} = \text{Softmax}\big(\mathbf{W}_2 \cdot \text{ReLU}(\mathbf{W}_1 \mathbf{h}_{14} + \mathbf{b}_1) + \mathbf{b}_2\big) \in \Delta^3$$

Training was conducted using the Adam optimizer ($\text{lr} = 10^{-3}$, weight decay $= 10^{-4}$) with cosine annealing schedule and label-smoothed cross-entropy loss ($\alpha = 0.05$) over $100$ epochs with early stopping patience of $10$ epochs on an NVIDIA T4 GPU.

---

### C. Model 2: Athletic Strain Capacity Regressor (XGBoost)
Daily athletic strain capacity ($S_{\text{strain}} \in [30\%, 95\%]\text{ 1RM}$) is modeled using a regularized Extreme Gradient Boosting (XGBoost) regressor over a 10-dimensional input vector:
$$\mathbf{w}_t = [\hat{\mathbf{p}}_t, z_{\text{HRV}}, z_{\text{RHR}}, z_{\text{SpO2}}, f_t, m_t, s_t]^T \in \mathbb{R}^{10}$$
where $\hat{\mathbf{p}}_t \in \mathbb{R}^4$ is the one-hot or probabilistic phase representation from Model 1.

The objective function optimizes $K = 200$ additive regression trees minimizing mean squared error with explicit complexity penalties:
$$\mathcal{L}(\Theta) = \sum_{i=1}^n \big(y_i - \hat{y}_i\big)^2 + \sum_{k=1}^K \left( \gamma T_k + \frac{1}{2}\lambda \sum_{j=1}^{T_k} w_{k,j}^2 + \alpha \sum_{j=1}^{T_k} |w_{k,j}| \right)$$
Hyperparameters were tuned via 5-fold cross-validation: maximum tree depth $d = 4$, shrinkage rate $\eta = 0.05$, column subsample ratio $0.80$, row subsample ratio $0.85$, $\lambda = 1.2$, and $\alpha = 0.1$. Target ground-truth strain values were derived from the validated Borg Rating of Perceived Exertion (RPE) scale [16] calibrated against physiological maximum oxygen uptake ($\% \text{VO}_{2\text{max}}$) benchmarks.

---

### D. Model 3: Endocrine Recovery Kinetics & Metabolic Regressor
Neuromuscular restoration latency ($y_{\text{rec}} \in [8, 48]\text{ hours}$) and macronutrient metabolic targets are predicted via dual regularized gradient-boosted ensembles over an expanded 13-dimensional vector:
$$\mathbf{u}_t = [\hat{\mathbf{p}}_t, S_{\text{strain}}, z_{\text{HRV}}, z_{\text{RHR}}, z_{\text{SpO2}}, f_t, m_t, s_t, W_{\text{kg}}]^T \in \mathbb{R}^{13}$$
The dual model simultaneous outputs:
$$\hat{y}_{\text{rec}} = \sum_{k=1}^{K_1} f_k(\mathbf{u}_t), \quad \hat{\mathbf{y}}_{\text{meta}} = [\text{TDEE}_{\text{kcal}}, \text{Protein}_{\text{g}}, \text{Carbs}_{\text{g}}] = \sum_{j=1}^{K_2} \mathbf{g}_j(\mathbf{u}_t)$$
The models were trained on $N = 12{,}000$ physiological workout-recovery instances generated across the longitudinal cycle observations and cross-referenced with American College of Sports Medicine (ACSM) and International Society of Sports Nutrition (ISSN) recovery benchmarks.

---

### E. Endocrinological Nutrition Formulation & Justification
The metabolic engine dynamically calibrates Basal Metabolic Rate ($\text{BMR}$) and Total Daily Energy Expenditure ($\text{TDEE}$) using the validated Mifflin-St Jeor formula [7]:
$$\text{BMR} = 10 \cdot W_{\text{kg}} + 6.25 \cdot H_{\text{cm}} - 5 \cdot A_{\text{yrs}} - 161$$
$$\text{TDEE} = (\text{BMR} \times \text{PAL}) + \Delta_{\text{phase}}$$
where Physical Activity Level ($\text{PAL}$) ranges from $1.4$ (restorative) to $2.0$ (heavy training).

The physiological adjustments are grounded in published clinical evidence:
1. **Luteal Thermogenic Caloric Increment ($\Delta_{\text{phase}} = +180\text{ kcal/day}$):** Multiple indirect calorimetry investigations (e.g., Barr et al. [3], Webb [3], Solomon et al.) confirm that post-ovulatory progesterone acts upon hypothalamic $\beta$-adrenergic and uncoupling protein pathways, raising basal body temperature by $0.3^\circ\text{C}\text{--}0.5^\circ\text{C}$ and elevating resting daily energy expenditure by $2.5\%\text{--}8.9\%$ ($100\text{--}300\text{ kcal/day}$ depending on lean body mass). Providing a dynamic $+180\text{ kcal/day}$ buffer prevents the acute luteal energy deficits that trigger RED-S and compulsive evening carbohydrate binging.
2. **Phase-Specific Protein Partitioning ($1.4\text{--}1.9\text{ g/kg/day}$):** During follicular and ovulatory phases, elevated $17\beta$-estradiol upregulates muscle protein synthesis and accelerates recovery; target protein is set to $1.6\text{--}1.9\text{ g/kg/day}$ with $3.0\text{g}$ leucine per meal. During the luteal phase, elevated progesterone accelerates whole-body protein catabolism and nitrogen oxidation [2], [9], necessitating sustained amino acid availability ($1.6\text{ g/kg/day}$).
3. **Menstrual Iron Replenishment ($18\text{ mg/day}$):** Acute menstrual blood loss incurs an average elemental iron depletion of $1.5\text{--}2.0\text{ mg}$ per day of active bleeding ($15\text{--}30\text{ mg}$ per cycle). To prevent sports-related latent iron deficiency (serum ferritin $< 30\text{ }\mu\text{g/L}$) which degrades maximal aerobic capacity, iron intake is elevated to $18\text{ mg/day}$ during menses, coordinated with low-hepcidin morning windows [1].
4. **Luteal Dietary Fiber & Hepatic Estrogen Clearance ($32\text{ g/day}$):** Excess circulating estrogens are metabolized via hepatic cytochrome P450 glucuronidation and excreted in bile. Elevated insoluble and soluble dietary fiber ($32\text{ g/day}$) binds biliary estrogens and inhibits colonic bacterial $\beta$-glucuronidase enzymes [17], preventing the unconjugation and reabsorption of estrogen that exacerbates luteal fluid retention, breast tenderness, and premenstrual dysphoria.

---

### F. Host-Blind Zero-Knowledge Cryptographic Specification
To establish provable data sovereignty on untrusted database hosts, the system implements an authenticated, host-blind encryption pipeline executed entirely within the client Web Worker:

```
Passphrase P  ----->  PBKDF2-HMAC-SHA256 (100,000 iterations)  ----->  Master Key K_vault
                      + Random 128-bit Salt S                            (256 bits)
                                                                             |
Plaintext JSON M  -----------------------------------------------------------+
                      + Random 96-bit IV Nonce
                               |
                               v
                     AES-GCM-256 Authenticated Encryption
                               |
                               +-----------------------------+
                               |                             |
                               v                             v
                       Ciphertext Blob C            128-bit Auth Tag T
                               |
                               +-----> Stored as Tuple: (C, IV, S) in SQLite
```

1. **Key Derivation:** The user's private passphrase $P \in \{0,1\}^*$ derives a symmetric key $K_{\text{vault}} \in \{0,1\}^{256}$ via PBKDF2-HMAC-SHA256 utilizing a cryptographically secure random 128-bit salt $S \stackrel{\$}{\leftarrow} \{0,1\}^{128}$ and iteration count $c = 100{,}000$:
   $$K_{\text{vault}} = \text{PBKDF2-HMAC-SHA256}(P, S, c = 100{,}000, L = 256)$$
   This ensures high computational resistance against offline precomputed dictionary and rainbow table attacks.
2. **Authenticated AEAD Encryption:** Qualitative reflection text, symptom logs, and Base64-encoded images are serialized into a JSON byte payload $M$. The payload is encrypted using AES-256 in Galois/Counter Mode (GCM) with a unique 96-bit initialization vector $\text{IV} \stackrel{\$}{\leftarrow} \{0,1\}^{96}$ generated via CSPRNG (`window.crypto.getRandomValues`):
   $$(C, T) = \text{AES-GCM-Encrypt}(K_{\text{vault}}, \text{IV}_{96}, M)$$
   where $C$ is the ciphertext and $T \in \{0,1\}^{128}$ is the authentication tag appended to $C$.
3. **Integrity and Non-Recoverability Guarantees:** The resulting ciphertext tuple $(C, \text{IV}, S)$ is transmitted to the application server and persisted in the SQLite database. Under the assumption that AES is a pseudorandom permutation, this construction satisfies IND-CCA2 security. The master key $K_{\text{vault}}$ and plaintext $M$ never touch the network socket or persistence tier. A database compromise yields only statistically random byte distributions with zero semantic recovery possible without knowing $P$.

---

### G. Model 4: Sublinear TF-IDF Somatic Intent Classifier
To enable offline-resilient conversational explanations without transmitting unencrypted queries to centralized cloud LLMs, user queries $q$ are classified across eight clinical domains: `nutrition_fuel`, `training_load`, `recovery_soreness`, `symptom_cramps`, `sleep_insomnia`, `hormone_phase_inquiry`, `ovulation_fertility`, and `injury_laxity_prevention`.

Queries are transformed using sublinear Term Frequency-Inverse Document Frequency (TF-IDF) over unigrams and bigrams:
$$\text{TF-IDF}(t, d) = \big(1 + \log(\text{TF}(t, d))\big) \times \log\left(\frac{1 + |D|}{1 + \text{DF}(t)}\right)$$
Classification is performed using an L2-regularized multinomial logistic regression classifier ($C = 2.5$). When an offline Ollama instance is present, the predicted intent and posterior probability $P(\text{intent} \mid q)$ are injected into the prompt context of an offline LLaMA 3.2 3B instance. If external execution environments lack GPU acceleration, the engine deterministically outputs phase-calibrated clinical guidance with sub-millisecond CPU latency.

---

## VI. RESULTS AND DISCUSSION

### A. Model 1: Phase Classification Benchmark
Model 1 was evaluated on the held-out test cohort ($49$ unseen subjects, $630$ complete cycles). Performance across the four biological phases is detailed in Table II.

### TABLE II: Phase Classification Performance on Held-Out Test Cohort (Model 1)
| Phase Boundary | Precision | Recall | F1-Score | Support (Windows) | AUC-ROC |
|---|:---:|:---:|:---:|:---:|:---:|
| **Menstrual** | 0.92 | 0.90 | 0.91 | 1,850 | 0.962 |
| **Follicular** | 0.88 | 0.90 | 0.89 | 2,610 | 0.948 |
| **Ovulatory** | 0.87 | 0.89 | 0.88 | 1,300 | 0.941 |
| **Luteal** | 0.93 | 0.91 | 0.92 | 2,940 | 0.971 |
| **Overall / Macro Avg** | **0.900** | **0.900** | **0.901** | **8,700** | **0.956** |

The model achieved an overall accuracy of **$90.1\%$** with a macro F1-score of **$0.901$**. The highest F1-score ($0.92$) was achieved in the Luteal phase, driven by the prominent, sustained biphasic shift in nocturnal skin temperature ($+0.35^\circ\text{C}$) and concurrent RHR acceleration.

To directly address the distinction between real and synthetic data, Table III evaluates Model 1 separately across real empirical holdouts and synthetic holdouts.

### TABLE III: Model 1 Generalization Across Real vs. Synthetic Holdout Cohorts
| Evaluation Cohort | Complete Cycles | Sequential Windows | Accuracy (%) | Macro F1 | Ovulatory F1 | Luteal F1 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Real Empirical Holdouts ($N_{\text{real}}$) | 277 | 3,820 | 88.6% | 0.884 | 0.861 | 0.908 |
| Synthetic Holdout Cohort ($N_{\text{syn}}$) | 353 | 4,880 | 91.3% | 0.914 | 0.895 | 0.931 |
| **Combined Unified Holdout** | **630** | **8,700** | **90.1%** | **0.901** | **0.880** | **0.920** |

The minor delta between real empirical ($88.6\%$) and synthetic ($91.3\%$) accuracy confirms that the synthetic data generator captures genuine physiological dynamics without inducing synthetic mode collapse or severe domain divergence.

### TABLE IV: Feature Modality Ablation Study
| Feature Configuration | Accuracy (%) | Macro F1 | Absolute Gain ($\Delta$) | Statistical Significance |
|---|:---:|:---:|:---:|:---:|
| Calendar cycle day only | 68.2% | 0.664 | Baseline | — |
| + Subjective somatic symptoms (fatigue, mood) | 74.1% | 0.732 | +5.9% | $p < 0.01$ |
| + Actigraphy & sleep duration metrics | 83.4% | 0.821 | +9.3% | $p < 0.001$ |
| + Wearable physiological biometrics (HRV, RHR, Temp) | **90.1%** | **0.901** | **+6.7%** | $p < 0.001$ |

The ablation analysis (Table IV) demonstrates that relying solely on calendar counting yields an inadequate accuracy of $68.2\%$. Incrementally incorporating wearable physiological signals elevates overall accuracy to $90.1\%$, representing a statistically significant cumulative improvement of $+21.9\%$ ($p < 0.001$).

---

### B. Model 2 & Model 3: Strain Modulation & Recovery Benchmarks
Model 2 predicts daily strain targets with an overall Root Mean Squared Error (RMSE) of $4.8$ and an $R^2$ of $0.820$. Model 3 predicts post-exercise neuromuscular recovery latency and dynamic caloric expenditure on an unseen holdout cohort ($N = 1{,}200$ workout instances), as summarized in Table V.

### TABLE V: Athletic Strain & Recovery Performance Across Phases
| Phase | Mean Strain (% 1RM) | Target Recovery (Hours) | Strain RMSE | Recovery RMSE (h) | Recovery $R^2$ |
|---|:---:|:---:|:---:|:---:|:---:|
| **Menstrual** | 50.2% | 14.2h | 4.2 | 2.18 | 0.871 |
| **Follicular** | 75.4% | 10.1h | 4.8 | 2.45 | 0.852 |
| **Ovulatory** | 85.1% | 9.0h | 5.8 | 2.62 | 0.840 |
| **Luteal** | 61.3% | 12.4h | 4.5 | 2.38 | 0.884 |
| **Overall / Mean** | — | — | **4.8** | **2.41** | **0.862** |

Model 3 achieved an overall recovery latency $R^2$ of **$0.862$** (86.2% variance explained) and a Mean Absolute Error (MAE) of $1.85\text{ hours}$. Predictions falling within a clinically acceptable $\pm 2.0\text{ hour}$ tolerance reached $76.8\%$, and $93.5\%$ fell within $\pm 4.0\text{ hours}$. Total Daily Energy Expenditure (TDEE) estimation achieved $R^2 = 0.845$ ($\text{MAE} = 48.2\text{ kcal/day}$).

### TABLE VI: Gini Feature Importance Ranking for Recovery Latency (Model 3)
| Rank | Feature Description | Gini Importance (%) | Physiological Mechanism |
|:---:|---|:---:|---|
| 1 | Luteal Phase Probability ($p_{\text{luteal}}$) | 38.28% | Progesterone hyperthermia & elevated protein catabolism |
| 2 | Workout Strain Intensity ($S_{\text{strain}}$) | 22.24% | Mechanical microtrauma & glycogen depletion |
| 3 | Menstrual Phase Probability ($p_{\text{menstrual}}$) | 16.23% | Acute blood loss & systemic inflammatory tone |
| 4 | Follicular Phase Probability ($p_{\text{follicular}}$) | 7.36% | Estrogen-mediated glycogen sparing & rapid repair |
| 5 | Ovulatory Phase Probability ($p_{\text{ovulatory}}$) | 5.18% | Peak neuromuscular coordination & central drive |
| 6 | Subjective Fatigue Score ($f_t$) | 4.97% | Central nervous system fatigue perception |
| 7 | Sleep Duration ($s_t$) | 2.16% | Growth hormone secretion & nocturnal restoration |
| 8 | Heart Rate Variability ($\text{rMSSD}$) | 2.04% | Autonomic parasympathetic reactivation index |

---

### C. Model 4: Somatic Intent Classification
Model 4 was evaluated across $N = 800$ holdout clinical test queries uniformly distributed across the eight somatic domains ($100$ queries per domain). As presented in Table VII, the model achieved an overall accuracy of **$93.25\%$** (weighted F1 = $0.933$).

### TABLE VII: Somatic Intent Engine Performance (Model 4, $N = 800$)
| Clinical Domain Intent | Precision | Recall | F1-Score | Support | Example Query Concept |
|---|:---:|:---:|:---:|:---:|---|
| `nutrition_fuel` | 0.93 | 0.94 | 0.935 | 100 | "What should I eat before heavy squats in luteal?" |
| `training_load` | 0.94 | 0.92 | 0.930 | 100 | "Can I attempt a 1RM deadlift today?" |
| `recovery_soreness` | 0.91 | 0.90 | 0.905 | 100 | "Legs feel exhausted 36h after workout" |
| `symptom_cramps` | 0.92 | 0.95 | 0.935 | 100 | "Severe pelvic cramping and lower back ache" |
| `sleep_insomnia` | 0.95 | 0.93 | 0.940 | 100 | "Waking up repeatedly feeling hot at night" |
| `hormone_phase_inquiry` | 0.96 | 0.95 | 0.955 | 100 | "Which cycle phase am I in right now?" |
| `ovulation_fertility` | 0.94 | 0.96 | 0.950 | 100 | "Is temperature spike an ovulation sign?" |
| `injury_laxity_prevention` | 0.91 | 0.91 | 0.910 | 100 | "Knee instability during lateral lunges" |
| **Overall / Weighted Avg** | **0.933** | **0.933** | **0.933** | **800** | — |

---

### D. Zero-Knowledge Cryptographic Audit & Information-Theoretic Entropy
To rigorously substantiate our zero-knowledge claims, benchmarks were executed across $1{,}000$ independent encryption cycles on standard client hardware (Intel Core i5-1135G7, Google Chrome 124, 64-bit Windows):
- **PBKDF2 Key Derivation Latency ($100{,}000$ iterations):** $24.2 \pm 3.1\text{ ms}$.
- **AES-GCM-256 Payload Encryption (Text + 200KB Image):** $8.4 \pm 1.2\text{ ms}$.
- **Decryption and De-serialization Latency:** $6.1 \pm 0.9\text{ ms}$.
- **Total Client Processing Overhead:** $< 35\text{ ms}$ (imperceptible to user interaction).

#### Information-Theoretic Entropy Verification
To verify the complete absence of plaintext leakage or structural bias in the persisted database records, the Shannon entropy of raw ciphertext records stored in the SQLite database was computed:
$$H(X) = -\sum_{i=0}^{255} p(x_i) \log_2 p(x_i)$$
Across $500$ encrypted journal entries, the empirical Shannon entropy of the database ciphertext column measured **$7.989 \pm 0.003\text{ bits/byte}$** (approaching the theoretical maximum of $8.000\text{ bits/byte}$ for pure uncompressed random noise), compared to $4.21\text{ bits/byte}$ for plaintext English reflections. An exhaustive exact-match substring search of the physical database file confirmed zero matches for private medical strings or symptom terms.

---

## VII. NOVELTY AND SYSTEM-LEVEL SIGNIFICANCE

The primary novelty of this work resides in its unified system-level integration. Rather than treating female physiology as an isolated predictive task or analyzing cryptography in the abstract, the platform synthesizes:
1. Continuous time-series phase estimation from non-invasive biometrics.
2. Regularized athletic strain modulation ($30\%\text{--}95\%$) aligned with endocrine substrate partitioning.
3. Clinically-grounded nutritional compensation (+180 kcal luteal thermogenesis) designed to mitigate RED-S.
4. Verifiable, host-blind zero-knowledge cryptography ensuring that sensitive reproductive records remain inaccessible to persistence tiers.

This represents one of the first end-to-end architectures to demonstrate that personalized, hormone-synchronized athletic conditioning can be achieved without compromising reproductive privacy.

---

## VIII. LIMITATIONS

1. **Cohort Diversity and Prospective Validation:** While the hybrid evaluation benchmark ($N = 4{,}200$ cycles) combines public empirical datasets with literature-parameterized synthetic models, prospective multi-season tracking across diverse athletic disciplines (e.g., endurance runners vs. strength athletes) is necessary to evaluate long-term training adaptations.
2. **Key Derivation Hardness:** While PBKDF2 ($100{,}000$ rounds) is universally supported by the native Web Crypto API without external dependencies, future iterations will explore memory-hard functions (such as Argon2id [19]) via WebAssembly to further increase resistance against dedicated hardware/ASIC brute-force attacks.
3. **Endocrine Pathologies & Exogenous Hormones:** The current models assume eumenorrheic ovulatory cycles. Athletes utilizing oral hormonal contraceptives, levonorgestrel-releasing intrauterine devices (IUDs), or presenting with Polycystic Ovary Syndrome (PCOS) exhibit suppressed or atypical endogenous hormone curves [20] that require specialized transfer-learning architectures.

---

## IX. PRIVACY AND ETHICAL CONSIDERATIONS

All secondary datasets utilized in this investigation (Open Humans, PhysioNet, Clue open study) were strictly de-identified and governed under open research data licenses. Synthetic generation protocols adhered to ethical data synthesis standards without reconstructing individual private attributes. The system follows privacy-by-design: minimizing data transmission, enforcing local client key derivation, disallowing plaintext server logs, and enabling instant client-side cryptographic erasure.

---

## X. CONCLUSION AND FUTURE WORK

We presented an integrated, privacy-preserving digital health platform for phase-specific athletic training, recovery, and nutritional optimization. Experimental evaluations demonstrate that menstrual cycle phase boundaries can be predicted with $90.1\%$ accuracy from non-invasive wearable biometrics, athletic strain can be modulated with an RMSE of $4.8$, and recovery latency can be modeled with $R^2 = 0.862$, while client-side AES-GCM-256 cryptography mathematically guarantees zero plaintext persistence on server infrastructure.

Future work will expand the platform to incorporate: (1) on-device federated learning (via Flower [21]) for decentralized collaborative model training without centralizing telemetry, (2) direct Web Bluetooth synchronization with Apple HealthKit and Android Health Connect, and (3) clinical biomarker validation correlating non-invasive wearable predictions against serum estradiol and progesterone immunoassays.

---

## REFERENCES

1. E. Bruinvels et al., "Sport, exercise and the menstrual cycle: where is the research?," *Br. J. Sports Med.*, vol. 56, no. 8, pp. 419–420, 2022.
2. S. T. Sims, "Female athlete considerations for training and performance," *Sports Medicine*, vol. 51, pp. 1–12, 2021.
3. S. I. Barr et al., "Energy expenditure throughout the menstrual cycle in athletic women," *Am. J. Clin. Nutr.*, vol. 61, no. 1, pp. 39–43, 1995.
4. S. Hochreiter and J. Schmidhuber, "Long short-term memory," *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.
5. T. Chen and C. Guestrin, "XGBoost: A scalable tree boosting system," in *Proc. ACM SIGKDD*, 2016, pp. 785–794.
6. M. Dworkin, "Recommendation for block cipher modes of operation: Galois/Counter Mode (GCM)," *NIST Special Publication 800-38D*, 2007.
7. M. D. Mifflin et al., "A new predictive equation for resting energy expenditure in healthy individuals," *Am. J. Clin. Nutr.*, vol. 51, no. 2, pp. 241–247, 1990.
8. M. Mountjoy et al., "The IOC consensus statement on relative energy deficiency in sport (RED-S): 2018 update," *Br. J. Sports Med.*, vol. 52, no. 11, pp. 687–697, 2018.
9. K. L. McNulty et al., "The effects of menstrual cycle phase on exercise performance in eumenorrheic women: A systematic review and meta-analysis," *Sports Med.*, vol. 50, no. 10, pp. 1813–1827, 2020.
10. Mozilla Foundation, "*Privacy Not Included: Reproductive Health App Security Review*", Tech. Rep., 2023.
11. A. E. Treloar et al., "Variation of the human menstrual cycle through reproductive life," *Int. J. Fertil.*, vol. 12, no. 1, pp. 77–126, 1967.
12. Flo Health, "*Data Privacy and Compliance Architecture*", Technical White Paper, 2023.
13. Whoop Inc., "*Quantifying Cardiovascular Strain and Autonomic Recovery*", White Paper, 2023.
14. M. Marlinspike and T. Perrin, "*The Double Ratchet Algorithm*", Signal Technical Specification, 2020.
15. C. Gentry, "Fully homomorphic encryption using ideal lattices," in *Proc. ACM STOC*, 2009, pp. 169–178.
16. G. Borg, "Psychophysical bases of perceived exertion," *Med. Sci. Sports Exerc.*, vol. 14, no. 5, pp. 377–381, 1982.
17. J. M. Baker et al., "Estrogen–gut microbiome axis: Physiological implications," *Nature Reviews Endocrinology*, vol. 13, pp. 200–211, 2017.
18. J. R. Bull et al., "Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles," *npj Digital Medicine*, vol. 2, no. 1, p. 83, 2019.
19. A. Biryukov et al., "Argon2: New generation of memory-hard password hashing," in *IEEE EuroS&P*, 2016, pp. 1–15.
20. G. Bozdag et al., "The prevalence and phenotypic variations of polycystic ovary syndrome," *Human Reproduction*, vol. 31, no. 12, pp. 2841–2849, 2023.
21. D. J. Beutel et al., "Flower: A friendly federated learning framework," *arXiv preprint arXiv:2007.14390*, 2020.
22. J. Gala et al., "IndicTrans2: Towards high-quality open-source machine translation for Indian languages," *arXiv preprint arXiv:2305.16307*, 2023.
