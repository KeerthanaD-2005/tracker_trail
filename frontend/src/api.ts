export const TOKEN_KEY = "mh_token";
export const API_URL_KEY = "mh_api_url";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(API_URL_KEY);
    if (custom) return `${custom.replace(/\/$/, "")}/api/v1`;
    const origin = window.location.origin;
    if (origin.startsWith("capacitor://") || (origin.startsWith("http://localhost") && !window.location.port)) {
      return "http://192.168.1.2:8000/api/v1";
    }
  }
  return "/api/v1";
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail ?? j);
  } catch {
    return await res.text();
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  role?: string;
  is_active?: boolean;
  created_at: string;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  training_level?: string | null;
  cycle_goal?: string | null;
  dietary_pref?: string | null;
  allergies?: string | null;
  favorite_cuisines?: string | null;
  streak_days?: number;
  last_active_date?: string | null;
};

export type CalendarReminder = {
  id: string;
  user_id: string;
  reminder_date: string;
  title: string;
  category: string;
  is_completed: boolean;
  created_at: string;
};


export type StoredFile = {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  category: string;
  created_at: string;
};

export type Phase = {
  phase: string;
  day_in_cycle: number;
  cycle_length_assumed: number;
  irregularity_hint: number;
  model_note: string;
};

export type Dashboard = {
  user: User;
  last_cycle: {
    id: string;
    user_id: string;
    period_start: string;
    period_end: string | null;
    flow_intensity: number | null;
    notes: string | null;
    created_at: string;
  } | null;
  recent_symptoms: Array<Record<string, unknown>>;
  latest_wearable: Record<string, unknown> | null;
  latest_phase: Phase | null;
  latest_recommendation: Record<string, unknown> | null;
  unread_notification_count: number;
  recent_notifications: Array<{
    id: string;
    kind: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
  }>;
};

export type RecommendOut = {
  training_intensity_score: number;
  recovery_hours_suggested: number;
  focus: string;
  dietary: Record<string, unknown>;
  workout_sessions: Array<Record<string, unknown>>;
  hydration_liters: number;
  micronutrients: string[];
  intensity_source: string;
  model_note: string;
};

export type ChatOut = { reply: string; source: string };

export type AnalyticsCycles = {
  period_starts: string[];
  inferred_cycle_lengths: number[];
};

export type AnalyticsSymptoms = {
  points: Array<{ log_date: string; mood: number | null; fatigue: number | null }>;
};

export type AnalyticsWearable = {
  daily: Array<{
    date: string;
    samples: number;
    avg_hrv_ms: number | null;
    avg_resting_hr: number | null;
  }>;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type CustomRecipeOut = {
  name: string;
  prep_time_mins: number;
  cook_time_mins: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  iron_mg: number;
  phase_benefit: string;
  ingredients: string[];
  instructions: string[];
  nutritional_focus: string;
};

export type JournalEntryCreate = {
  entry_date: string;
  encrypted_payload: string;
  iv: string;
  salt: string;
  tag?: string;
};

export type JournalEntryUpdate = {
  entry_date?: string;
  encrypted_payload: string;
  iv: string;
  salt: string;
  tag?: string;
};

export type JournalEntryOut = {
  id: string;
  user_id: string;
  entry_date: string;
  encrypted_payload: string;
  iv: string;
  salt: string;
  tag?: string | null;
  created_at: string;
  updated_at: string;
};

export type CycleItem = {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string | null;
  flow_intensity: number | null;
  notes: string | null;
  created_at?: string;
};

export type CycleForecastItem = {
  cycle_number: number;
  period_start: string;
  period_end: string;
  ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
  luteal_start: string;
};

export type CycleForecast = {
  median_cycle_length: number;
  irregularity_score: number;
  regularity_status: string;
  total_cycles_logged: number;
  forecasts: CycleForecastItem[];
};

export type ExportData = {
  user: User;
  cycles: CycleItem[];
  symptoms: Array<{
    id: string;
    log_date: string;
    mood: number | null;
    fatigue: number | null;
    symptoms: Record<string, unknown> | null;
  }>;
  wearables: Array<{
    id: string;
    recorded_at: string;
    hrv_ms: number | null;
    resting_hr: number | null;
    skin_temp_c: number | null;
    spo2_pct: number | null;
    steps: number | null;
    workout_type: string | null;
  }>;
  exported_at: string;
};

