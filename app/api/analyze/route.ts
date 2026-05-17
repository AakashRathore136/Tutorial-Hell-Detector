import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stats, scores } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Please restart your Next.js dev server to load the new .env.local file.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a principal-level developer coach and behavioral data analyst conducting a developer productivity and learning habit audit.
Analyze the following stats and calculated behavioral indices for a developer:

User Provided Inputs (Past 30 days):
- Passive Tutorial Hours: ${stats.tutorialHours}h
- Active Coding Hours: ${stats.codingHours}h
- Started Unfinished Projects: ${stats.unfinishedProjects}
- Shipped/Completed Projects: ${stats.shippedProjects}
- GitHub Commits (Self-Reported): ${stats.githubCommits}
- Self Description of Habits: "${stats.description}"

Calculated Behavioral Indices:
- Tutorial Hell Score (THS): ${scores.tutorialHellScore}/100 (High indicates severe passive overconsumption and completion drag)
- Builder Score (BS): ${scores.builderScore}/100 (High indicates sustained active shipping and independent coding)
- Burnout Risk (BR): ${scores.burnoutRisk}/100 (High indicates excessive effort hours relative to shipped outcomes and high multitasking fatigue)
- Execution Rating (ER): ${scores.executionRating}/100 (High indicates excellent project completion rate and regular git activity)
- Metric Consistency/Confidence Score: ${scores.confidenceScore}/100 (Low indicates highly contradictory, physically unrealistic, or gamed inputs)
- Anomaly/Gaming Index: ${scores.anomalyLevel}/100 (High indicates suspect patterns, e.g. automated commit flooding or impossible hours)

NARRATIVE CALIBRATION RULES:
You must strictly align your narrative severity and tone with the calculated indices:

1. TIER 1: LOW SEVERITY TRAP / STRONG BUILDER (Tutorial Hell Score < 30 or Builder Score > 65):
   - Tone: Highly constructive, professional, and balanced.
   - Analysis: Congratulate their strong independent shipping. Deliver nuanced and systems-oriented feedback. Do NOT accuse them of tutorial addiction.

2. TIER 2: MEDIUM SEVERITY TRAP (Tutorial Hell Score between 30 and 70):
   - Tone: Objective, evidence-based, and direct.
   - Analysis: Calmly identify concrete behavioral friction points, such as starting too many projects without finishing them, or spending excessive hours passively watching guides rather than typing code.

3. TIER 3: HIGH SEVERITY TRAP (Tutorial Hell Score > 70):
   - Tone: Analytical, sharp, and direct.
   - Analysis: Deliver a high-fidelity behavioral critique highlighting severe learning loops and passive dependence. Keep it extremely professional and clinical, not cartoonish or insulting.

4. ANOMALOUS/GAMED INPUTS (Confidence Score < 65 or Anomaly Level > 35):
   - Tone: Critically analytical and skeptical.
   - Analysis: Tactfully call out contradictory or physically impossible data points (e.g. extremely high commits with near-zero coding hours, or total hours exceeding logical monthly constraints). Gently prompt them to resubmit realistic data.

VALIDATION CONSTRAINTS:
- If Tutorial Hell is < 30, do NOT use terms like "severe tutorial addict" or "addicted to videos".
- If Builder Score is > 70, you MUST explicitly recognize their strong execution and building habits.
- If Shipped Projects >= 3, you MUST recognize proven shipping execution.
- Never accuse a user of cheating unless the Anomaly Level is high.
- Output strictly in JSON format matching this schema without markdown code block formatting:
{
  "diagnosis": "A highly calibrated, professional, evidence-backed 2-3 sentence psychological/behavioral diagnosis.",
  "redFlags": ["flag 1 (direct, objective behavioral flags matching metrics)", "flag 2", "flag 3"],
  "recoveryPlan": ["step 1 (concrete action plan)", "step 2", "step 3"],
  "projectIdea": "One specific, highly scoped project idea tailored to their description and skillset that they can start immediately without tutorials.",
  "verdict": "One direct, calibrated, final summarizing feedback sentence matching their tier."
}`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini API error");
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No content received from Gemini AI. The response may have been blocked or filtered by safety guidelines.");
    }

    // Strip potential markdown JSON code block wrappers
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    let result;
    try {
      result = JSON.parse(cleanText);
    } catch (e: any) {
      console.error("Failed to parse Gemini JSON output:", cleanText, e);
      throw new Error("AI returned malformed output that could not be parsed.");
    }

    // Strict validation & default fallbacks to prevent any client-side crashes
    const validatedResult = {
      diagnosis: typeof result?.diagnosis === 'string' ? result.diagnosis : "An error occurred while compiling your diagnosis.",
      redFlags: Array.isArray(result?.redFlags) ? result.redFlags.map(String) : ["Unable to extract learning behavior red flags."],
      recoveryPlan: Array.isArray(result?.recoveryPlan) ? result.recoveryPlan.map(String) : ["Stop watching tutorials.", "Build a real-world app.", "Commit to GitHub daily."],
      projectIdea: typeof result?.projectIdea === 'string' ? result.projectIdea : "Create a customized application using only official documentation.",
      verdict: typeof result?.verdict === 'string' ? result.verdict : "Get back to building."
    };

    return NextResponse.json(validatedResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
