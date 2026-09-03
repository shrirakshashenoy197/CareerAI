require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PDFParse }= require("pdf-parse");
const OpenAI =require("openai");

const openai= new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});


const app = express();
const PORT = process.env.PORT||5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store uploaded files in memory
const upload = multer({
    storage: multer.memoryStorage()
});

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "CareerAI backend is running successfully!"
    });
});


// Resume analysis
app.post("/api/career", upload.single("resume"), async (req, res) => {

    try {
        console.log("Resume received:", req.file?.originalname);
        console.log("Target job role:", req.body.jobRole);

        // Check if resume exists
        if (!req.file) {
            return res.status(400).json({
                error: "Resume file was not received."
            });
        }

        // Check PDF
        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({
                error: "Please upload a PDF resume."
            });
        }

        // Extract text from PDF
        const parser = new PDFParse({data:req.file.buffer});
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;

        await parser.destroy();

        console.log("Resume text extracted successfully.");
        console.log("Characters extracted:", resumeText.length);

        // Target job role
        const jobRole = req.body.jobRole || "Not specified";

        // Convert resume text to lowercase for keyword checking
        const text = resumeText.toLowerCase();

        // ===============================
       // BASIC RESUME VALIDATION
// ===============================

const resumeKeywords = [
    "education",
    "skills",
    "experience",
    "project",
    "projects",
    "resume",
    "objective",
    "summary",
    "certification",
    "contact"
];

const matchedResumeKeywords = resumeKeywords.filter(keyword =>
    text.includes(keyword)
);

if (matchedResumeKeywords.length < 2) {
    return res.status(400).json({
        error: "This document does not appear to be a resume. Please upload a resume PDF."
    });
}

        // Skills we will check
        // Role-specific skill requirements
const roleSkills = {
    "software engineer": [
        "javascript",
        "python",
        "java",
        "c++",
        "data structures",
        "algorithms",
        "git",
        "sql",
        "react",
        "node.js"
    ],

    "frontend developer": [
        "html",
        "css",
        "javascript",
        "react",
        "git"
    ],

    "backend developer": [
        "node.js",
        "sql",
        "mongodb",
        "api",
        "git",
        "express"
    ],

    "full stack developer": [
        "html",
        "css",
        "javascript",
        "react",
        "node.js",
        "sql",
        "mongodb",
        "git"
    ],

    "data scientist": [
        "python",
        "sql",
        "machine learning",
        "pandas",
        "numpy",
        "statistics"
    ],

    "machine learning engineer": [
        "python",
        "machine learning",
        "artificial intelligence",
        "numpy",
        "pandas",
        "tensorflow",
        "scikit-learn"
    ]
};
// ===============================
// ROLE-BASED CATEGORY SKILLS
// ===============================

const categorySkillsByRole = {

    "software engineer": {
        dsa: [
            "data structures",
            "algorithms",
            "c++",
            "java",
            "python"
        ],
        web: [
            "html",
            "css",
            "javascript",
            "react",
            "node.js",
            "sql",
            "api"
        ],
        communication: [
            "teamwork",
            "collaboration",
            "leadership",
            "presentation",
            "communication"
        ]
    },

    "frontend developer": {
        dsa: [
            "data structures",
            "algorithms",
            "javascript"
        ],
        web: [
            "html",
            "css",
            "javascript",
            "react",
            "git"
        ],
        communication: [
            "teamwork",
            "collaboration",
            "communication",
            "presentation"
        ]
    },

    "backend developer": {
        dsa: [
            "data structures",
            "algorithms",
            "java",
            "python",
            "c++"
        ],
        web: [
            "node.js",
            "express",
            "mongodb",
            "sql",
            "api",
            "git"
        ],
        communication: [
            "teamwork",
            "collaboration",
            "communication",
            "leadership"
        ]
    },

    "full stack developer": {
        dsa: [
            "data structures",
            "algorithms",
            "javascript",
            "python",
            "java"
        ],
        web: [
            "html",
            "css",
            "javascript",
            "react",
            "node.js",
            "mongodb",
            "sql",
            "api",
            "git"
        ],
        communication: [
            "teamwork",
            "collaboration",
            "communication",
            "leadership",
            "presentation"
        ]
    },

    "data scientist": {
        dsa: [
            "data structures",
            "algorithms",
            "python",
            "statistics"
        ],
        web: [
            "html",
            "css",
            "javascript",
            "react",
            "node.js"
        ],

        communication: [
            "communication",
            "presentation",
            "teamwork",
            "collaboration",
            "leadership"
        ]
    },

    "machine learning engineer": {
        dsa: [
            "data structures",
            "algorithms",
            "python",
            "java",
            "c++"
        ],
        web: [
            "api",
            "sql"
        ],
        communication: [
            "communication",
            "presentation",
            "teamwork",
            "collaboration",
            "leadership"
        ]
    }
};


// Find the selected role
const selectedRole = jobRole.toLowerCase();

let requiredSkills = roleSkills[selectedRole];

if (!requiredSkills) {
    requiredSkills = roleSkills["software engineer"];
}


// Skills found in the resume
const detectedSkills = requiredSkills.filter(skill =>
    text.includes(skill.toLowerCase())
);


// Skills missing from the resume
const missingSkills = requiredSkills.filter(skill =>
    !text.includes(skill.toLowerCase())
);


// ===============================
// IMPROVED RESUME SCORE
// ===============================

let score = 0;

// 1. Relevant skills - 40 points
const skillMatch = detectedSkills.length / requiredSkills.length;

score += Math.round(skillMatch * 40);


// 2. Projects - 15 points
if (text.includes("project") || text.includes("projects")) {
    score += 15;
}


// 3. Experience - 15 points
if (
    text.includes("experience") ||
    text.includes("internship") ||
    text.includes("work experience")
) {
    score += 15;
}


// 4. Education - 10 points
if (
    text.includes("education") ||
    text.includes("bachelor") ||
    text.includes("degree") ||
    text.includes("engineering")
) {
    score += 10;
}


// 5. Achievements - 10 points
if (
    text.includes("achievement") ||
    text.includes("award") ||
    text.includes("certification") ||
    text.includes("certificate")
) {
    score += 10;
}


// 6. Resume completeness - 10 points
let completeness = 0;

if (text.includes("skills")) completeness += 2;
if (text.includes("education")) completeness += 2;
if (text.includes("project")) completeness += 2;
if (text.includes("experience")) completeness += 2;
if (text.includes("contact")) completeness += 2;

score += completeness;


// Make sure score stays between 0 and 100
score = Math.min(Math.max(score, 0), 100);


// Strengths
const strengths = [];

if (detectedSkills.length > 0) {
    strengths.push(
        `Your resume contains ${detectedSkills.length} skills relevant to the ${jobRole} role.`
    );
}

if (text.includes("project")) {
    strengths.push("Your resume includes project experience.");
}

if (text.includes("experience")) {
    strengths.push("Your resume includes experience information.");
}

if (strengths.length === 0) {
    strengths.push("Your resume contains some relevant information.");
}


// Improvements
const improvements = [];

if (missingSkills.length > 0) {
    improvements.push(
        `Consider adding or developing: ${missingSkills.slice(0, 4).join(", ")}.`
    );
}

if (!text.includes("achievement")) {
    improvements.push(
        "Add measurable achievements to strengthen your resume."
    );
}

if (!text.includes("project")) {
    improvements.push(
        "Add relevant projects related to your target role."
    );
}


// Recommended skills
const recommendedSkills = missingSkills.slice(0, 5);

// ===============================
// SKILL GAP ANALYSIS
// ===============================

const skillGap = {
    have: detectedSkills,
    need: missingSkills,
    priority: missingSkills.slice(0, 4)
};

// ===============================
// INTERVIEW QUESTIONS
// ===============================

const interviewQuestions = {
    "software engineer": [
    {
        question: "Explain the difference between an array and a linked list.",
        answer: "An array stores elements in contiguous memory locations, while a linked list stores elements in separate nodes connected using pointers. Arrays provide faster random access, while linked lists make insertion and deletion easier in certain situations."
    },
    {
        question: "What is the time complexity of binary search?",
        answer: "The time complexity of binary search is O(log n) because the search space is divided into half after every comparison."
    },
    {
        question: "What is object-oriented programming?",
        answer: "Object-oriented programming is a programming approach based on objects and classes. Its main concepts include encapsulation, inheritance, polymorphism, and abstraction."
    },
    {
        question: "Explain the difference between SQL and NoSQL databases.",
        answer: "SQL databases use structured tables and predefined schemas, while NoSQL databases can store data in flexible formats such as documents, key-value pairs, or graphs."
    },
    {
        question: "What is the purpose of Git?",
        answer: "Git is a version control system used to track changes in source code, collaborate with other developers, and manage different versions of a project."
    }
],

    "frontend developer": [
        "What is the difference between HTML and HTML5?",
        "Explain the CSS box model.",
        "What is the difference between let, const, and var?",
        "What are React components?",
        "What is responsive web design?"
    ],

    "backend developer": [
        "What is a REST API?",
        "What is middleware in Node.js?",
        "What is the difference between SQL and NoSQL?",
        "How does authentication work in a web application?",
        "What is the purpose of Express.js?"
    ],

    "full stack developer": [
        "Explain the difference between frontend and backend development.",
        "What is a REST API?",
        "How does a database connect to a backend application?",
        "What are React components?",
        "How would you design a simple full-stack application?"
    ],

    "data scientist": [
    {
        question: "What is the difference between supervised and unsupervised learning?",
        answer: "Supervised learning uses labeled data to learn a relationship between inputs and outputs, while unsupervised learning finds patterns or structures in data without labeled outputs."
    },
    {
        question: "What is overfitting and how can you prevent it?",
        answer: "Overfitting happens when a model learns the training data too closely and performs poorly on unseen data. It can be reduced using techniques such as cross-validation, regularization, simpler models, and more training data."
    },
    {
        question: "What is the difference between classification and regression?",
        answer: "Classification predicts discrete categories or classes, while regression predicts continuous numerical values."
    },
    {
        question: "Why is feature scaling important?",
        answer: "Feature scaling puts numerical features on comparable ranges. This is important for algorithms that are sensitive to feature magnitude, such as KNN, SVM, and gradient-based methods."
    },
    {
        question: "How would you handle missing data in a dataset?",
        answer: "Missing data can be handled by removing rows or columns when appropriate, or by imputing values using methods such as mean, median, mode, or model-based imputation."
    }
],

    "machine learning engineer": [
        "What is the difference between supervised and unsupervised learning?",
        "Explain overfitting and underfitting.",
        "What is feature engineering?",
        "How would you evaluate a machine learning model?",
        "What is the difference between TensorFlow and scikit-learn?"
    ]
};

const selectedInterviewQuestions =
    interviewQuestions[selectedRole] ||
    interviewQuestions["software engineer"];

const nextSteps = [];

if (missingSkills.length > 0) {
    nextSteps.push(
        `Focus on improving: ${missingSkills.slice(0, 3).join(", ")}.`
    );
}

nextSteps.push(
    `Build at least one project related to your target role: ${jobRole}.`
);

if (!text.includes("achievement")) {
    nextSteps.push(
        "Add measurable achievements and results to your resume."
    );
}

if (!text.includes("experience") && !text.includes("internship")) {
    nextSteps.push(
        "Look for internships, practical experience, or relevant project opportunities."
    );
}

nextSteps.push(
    `Practice interview questions related to ${jobRole}.`
);

// ===============================
// CAREER INSIGHT
// ===============================

let careerInsight = "";

if (score >= 80) {

    careerInsight =
        `Your resume is strongly aligned with the ${jobRole} role. ` +
        `Focus on strengthening your existing skills and adding measurable achievements.`;

} else if (score >= 60) {

    careerInsight =
        `Your resume has a good foundation for the ${jobRole} role. ` +
        `Improve your missing skills and add stronger project or experience details.`;

} else {

    careerInsight =
        `Your resume needs improvement for the ${jobRole} role. ` +
        `Focus on developing the recommended skills and building relevant projects.`;
}
// ===============================
// SKILL CATEGORY SCORES
// ===============================

// ===============================
// CALCULATE ROLE-BASED CATEGORY SCORES
// ===============================

const selectedCategorySkills =
    categorySkillsByRole[selectedRole] ||
    categorySkillsByRole["software engineer"];

const calculateCategoryScore = (categorySkills) => {

    const matched = categorySkills.filter(skill =>
        detectedSkills.includes(skill)
    );

    if (categorySkills.length === 0) {
        return 0;
    }

    return Math.round(
        (matched.length / categorySkills.length) * 100
    );
};

const dsaScore = calculateCategoryScore(
    selectedCategorySkills.dsa
);

const webScore = calculateCategoryScore(
    selectedCategorySkills.web
);

// ===============================
// COMMUNICATION SCORE
// ===============================

const communicationCategories = [
    [
        "teamwork",
        "team",
        "collaboration",
        "collaborated"
    ],

    [
        "leadership",
        "leader",
        "led",
        "managed"
    ],

    [
        "presentation",
        "presented",
        "public speaking"
    ],

    [
        "communication",
        "communicated",
        "client interaction",
        "client"
    ],

    [
        "coordinated",
        "coordination",
        "organized",
        "organization"
    ]
];

let communicationCategoriesMatched = 0;

communicationCategories.forEach(category => {

    const categoryMatched = category.some(keyword =>
        text.includes(keyword)
    );

    if (categoryMatched) {
        communicationCategoriesMatched++;
    }

});

const communicationScore =
    communicationCategoriesMatched * 20;


console.log(
    "Communication categories matched:",
    communicationCategoriesMatched
);

console.log(
    "Communication score:",
    communicationScore
);
        // Final analysis
        const analysis = {
            score: score,
            careerInsight:careerInsight,
            nextSteps:nextSteps,
            skillGap:skillGap,
            interviewQuestions:selectedInterviewQuestions,

            dsaScore:dsaScore,
            webScore:webScore,
            communicationScore:communicationScore,

            targetRole: jobRole,
            fileName: req.file.originalname,

            detectedSkills: detectedSkills,
            missingSkills:missingSkills,
            resumeLength: resumeText.length,

            strengths: [
                detectedSkills.length > 0
                    ? `Detected ${detectedSkills.length} relevant technical skills`
                    : "Resume contains technical information",

                text.includes("project")
                    ? "Project experience is mentioned"
                    : "Technical project experience can be added",

                text.includes("education")
                    ? "Education information is present"
                    : "Education section can be improved"
            ],

            improvements: [
                detectedSkills.length < 5
                    ? "Add more relevant technical skills"
                    : "Continue improving role-specific skills",

                !text.includes("experience")
                    ? "Add relevant internship or work experience"
                    : "Add measurable results to your experience",

                !text.includes("achievement")
                    ? "Add measurable achievements and results"
                    : "Make achievements more specific"
            ],

            recommendedSkills: recommendedSkills,
        };
        console.log("Detected skills:",detectedSkills);
        console.log("Missing skills:",missingSkills);
        console.log("Final score:",score);

        console.log("CareerAI analysis completed.");

        console.log("TEST SCORE:",dsaScore,webScore,communicationScore);
        
        // Send result to frontend
        console.log("SENDING TO FRONTEND:",analysis);
        res.json(analysis);

    } catch (error) {

        console.error("Resume analysis error:", error);

        res.status(500).json({
            error: "Could not analyze the resume."
        });
    }
});
// =========================================================
// AI MOCK INTERVIEW EVALUATION
// =========================================================

app.post("/api/mock-interview", async (req, res) => {

    try {

        const { question, answer, role } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                error: "Question and answer are required."
            });
        }

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            input: `
You are an expert technical interviewer.

Evaluate the candidate's answer for the following interview question.

Target Role:
${role}

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer based on:
1. Correctness
2. Technical understanding
3. Completeness
4. Clarity

Return ONLY valid JSON in this exact format:

{
    "score": 0,
    "feedback": "Short constructive feedback for the candidate."
}

The score must be between 0 and 100.
`
        });

        const result = JSON.parse(response.output_text);

        res.json(result);

    } catch (error) {

        console.error("Mock interview AI error:", error);

        res.status(500).json({
            error: "Could not evaluate the interview answer."
        });

    }

});
 
// Start server
app.listen(PORT, () => {
    console.log(`CareerAI backend running at http://localhost:${PORT}`);
});