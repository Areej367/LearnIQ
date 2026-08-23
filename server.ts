import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: Boolean(apiKey && apiKey.length > 0),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Endpoint 1: Concept Detective (Root Cause Analysis of Student Mistake)
  app.post("/api/ai/concept-detective", async (req, res) => {
    try {
      const {
        question,
        correctAnswer,
        studentAnswer,
        conceptTitle,
        subject,
        prerequisites = [],
      } = req.body;

      if (!aiClient) {
        // Fallback intelligent heuristic diagnosis if API key not available yet
        return res.json({
          rootCause: `Misunderstanding the underlying mechanism of ${conceptTitle}`,
          misconceptionType: "misconception",
          misconceptionDetail: `The student's response indicates confusion between core conceptual principles and prerequisite operations for ${conceptTitle}.`,
          missingPrerequisites: prerequisites.length > 0 ? prerequisites : [`Fundamentals of ${conceptTitle}`],
          recommendedActionPlan: [
            `Review the theoretical foundation of ${conceptTitle}`,
            `Revisit prerequisite concepts: ${prerequisites.join(", ") || "Foundational definitions"}`,
            `Step through a visual trace example`,
            `Attempt 2 beginner-level validation questions`,
            `Retry this problem with step-by-step reasoning`
          ],
          confidenceScore: 0.92,
          isSimulated: true,
        });
      }

      const prompt = `
You are the expert Educational Psychometrist and AI Concept Detective in LearnIQ.
Analyze this student's incorrect or flawed answer to uncover the ROOT CAUSE and cognitive MISCONCEPTION.

Context:
- Subject: ${subject || "Computer Science"}
- Concept: ${conceptTitle}
- Prerequisites: ${JSON.stringify(prerequisites)}
- Question: "${question}"
- Correct Answer: "${correctAnswer}"
- Student's Answer: "${studentAnswer}"

Your Task:
1. Determine the root cause of why the student gave this specific answer.
2. Classify the misconception into one of: 'missing_prerequisite', 'misconception', 'careless_mistake', 'question_misunderstanding', or 'partial_understanding'.
3. Describe the exact mental model error or misconception they hold.
4. Pinpoint which prerequisite knowledge is missing or weak.
5. Provide a concrete 4-5 step remediation plan to bridge the gap.
6. Provide a confidence score (0.0 to 1.0).

Return valid JSON adhering strictly to this schema:
{
  "rootCause": "string",
  "misconceptionType": "string",
  "misconceptionDetail": "string",
  "missingPrerequisites": ["string"],
  "recommendedActionPlan": ["string"],
  "confidenceScore": 0.95
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are the LearnIQ Concept Detective AI engine. Be precise, pedagogical, compassionate, and uncover the deep root cause of student mistakes.",
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("Concept Detective AI error:", err);
      return res.status(500).json({
        error: "Failed to run Concept Detective analysis",
        message: err.message || "Unknown error",
      });
    }
  });

  // AI Endpoint 2: Explain My Mistake (Detailed Breakdown + Similar Try-Again Generator)
  app.post("/api/ai/explain-mistake", async (req, res) => {
    try {
      const { question, correctAnswer, studentAnswer, conceptTitle, subject } = req.body;

      if (!aiClient) {
        return res.json({
          whyWrong: `Your answer suggests you considered part of the problem, but overlooked the fundamental constraints of ${conceptTitle}.`,
          whatYouMisunderstood: `You may have assumed an eager or sequential approach rather than the required prerequisite methodology.`,
          whatToLearnFirst: `First review the foundational rules and definitions of ${conceptTitle}.`,
          tryAgainQuestion: {
            questionText: `Let's test the prerequisite concept for ${conceptTitle}: Which statement accurately describes its fundamental principle?`,
            options: [
              `It operates strictly on partitioned or structured prerequisite sets`,
              `It inspects every element sequentially from first to last`,
              `It ignores data structure constraints`,
              `It only executes when memory is unlimited`
            ],
            correctAnswer: `It operates strictly on partitioned or structured prerequisite sets`,
            explanation: `Correct! Mastering this rule ensures you understand why ${conceptTitle} works efficiently.`
          },
          isSimulated: true
        });
      }

      const prompt = `
You are the LearnIQ pedagogical assistant. The student just made a mistake on a quiz question.
Provide a clear, encouraging educational breakdown and generate a "Try Again" practice question to verify they corrected their misconception.

Question: "${question}"
Correct Answer: "${correctAnswer}"
Student Answer: "${studentAnswer}"
Concept: "${conceptTitle}"
Subject: "${subject || "Computer Science"}"

Output JSON with format:
{
  "whyWrong": "string (clear, encouraging explanation of why their answer doesn't work)",
  "whatYouMisunderstood": "string (precise misconception breakdown)",
  "whatToLearnFirst": "string (prerequisite concepts to review first)",
  "tryAgainQuestion": {
    "questionText": "string (a similar but slightly different multiple choice question testing the same concept or prerequisite)",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string (exact match of one of the options)",
    "explanation": "string (why this answer is correct)"
  }
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Explain Mistake AI error:", err);
      return res.status(500).json({
        error: "Failed to generate mistake explanation",
        message: err.message,
      });
    }
  });

  // AI Endpoint 3: Socratic AI Tutor Chat
  app.post("/api/ai/tutor", async (req, res) => {
    try {
      const {
        message,
        history = [],
        conceptContext = {},
        studentProfile = {},
      } = req.body;

      if (!aiClient) {
        return res.json({
          reply: `Hello ${studentProfile.name || "Student"}! As your LearnIQ Socratic Tutor, I notice you are currently studying **${conceptContext.title || "Computer Science"}**. Before I give the direct definition, let me ask you: What do you think happens to memory or state when this operation begins?`,
          socraticPrompt: "Think about the base conditions or prerequisites required before execution.",
          suggestedFollowUps: [
            "Walk me through a concrete example with numbers",
            "What is the prerequisite I should review first?",
            "Can you give me an analogy from everyday life?"
          ]
        });
      }

      const systemInstruction = `
You are the **LearnIQ Socratic AI Tutor** — an expert computer science and STEM educator.
Your core teaching philosophy:
1. Do NOT just give away full answers immediately if the student can discover it through guided reasoning.
2. Know the student's mastery profile:
   - Name: ${studentProfile.name || "Student"}
   - Weak concepts: ${JSON.stringify(studentProfile.weakConcepts || [])}
   - Current active concept: ${conceptContext.title || "General"} (Mastery: ${conceptContext.masteryScore || 50}%)
   - Known prerequisites: ${JSON.stringify(conceptContext.prerequisites || [])}
3. Use Socratic questioning, real-world analogies, step-by-step mental models, and code snippets when helpful.
4. Always remain encouraging, intellectually stimulating, and concise.

Format your output as JSON:
{
  "reply": "string (your main markdown-formatted explanation or Socratic response)",
  "socraticPrompt": "string (a guided reflective question to prompt the student's thinking)",
  "suggestedFollowUps": ["string", "string", "string"]
}
`;

      const prompt = `
Conversation History:
${history.map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n')}

Student's Latest Message: "${message}"
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("AI Tutor error:", err);
      return res.status(500).json({
        error: "AI Tutor service failed",
        message: err.message,
      });
    }
  });

  // AI Endpoint 4: Adaptive Quiz Generator
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const {
        conceptTitle,
        subject,
        difficulty = "intermediate",
        count = 3,
        focusWeakness = "",
      } = req.body;

      if (!aiClient) {
        return res.json({
          questions: [
            {
              id: `q-${Date.now()}-1`,
              conceptId: conceptTitle.toLowerCase().replace(/\\s+/g, '-'),
              conceptTitle: conceptTitle,
              subjectId: subject || "Database Systems",
              questionText: `In the context of ${conceptTitle}, which condition must strictly hold true?`,
              options: [
                `All functional dependencies must reference candidate keys`,
                `All attributes must be non-atomic`,
                `Redundancy is deliberately maximized`,
                `Indices are automatically invalidated`
              ],
              correctAnswer: `All functional dependencies must reference candidate keys`,
              explanation: `This is a fundamental rule required to maintain data integrity and avoid anomalies.`,
              difficulty: difficulty,
              bloomsLevel: "understanding"
            }
          ]
        });
      }

      const prompt = `
Generate ${count} high-quality, distinct, conceptual and application quiz questions for university students.
Subject: ${subject}
Concept: ${conceptTitle}
Difficulty: ${difficulty} (beginner, intermediate, or advanced)
Focus Weakness / Mistake Area to probe: "${focusWeakness || "None specified"}"

Ensure questions test genuine understanding and diagnose misconceptions, not trivial trivia.

Return JSON conforming to:
{
  "questions": [
    {
      "id": "string",
      "conceptTitle": "${conceptTitle}",
      "questionText": "string",
      "codeSnippet": "optional string with code if relevant",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must match one option exactly)",
      "explanation": "string (why the correct option is right and common pitfalls of distractors)",
      "difficulty": "${difficulty}",
      "bloomsLevel": "string (one of: 'recall', 'understanding', 'application', 'analysis', 'problem_solving')"
    }
  ]
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || '{"questions": []}');
      return res.json(parsed);
    } catch (err: any) {
      console.error("Generate Quiz AI error:", err);
      return res.status(500).json({
        error: "Quiz generation failed",
        message: err.message,
      });
    }
  });

  // AI Endpoint 5: Personalized Weekly Learning & Diagnostic Report
  app.post("/api/ai/learning-report", async (req, res) => {
    try {
      const { studentProfile, masteryData, recentMistakes, subjects } = req.body;

      if (!aiClient) {
        return res.json({
          overallProgressDelta: "+14%",
          strongestArea: "SQL SELECT Queries & Relational Keys",
          weakestArea: "3NF Normalization & Transitive Dependencies",
          mostCommonMistake: "Confusing 2NF partial dependencies with 3NF transitive dependencies",
          recommendedFocus: "Review Functional Dependencies and Call Stack Memory before advancing to BCNF and Trees",
          retentionWarning: "Recursion base cases and SQL JOIN syntax are entering high-decay phase (predicted retention < 60%)",
          weeklyActionPlan: [
            "Complete 10 min rapid revision of SQL JOINs today",
            "Review Functional Dependencies prerequisite video & interactive SkillGraph node",
            "Take 5-question targeted adaptive quiz on 3NF",
            "Engage Socratic Tutor on Recursion Stack Frames"
          ],
          generatedAt: new Date().toISOString()
        });
      }

      const prompt = `
Generate a comprehensive, encouraging, and data-driven Weekly AI Study Intelligence Report for this student.

Student Data:
- Name: ${studentProfile?.name || "Student"}
- Major: Computer Science / Engineering
- Subjects: ${JSON.stringify(subjects || [])}
- Mastery Status: ${JSON.stringify(masteryData || [])}
- Recent Mistake Logs: ${JSON.stringify(recentMistakes || [])}

Provide an insightful diagnosis of learning velocity, cognitive obstacles, retention risks, and prioritized next steps.

Return JSON adhering to:
{
  "overallProgressDelta": "string (e.g. '+12%')",
  "strongestArea": "string",
  "weakestArea": "string",
  "mostCommonMistake": "string",
  "recommendedFocus": "string",
  "retentionWarning": "string",
  "weeklyActionPlan": ["string", "string", "string", "string"],
  "generatedAt": "${new Date().toISOString()}"
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Learning Report AI error:", err);
      return res.status(500).json({
        error: "Failed to generate learning report",
        message: err.message,
      });
    }
  });

  // AI Endpoint 6: Adaptive Exam Preparation Roadmap
  app.post("/api/ai/exam-plan", async (req, res) => {
    try {
      const {
        subjectTitle,
        examDate,
        targetScore = 85,
        currentMastery = 60,
        availableHoursDaily = 2,
        weakConcepts = [],
      } = req.body;

      if (!aiClient) {
        return res.json({
          daysRemaining: 12,
          currentMastery,
          targetScore,
          feasibilityScore: "High with targeted prerequisite repair",
          priorityRoadmap: [
            { phase: "Day 1-3", focus: "Repair Foundation & Weak Prerequisites", topics: weakConcepts.slice(0, 2) },
            { phase: "Day 4-7", focus: "Core High-Yield Topic Mastery & Problem Solving", topics: ["Core Algorithms", "Query Optimization"] },
            { phase: "Day 8-10", focus: "ForgetMeNot Spaced Recall & Timed Adaptive Quizzes", topics: ["Comprehensive Recall"] },
            { phase: "Day 11-12", focus: "Full Mock Exam & High-Yield Summary Review", topics: ["Exam Simulation"] }
          ],
          aiStrategyAdvice: "Focus 60% of your time on prerequisite repairs before taking timed exams. Fixing functional dependencies will automatically unlock 3NF mastery."
        });
      }

      const prompt = `
You are the LearnIQ Exam Preparation AI Architect.
Create an optimized, high-yield study plan for an upcoming exam.

Subject: ${subjectTitle}
Exam Date: ${examDate}
Target Score: ${targetScore}%
Current Estimated Mastery: ${currentMastery}%
Available Study Hours/Day: ${availableHoursDaily} hrs
Student's Weak Concepts: ${JSON.stringify(weakConcepts)}

Generate a phased, prioritized roadmap that focuses on high-weight topics, weak prerequisites, and spaced revision.

Return JSON:
{
  "daysRemaining": number,
  "currentMastery": ${currentMastery},
  "targetScore": ${targetScore},
  "feasibilityScore": "string (e.g. 'High', 'Moderate', 'Challenging')",
  "priorityRoadmap": [
    {
      "phase": "string (e.g. 'Phase 1: Days 1-3')",
      "focus": "string",
      "topics": ["string", "string"]
    }
  ],
  "aiStrategyAdvice": "string"
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Exam Plan AI error:", err);
      return res.status(500).json({
        error: "Failed to generate exam plan",
        message: err.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LearnIQ Server is running at http://localhost:${PORT}`);
  });
}

startServer();
