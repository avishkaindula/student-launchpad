/**
 * Deterministic scope check used by the `checkScope` tool.
 *
 * Tools don't have to call an API — plain functions like this one are great
 * tools because they give the model facts it can't hallucinate. The numbers
 * are deliberately simple heuristics; tune them for your context.
 */

export type ScopePlan = {
  mustHaveFeatures: string[];
  teamSize: number;
  weeksAvailable: number;
  needsTrainedModel: boolean;
  hasDataSource: boolean;
};

export type ScopeAssessment = {
  verdict: "comfortable" | "tight" | "overloaded";
  estimatedPersonWeeks: number;
  availablePersonWeeks: number;
  flags: string[];
  suggestion: string;
};

/** Person-weeks to design, build, test and polish one end-to-end feature. */
const PERSON_WEEKS_PER_FEATURE = 1.5;
/** Share of a student's week realistically left for the project after other modules. */
const AVAILABILITY = 0.5;
/** Extra effort for collecting, cleaning and iterating on an ML model. */
const ML_OVERHEAD_PERSON_WEEKS = 3;

export function assessScope(plan: ScopePlan): ScopeAssessment {
  const flags: string[] = [];

  let estimated = plan.mustHaveFeatures.length * PERSON_WEEKS_PER_FEATURE;
  if (plan.needsTrainedModel) estimated += ML_OVERHEAD_PERSON_WEEKS;
  const available = plan.teamSize * plan.weeksAvailable * AVAILABILITY;

  if (plan.mustHaveFeatures.length > 5) {
    flags.push(`${plan.mustHaveFeatures.length} must-have features — an MVP usually needs 3–5.`);
  }
  if (plan.needsTrainedModel && !plan.hasDataSource) {
    flags.push("The plan depends on a trained model but has no confirmed data source. Secure data before anything else.");
  }
  if (plan.weeksAvailable < 4) {
    flags.push("Under 4 weeks leaves little room for testing and integration. Keep one feature end-to-end.");
  }
  if (plan.teamSize === 1 && plan.mustHaveFeatures.length > 2) {
    flags.push("Solo builders should ship one core flow first, then add features.");
  }

  const ratio = estimated / available;
  const verdict = ratio > 1 ? "overloaded" : ratio > 0.75 ? "tight" : "comfortable";

  const suggestion =
    verdict === "overloaded"
      ? "Cut must-haves until the estimate fits, and move the rest to a 'later' list."
      : verdict === "tight"
        ? "Doable, but agree now on which feature you will cut first if you fall behind."
        : "Good headroom — spend it on testing, user feedback and a polished demo.";

  return {
    verdict,
    estimatedPersonWeeks: Math.round(estimated * 10) / 10,
    availablePersonWeeks: Math.round(available * 10) / 10,
    flags,
    suggestion,
  };
}
