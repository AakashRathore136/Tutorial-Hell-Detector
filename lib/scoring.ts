export interface UserStats {
  tutorialHours: number;
  codingHours: number;
  unfinishedProjects: number;
  shippedProjects: number;
  githubCommits: number;
  description: string;
}

export interface AssessmentResult {
  tutorialHellScore: number;
  builderScore: number;
  burnoutRisk: number;
  executionRating: number;
  confidenceScore: number;
  anomalyLevel: number;
  isAmbiguous: boolean;
  isGamed: boolean;
}

/**
 * Centralized, magic-number-free constants for behavioral modeling,
 * calibration, outlier caps, and physical bounds.
 */
export const SCORING_CONSTANTS = {
  // Physical and feasibility thresholds (based on 30-day assessment window)
  FEASIBILITY: {
    MAX_FEASIBLE_HOURS: 320,        // 320 hours (approx 10.6 hrs/day) is the threshold where feasibility degrades
    IMPOSSIBLE_HOURS_LIMIT: 720,    // 720 hours is the absolute physical limit of a 30-day month
    UNREALISTIC_PROJECTS_LIMIT: 15, // Starting more than 15 projects in a month indicates hyper-scattered focus
    NORMAL_COMMIT_DENSITY_MAX: 10,  // Max typical commits per active coding hour
    GAMING_COMMIT_DENSITY_THRESHOLD: 15 // Past 15 commits per active hour is treated as auto-gaming/spam
  },

  // Hill function parameters (x50) for various operational growth curves
  HILL_HALF_MAX: {
    TUTORIAL_HOURS: 15,
    CODING_HOURS: 20,
    SHIPPED_PROJECTS: 2,
    SHIPPED_VOLUME_BUILDER: 3,
    GITHUB_COMMITS_EXECUTION: 50,
    GITHUB_COMMITS_BUILDER: 80,
    UNFINISHED_PROJECTS_BURNOUT: 8,
    TOTAL_HOURS_BURNOUT: 40,
    ANOMALY_HOURS: 100,
    ANOMALY_COMMITS: 15,
    ANOMALY_PROJECTS: 10
  },
  
  // Mathematical weights for multi-attribute indices
  WEIGHTS_EXECUTION: {
    COMPLETION_RATE: 0.5,
    SHIPPED_VOLUME: 0.3,
    COMMIT_ACTIVITY: 0.2
  },

  WEIGHTS_TUTORIAL_HELL: {
    PASSIVE_LEARNING: 0.6,
    ABANDONMENT_RATE: 0.4
  },

  WEIGHTS_BUILDER: {
    CODING_HOURS: 0.3,
    SHIPPED_VOLUME: 0.4,
    COMPLETION_RATE: 0.2,
    COMMIT_ACTIVITY: 0.1
  },

  WEIGHTS_BURNOUT: {
    ABANDONMENT_RATE: 0.6,
    MULTITASKING: 0.4
  },

  WEIGHTS_ANOMALY: {
    FEASIBILITY: 0.4,
    COMMIT_DENSITY: 0.4,
    PROJECT_COUNT: 0.2
  },

  // Boundaries for physical and psychological consistency constraints
  GUARDS: {
    HIGH_TH_CEILING: 80,
    HIGH_TH_BS_LIMIT: 35,
    ZERO_SHIPPED_BS_LIMIT: 15,
    LOW_EXECUTION_CEILING: 30,
    LOW_EXECUTION_BS_LIMIT: 40,
    LOW_EXECUTION_CAP: 25,
    LOW_EXECUTION_BS_CAP_VAL: 30,
    LOW_TH_LIMIT: 30,
    HIGH_BUILDER_LIMIT: 70
  }
};

/**
 * Mathematically clamps a value within a specified boundary [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes a value from a specified physical range [min, max] into [0, 1].
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

/**
 * Computes a weighted average of values given normalized weights.
 */
export function weightedAverage(values: number[], weights: number[]): number {
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  if (sumWeights === 0) return 0;
  const weightedSum = values.reduce((sum, val, idx) => sum + val * (weights[idx] || 0), 0);
  return weightedSum / sumWeights;
}

/**
 * Asymptotic bounded scaling function using Hill/Michaelis-Menten kinetics.
 * Maps non-negative inputs smoothly into [0, 1) to model natural biological growth.
 * Formula: f(x) = x / (x + halfMax)
 */
export function scaleHill(x: number, halfMax: number): number {
  if (x <= 0) return 0;
  return x / (x + halfMax);
}

/**
 * Standard Sigmoid activation function to map inputs continuously onto (0, 1).
 * Formula: sigmoid(x) = 1 / (1 + e^-x)
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Multiplicatively applies a penalty factor to scale down scores.
 */
export function applyPenalty(score: number, penaltyFactor: number): number {
  return score * clamp(penaltyFactor, 0, 1);
}

/**
 * Adjusts a metric score based on the system's absolute confidence rating.
 * Highly inconsistent or suspect inputs are scaled back to moderate ranges.
 */
export function confidenceAdjustedScore(score: number, confidence: number): number {
  const confidenceFactor = confidence / 100;
  // Blend towards a moderate central value (50) to resist extreme gaming outputs
  return Math.round(score * confidenceFactor + 50 * (1 - confidenceFactor));
}

/**
 * Audits provided stats for internal consistency, feasibility, and gamed metrics.
 * Calculates an Anomaly Level (0-100) and an overall Confidence Score (0-100).
 */
export function calculateConfidence(stats: UserStats) {
  const {
    tutorialHours,
    codingHours,
    unfinishedProjects,
    shippedProjects,
    githubCommits
  } = stats;

  const C = SCORING_CONSTANTS;

  // 1. Feasibility Anomaly: Suspect total hours (clamped strictly to absolute physical limit)
  const totalHours = clamp(tutorialHours + codingHours, 0, C.FEASIBILITY.IMPOSSIBLE_HOURS_LIMIT);
  const feasibilityExcess = Math.max(0, totalHours - C.FEASIBILITY.MAX_FEASIBLE_HOURS);
  const feasibilityAnomaly = scaleHill(feasibilityExcess, C.HILL_HALF_MAX.ANOMALY_HOURS);

  // 2. Commit Density Anomaly (Anti-Gaming): High commits relative to active coding hours
  let commitDensityAnomaly = 0;
  let commitDensity = 0;
  
  if (codingHours === 0) {
    // Zero hours but active commits indicates potential automation or blind tutorial copypaste
    if (githubCommits > 0) {
      commitDensityAnomaly = scaleHill(githubCommits, C.HILL_HALF_MAX.ANOMALY_COMMITS);
    }
  } else {
    commitDensity = githubCommits / codingHours;
    const densityExcess = Math.max(0, commitDensity - C.FEASIBILITY.NORMAL_COMMIT_DENSITY_MAX);
    commitDensityAnomaly = scaleHill(densityExcess, C.HILL_HALF_MAX.ANOMALY_COMMITS);
  }

  // 3. Project Volume Anomaly: Unrealistic number of projects started in 30 days
  const totalProjects = shippedProjects + unfinishedProjects;
  const projectExcess = Math.max(0, totalProjects - C.FEASIBILITY.UNREALISTIC_PROJECTS_LIMIT || 15);
  const projectAnomaly = scaleHill(projectExcess, C.HILL_HALF_MAX.ANOMALY_PROJECTS);

  // 4. Composite Anomaly Level (AS)
  const asRaw = weightedAverage(
    [feasibilityAnomaly, commitDensityAnomaly, projectAnomaly],
    [
      C.WEIGHTS_ANOMALY.FEASIBILITY,
      C.WEIGHTS_ANOMALY.COMMIT_DENSITY,
      C.WEIGHTS_ANOMALY.PROJECT_COUNT
    ]
  );
  
  const anomalyLevel = clamp(Math.round(asRaw * 100), 0, 100);
  const confidenceScore = clamp(100 - anomalyLevel, 0, 100);

  // Flags for qualitative ambiguity assessment
  const isAmbiguous = anomalyLevel > 30;
  const isGamed = commitDensity > C.FEASIBILITY.GAMING_COMMIT_DENSITY_THRESHOLD && githubCommits > 50;

  return {
    confidenceScore,
    anomalyLevel,
    isAmbiguous,
    isGamed,
    commitDensityAnomaly
  };
}

/**
 * Professional developer behavioral analytics scoring engine.
 * Calculates mathematically coherent, calibrated, and validated scores (0-100)
 * representing realistic learning traps, capabilities, and burnout risks.
 */
export function calculateScores(stats: UserStats): AssessmentResult {
  const C = SCORING_CONSTANTS;

  // 1. Audit consistency and anti-gaming anomalies first
  const {
    confidenceScore,
    anomalyLevel,
    isAmbiguous,
    isGamed,
    commitDensityAnomaly
  } = calculateConfidence(stats);

  // Apply absolute physical caps to input variables to prevent overflow/gaming
  const tutorialHours = clamp(stats.tutorialHours, 0, C.FEASIBILITY.IMPOSSIBLE_HOURS_LIMIT);
  const codingHours = clamp(stats.codingHours, 0, C.FEASIBILITY.IMPOSSIBLE_HOURS_LIMIT);
  const unfinishedProjects = clamp(stats.unfinishedProjects, 0, 50);
  const shippedProjects = clamp(stats.shippedProjects, 0, 50);
  
  // Apply commit density anti-gaming mitigation factor (diminishes effective commit count if gamed)
  const commitEfficiency = 1 - commitDensityAnomaly;
  const effectiveCommits = clamp(stats.githubCommits * commitEfficiency, 0, 1000);

  // 2. Compute ratios and structural metrics
  const totalHours = tutorialHours + codingHours;
  const R_learn = totalHours === 0 ? 0 : tutorialHours / totalHours;

  const totalProjects = shippedProjects + unfinishedProjects;
  const R_complete = totalProjects === 0 ? 0 : shippedProjects / totalProjects;

  // 3. Execution Rating (ER)
  // Reflects completion discipline, shipped volume, and gamed-mitigated commits
  const F_shipped = scaleHill(shippedProjects, C.HILL_HALF_MAX.SHIPPED_PROJECTS);
  const F_commits = scaleHill(effectiveCommits, C.HILL_HALF_MAX.GITHUB_COMMITS_EXECUTION);
  
  const erRaw = weightedAverage(
    [R_complete, F_shipped, F_commits],
    [
      C.WEIGHTS_EXECUTION.COMPLETION_RATE,
      C.WEIGHTS_EXECUTION.SHIPPED_VOLUME,
      C.WEIGHTS_EXECUTION.COMMIT_ACTIVITY
    ]
  );
  let executionRating = clamp(Math.round(erRaw * 100), 0, 100);

  // 4. Tutorial Hell Score (THS)
  // Ratio of passive learning scaled by absolute time, mitigated by completion rate and shipped work
  const F_hours = scaleHill(tutorialHours, C.HILL_HALF_MAX.TUTORIAL_HOURS);
  const F_mitigation = 1 - scaleHill(shippedProjects, C.HILL_HALF_MAX.SHIPPED_PROJECTS);
  
  const thBase = weightedAverage(
    [R_learn, 1 - R_complete],
    [
      C.WEIGHTS_TUTORIAL_HELL.PASSIVE_LEARNING,
      C.WEIGHTS_TUTORIAL_HELL.ABANDONMENT_RATE
    ]
  );
  
  const thsRaw = thBase * F_hours * F_mitigation;
  let tutorialHellScore = clamp(Math.round(thsRaw * 100), 0, 100);

  // 5. Builder Score (BS)
  // Reflects sustained keyboard active time, completed work, and verified commit activity,
  // penalized exponentially by passive learning bias (R_learn^2).
  const F_code = scaleHill(codingHours, C.HILL_HALF_MAX.CODING_HOURS);
  const F_shipped_vol = scaleHill(shippedProjects, C.HILL_HALF_MAX.SHIPPED_VOLUME_BUILDER);
  const F_commits_build = scaleHill(effectiveCommits, C.HILL_HALF_MAX.GITHUB_COMMITS_BUILDER);
  const penalty_learn = 1 - (R_learn * R_learn); // Parabolic active synergy curve
  
  const bsBase = weightedAverage(
    [F_code, F_shipped_vol, R_complete, F_commits_build],
    [
      C.WEIGHTS_BUILDER.CODING_HOURS,
      C.WEIGHTS_BUILDER.SHIPPED_VOLUME,
      C.WEIGHTS_BUILDER.COMPLETION_RATE,
      C.WEIGHTS_BUILDER.COMMIT_ACTIVITY
    ]
  );
  
  let bsRaw = bsBase * penalty_learn;
  let builderScore = clamp(Math.round(bsRaw * 100), 0, 100);

  // 6. Burnout Risk (BR)
  // Rises with raw effort hours, scattered focus (unfinished), and lack of shipped gratification
  const F_total_hours = scaleHill(totalHours, C.HILL_HALF_MAX.TOTAL_HOURS_BURNOUT);
  const F_multitask = scaleHill(unfinishedProjects, C.HILL_HALF_MAX.UNFINISHED_PROJECTS_BURNOUT);
  
  const brBase = weightedAverage(
    [1 - R_complete, F_multitask],
    [
      C.WEIGHTS_BURNOUT.ABANDONMENT_RATE,
      C.WEIGHTS_BURNOUT.MULTITASKING
    ]
  );
  
  const brRaw = F_total_hours * brBase;
  let burnoutRisk = clamp(Math.round(brRaw * 100), 0, 100);

  // 7. Structural Consistency Guards & Caps (Anti-gaming & Logical coherence)
  
  // Guard A: Zero shipped projects caps absolute builder capability (must ship to be a master builder)
  if (shippedProjects === 0) {
    builderScore = Math.min(C.GUARDS.ZERO_SHIPPED_BS_LIMIT, builderScore);
  }
  
  // Guard B: Low execution efficiency caps builder capabilities
  if (executionRating < C.GUARDS.LOW_EXECUTION_CEILING) {
    builderScore = Math.min(C.GUARDS.LOW_EXECUTION_BS_LIMIT, builderScore);
  }
  
  // Guard C: Extreme Tutorial Hell constrains Builder capabilities
  if (tutorialHellScore > C.GUARDS.HIGH_TH_CEILING) {
    builderScore = Math.min(C.GUARDS.HIGH_TH_BS_LIMIT, builderScore);
  }

  // Guard D: Correlation Guard (Ensure Builder Score and Tutorial Hell are logically inversely correlated)
  if (tutorialHellScore > 50 && builderScore > 50) {
    builderScore = Math.min(builderScore, 100 - tutorialHellScore + 20);
  }

  // Guard E: Strict low execution ceiling cap (Execution < 25 enforces Builder <= 30)
  if (executionRating < C.GUARDS.LOW_EXECUTION_CAP) {
    builderScore = Math.min(C.GUARDS.LOW_EXECUTION_BS_CAP_VAL, builderScore);
  }

  // 8. Confidence-based Score Blending
  // If inputs are highly anomalous or ambiguous (CS < 100), blend scores slightly towards 
  // standard normal averages to protect the system's credibility against extreme data.
  tutorialHellScore = confidenceAdjustedScore(tutorialHellScore, confidenceScore);
  builderScore = confidenceAdjustedScore(builderScore, confidenceScore);
  burnoutRisk = confidenceAdjustedScore(burnoutRisk, confidenceScore);
  executionRating = confidenceAdjustedScore(executionRating, confidenceScore);

  return {
    tutorialHellScore,
    builderScore,
    burnoutRisk,
    executionRating,
    confidenceScore,
    anomalyLevel,
    isAmbiguous,
    isGamed
  };
}
