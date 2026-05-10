/**
 * Hand-written database types for the coaching platform.
 *
 * These mirror the schema in supabase/migrations and are kept terse on
 * purpose — once the project has a live Supabase instance, regenerate the
 * canonical types with:
 *
 *   pnpm supabase gen types typescript --project-id <ref> > src/types/database.gen.ts
 *
 * and switch the import in @/lib/supabase/* to the generated file.
 *
 * The shape (Row/Insert/Update/Relationships per table) is dictated by
 * @supabase/postgrest-js' `GenericTable` constraint — without it, typed
 * `select(...)` queries collapse to `never`.
 */

export type UserRole = "admin" | "client";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type TrainingGoal =
  | "fat_loss"
  | "muscle_gain"
  | "recomposition"
  | "athletic_performance";
export type NutritionMode = "fixed" | "flexible";
export type WorkoutDoneStatus = "yes" | "partial" | "no";
export type BillingPeriod =
  | "monthly"
  | "quarterly"
  | "biannual"
  | "yearly"
  | "one_time";
export type ApplicationStatus =
  | "new"
  | "contacted"
  | "in_review"
  | "accepted"
  | "rejected"
  | "archived";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type TrainingLocation = "home" | "gym" | "both";
export type ContactMethod = "whatsapp" | "phone" | "email";
export type Gender = "male" | "female" | "other";
export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "refunded";
export type PaymentMethod =
  | "vodafone_cash"
  | "instapay"
  | "bank_transfer"
  | "cash"
  | "other";
export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "expiring_soon"
  | "expired"
  | "suspended";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  preferred_locale: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  age: number | null;
  height_cm: number | null;
  starting_weight_kg: number | null;
  experience_level: ExperienceLevel | null;
  goal: TrainingGoal | null;
  health_notes: string | null;
  start_date: string | null;
  target_date: string | null;
  // 0007 admin metadata
  phone: string | null;
  whatsapp_phone: string | null;
  coach_notes: string | null;
  is_archived: boolean;
  // 0010 subscription lifecycle
  subscription_status: SubscriptionStatus;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  last_payment_at: string | null;
  last_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  section_key: string;
  content_json: Record<string, unknown>;
  is_published: boolean;
  updated_at: string;
}

export interface FoodDatabaseRow {
  id: string;
  name: string;
  name_ar: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  client_id: string;
  name: string;
  is_active: boolean;
  general_notes: string | null;
  attention_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDay {
  id: string;
  plan_id: string;
  day_number: number;
  day_name: string;
}

export interface Exercise {
  id: string;
  day_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  video_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface WorkoutLog {
  id: string;
  client_id: string;
  exercise_id: string;
  log_date: string;
  set_number: number;
  weight_kg: number | null;
  reps_done: number | null;
  created_at: string;
}

export interface NutritionPlan {
  id: string;
  client_id: string;
  mode: NutritionMode;
  calories_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealFoodItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  plan_id: string;
  meal_type: string;
  food_items: MealFoodItem[];
  display_order: number;
}

export interface FoodLog {
  id: string;
  client_id: string;
  food_id: string;
  log_date: string;
  weight_grams: number;
  calculated_calories: number;
  calculated_protein: number;
  calculated_carbs: number;
  calculated_fat: number;
  meal_type: string | null;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  client_id: string;
  measured_on: string;
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  shoulders_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  body_fat_percent: number | null;
  created_at: string;
}

export interface WeightLogRow {
  id: string;
  client_id: string;
  log_date: string;
  weight_kg: number;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  client_id: string;
  taken_on: string;
  storage_path: string;
  note: string | null;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  client_id: string;
  checkin_date: string;
  workout_done: WorkoutDoneStatus;
  workout_sets_done: number | null;
  diet_compliance: number | null;
  cardio_done: boolean;
  cardio_minutes: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  client_note: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  currency: string;
  billing_period: BillingPeriod;
  features_en: string[];
  features_ar: string[];
  cta_label_en: string | null;
  cta_label_ar: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CoachingApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  preferred_contact: ContactMethod;
  best_contact_time: string | null;
  age: number | null;
  gender: Gender | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_percent: number | null;
  goal: TrainingGoal | null;
  target_weight_kg: number | null;
  target_date: string | null;
  motivation_text: string | null;
  experience_level: ExperienceLevel | null;
  previous_coaching: boolean;
  previous_results_text: string | null;
  training_days_per_week: number | null;
  training_location: TrainingLocation | null;
  available_equipment_text: string | null;
  preferred_training_time: string | null;
  injuries_or_conditions: string | null;
  medications: string | null;
  allergies: string | null;
  surgeries_text: string | null;
  dietary_restrictions: string | null;
  foods_disliked: string | null;
  current_diet_summary: string | null;
  water_intake_liters: number | null;
  occupation: string | null;
  daily_activity_level: ActivityLevel | null;
  sleep_hours_avg: number | null;
  stress_level: number | null;
  smokes: boolean;
  package_id: string | null;
  notes: string | null;
  locale: string;
  status: ApplicationStatus;
  admin_notes: string | null;
  contacted_at: string | null;
  converted_client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  client_id: string | null;
  application_id: string | null;
  package_id: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference_number: string | null;
  sender_phone: string | null;
  receipt_url: string | null;
  period_start: string | null;
  period_end: string | null;
  duration_days: number | null;
  status: PaymentStatus;
  paid_at: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type TableShape<R, I, U> = {
  Row: R;
  Insert: I;
  Update: U;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<
        Profile,
        Partial<Profile> & Pick<Profile, "id" | "email" | "role">,
        Partial<Profile>
      >;
      clients: TableShape<
        Client,
        Partial<Client> & Pick<Client, "user_id">,
        Partial<Client>
      >;
      site_content: TableShape<
        SiteContent,
        Partial<SiteContent> &
          Pick<SiteContent, "section_key" | "content_json">,
        Partial<SiteContent>
      >;
      food_database: TableShape<
        FoodDatabaseRow,
        Partial<FoodDatabaseRow> &
          Pick<
            FoodDatabaseRow,
            | "name"
            | "calories_per_100g"
            | "protein_per_100g"
            | "carbs_per_100g"
            | "fat_per_100g"
          >,
        Partial<FoodDatabaseRow>
      >;
      workout_plans: TableShape<
        WorkoutPlan,
        Partial<WorkoutPlan> & Pick<WorkoutPlan, "client_id" | "name">,
        Partial<WorkoutPlan>
      >;
      workout_days: TableShape<
        WorkoutDay,
        Partial<WorkoutDay> &
          Pick<WorkoutDay, "plan_id" | "day_number" | "day_name">,
        Partial<WorkoutDay>
      >;
      exercises: TableShape<
        Exercise,
        Partial<Exercise> & Pick<Exercise, "day_id" | "name" | "sets" | "reps">,
        Partial<Exercise>
      >;
      workout_logs: TableShape<
        WorkoutLog,
        Partial<WorkoutLog> &
          Pick<WorkoutLog, "client_id" | "exercise_id" | "set_number">,
        Partial<WorkoutLog>
      >;
      nutrition_plans: TableShape<
        NutritionPlan,
        Partial<NutritionPlan> & Pick<NutritionPlan, "client_id" | "mode">,
        Partial<NutritionPlan>
      >;
      meals: TableShape<
        Meal,
        Partial<Meal> & Pick<Meal, "plan_id" | "meal_type">,
        Partial<Meal>
      >;
      food_logs: TableShape<
        FoodLog,
        Partial<FoodLog> &
          Pick<
            FoodLog,
            | "client_id"
            | "food_id"
            | "weight_grams"
            | "calculated_calories"
            | "calculated_protein"
            | "calculated_carbs"
            | "calculated_fat"
          >,
        Partial<FoodLog>
      >;
      body_measurements: TableShape<
        BodyMeasurement,
        Partial<BodyMeasurement> & Pick<BodyMeasurement, "client_id">,
        Partial<BodyMeasurement>
      >;
      weight_logs: TableShape<
        WeightLogRow,
        Partial<WeightLogRow> & Pick<WeightLogRow, "client_id" | "weight_kg">,
        Partial<WeightLogRow>
      >;
      progress_photos: TableShape<
        ProgressPhoto,
        Partial<ProgressPhoto> &
          Pick<ProgressPhoto, "client_id" | "storage_path">,
        Partial<ProgressPhoto>
      >;
      daily_checkins: TableShape<
        DailyCheckin,
        Partial<DailyCheckin> &
          Pick<DailyCheckin, "client_id" | "workout_done">,
        Partial<DailyCheckin>
      >;
      packages: TableShape<
        Package,
        Partial<Package> & Pick<Package, "slug" | "name_en" | "name_ar">,
        Partial<Package>
      >;
      coaching_applications: TableShape<
        CoachingApplication,
        Partial<CoachingApplication> &
          Pick<CoachingApplication, "full_name" | "email" | "phone">,
        Partial<CoachingApplication>
      >;
      payments: TableShape<
        Payment,
        Partial<Payment> & Pick<Payment, "amount">,
        Partial<Payment>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      experience_level: ExperienceLevel;
      training_goal: TrainingGoal;
      nutrition_mode: NutritionMode;
      workout_done_status: WorkoutDoneStatus;
      billing_period: BillingPeriod;
      application_status: ApplicationStatus;
      activity_level: ActivityLevel;
      training_location: TrainingLocation;
      contact_method: ContactMethod;
      gender: Gender;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
