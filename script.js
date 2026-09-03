// ===============================
// CAREERAI - BASIC INTERACTIONS
// ===============================

const analyzeButton = document.querySelector(".primary-btn");
const interviewButton = document.querySelector(".secondary-btn");
const getStartedButton = document.querySelector(".login-btn");

// Analyze Resume button in Hero
analyzeButton.addEventListener("click", function () {
    document.querySelector("#resume-analyzer").scrollIntoView({
        behavior: "smooth"
    });
});
interviewButton.addEventListener("click", function () {
    document.querySelector("#mock-interview").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Get Started button
getStartedButton.addEventListener("click", function () {
    document.querySelector("#features").scrollIntoView({
        behavior: "smooth"
    });
});


// ===============================
// RESUME UPLOAD
// ===============================

const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");

resumeFile.addEventListener("change", function () {

    if (resumeFile.files.length > 0) {

        const selectedFile = resumeFile.files[0];

        fileName.textContent = "Selected: " + selectedFile.name;

    } else {

        fileName.textContent = "";

    }

});


// ===============================
// RESUME ANALYSIS
// ===============================

const analyzeResumeButton = document.getElementById("analyzeResume");
const analysisResult = document.getElementById("analysisResult");

const resumeScore = document.getElementById("resumeScore");
const careerInsight=document.getElementById("careerInsight");
const nextSteps=document.getElementById("nextSteps");

const skillsHave=document.getElementById("skillsHave");
const skillsNeed=document.getElementById("skillsNeed");
const prioritySkills=document.getElementById("prioritySkills");
const interviewQuestions=document.getElementById("interviewQuestions");
const interviewReadiness = document.getElementById("interviewReadiness");
const interviewProgress = document.getElementById("interviewProgress");
const strengths = document.getElementById("strengths");
const improvements = document.getElementById("improvements");
const skills = document.getElementById("skills");

const detectedSkills = document.getElementById("detectedSkills");
const missingSkills = document.getElementById("missingSkills");

const dsaScore=document.getElementById("dsaScore");
const webScore=document.getElementById("webScore");
const communicationScore=document.getElementById("communicationScore");

analyzeResumeButton.addEventListener("click", function () {

    const jobRole = document.getElementById("jobRole").value.trim();

    // Check resume
    if (resumeFile.files.length === 0) {
        alert("Please upload your resume first.");
        return;
    }

    // Check job role
    if (jobRole === "") {
        alert("Please enter your target job role.");
        return;
    }


    // ===============================
    // SEND RESUME TO BACKEND
    // ===============================

    const formData = new FormData();

    formData.append("resume", resumeFile.files[0]);
    formData.append("jobRole", jobRole);

    fetch("http://localhost:5000/api/career", {
        method: "POST",
        body: formData
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Server returned an error.");
        }

        return response.json();

    })

    .then(data => {
        
        console.log("Backend response:", data);

        console.log("DSA:",data.dsaScore);
        console.log("WEB:",data.webScore);
        console.log("COMMUNICATION:",data.communicationScore);

        // ===============================
        // DISPLAY SCORE
        // ===============================

        resumeScore.textContent = data.score;

        document.getElementById("careerScore").textContent = data.score + "%";

        careerInsight.textContent=data.careerInsight;

        nextSteps.innerHTML = "";

        data.nextSteps.forEach(step => {
        const li = document.createElement("li");
          li.textContent = step;
          nextSteps.appendChild(li);
        });

        skillsHave.innerHTML = "";
        skillsNeed.innerHTML = "";
        prioritySkills.innerHTML = "";

        data.skillGap.have.forEach(skill => {
          const li = document.createElement("li");
          li.textContent = skill;
          skillsHave.appendChild(li);
        });

        data.skillGap.need.forEach(skill => {
          const li = document.createElement("li");
          li.textContent = skill;
          skillsNeed.appendChild(li);
        });

        data.skillGap.priority.forEach(skill => {
          const li = document.createElement("li");
          li.textContent = skill;
          prioritySkills.appendChild(li);
        });

        interviewQuestions.innerHTML = "";

        let answeredQuestions = 0;

        data.interviewQuestions.forEach(item => {

          const li = document.createElement("li");

          const question = document.createElement("p");
          question.textContent = item.question;

          const answer = document.createElement("p");
          answer.textContent = item.answer;
          answer.style.display = "none";

          const button = document.createElement("button");
          button.textContent = "Show Answer";

          button.addEventListener("click", () => {

            if (answer.style.display === "none") {
                answer.style.display = "block";
                button.textContent = "Hide Answer";

                answeredQuestions++;

                const readiness =
                  Math.round(
                    (answeredQuestions / data.interviewQuestions.length) * 100
                  );

                interviewReadiness.textContent = readiness + "%";
                interviewProgress.style.width = readiness + "%";
            } else {
                answer.style.display = "none";
                button.textContent = "Show Answer";
            }

        });

        li.appendChild(question);
        li.appendChild(button);
        li.appendChild(answer);

        interviewQuestions.appendChild(li);
     });

        console.log("Category score:",data.dsaScore,data.webScore,data.communicationScore);

        dsaScore.textContent=data.dsaScore+"%";
        webScore.textContent=data.webScore+"%";
        communicationScore.textContent=data.communicationScore +"%";

        document.getElementById("dsaProgress").style.width=data.dsaScore+"%";
        document.getElementById("webProgress").style.width=data.webScore+"%";
        document.getElementById("communicationProgress").style.width=data.communicationScore+"%";
        // ===============================
        // DISPLAY STRENGTHS
        // ===============================

        strengths.innerHTML = "";

        data.strengths.forEach(item => {

            const li = document.createElement("li");

            li.textContent = item;

            strengths.appendChild(li);

        });


        // ===============================
        // DISPLAY IMPROVEMENTS
        // ===============================

        improvements.innerHTML = "";

        data.improvements.forEach(item => {

            const li = document.createElement("li");

            li.textContent = item;

            improvements.appendChild(li);

        });


        // ===============================
        // DISPLAY DETECTED SKILLS
        // ===============================

        detectedSkills.innerHTML = "";

        if (data.detectedSkills.length > 0) {

            data.detectedSkills.forEach(skill => {

                const li = document.createElement("li");

                li.textContent = skill;

                detectedSkills.appendChild(li);

            });

        } else {

            detectedSkills.innerHTML = "<li>No matching skills detected.</li>";

        }


        // ===============================
        // DISPLAY MISSING SKILLS
        // ===============================

        missingSkills.innerHTML = "";

        if (data.missingSkills.length > 0) {

            data.missingSkills.forEach(skill => {

                const li = document.createElement("li");

                li.textContent = skill;

                missingSkills.appendChild(li);

            });

        } else {

            missingSkills.innerHTML = "<li>No major missing skills detected.</li>";

        }


        // ===============================
        // DISPLAY RECOMMENDED SKILLS
        // ===============================

        skills.innerHTML = "";

        if (data.recommendedSkills.length > 0) {

            data.recommendedSkills.forEach(skill => {

                const li = document.createElement("li");

                li.textContent = skill;

                skills.appendChild(li);

            });

        } else {

            skills.innerHTML = "<li>Your skill set matches the selected role well.</li>";

        }


        // ===============================
        // SHOW RESULT
        // ===============================

        analysisResult.style.display = "block";

        analysisResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    })

    .catch(error => {

        console.error("Backend connection error:", error);

        alert("Could not analyze the resume. Please make sure the CareerAI backend is running.");

    });

});
// =========================================================
// AI MOCK INTERVIEW
// =========================================================

const mockRole = document.getElementById("mockRole");
const interviewType = document.getElementById("interviewType");

const startInterview = document.getElementById("startInterview");
const interviewSetup = document.getElementById("interviewSetup");

const mockQuestionArea = document.getElementById("mockQuestionArea");
const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");

const interviewAnswer = document.getElementById("interviewAnswer");
const submitAnswer = document.getElementById("submitAnswer");

const interviewFeedback = document.getElementById("interviewFeedback");
const answerScore = document.getElementById("answerScore");
const feedbackText = document.getElementById("feedbackText");

const nextQuestion = document.getElementById("nextQuestion");


// =========================================================
// INTERVIEW QUESTIONS
// =========================================================

const mockInterviewQuestions = {

    "software engineer": [
        "Explain the difference between an array and a linked list.",
        "What is the time complexity of binary search?",
        "What is object-oriented programming?",
        "What is the purpose of Git?",
        "Explain the difference between SQL and NoSQL."
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
        "What is the difference between supervised and unsupervised learning?",
        "What is overfitting and how can you prevent it?",
        "What is the difference between classification and regression?",
        "Why is feature scaling important?",
        "How would you handle missing data?"
    ],

    "machine learning engineer": [
        "What is the difference between supervised and unsupervised learning?",
        "Explain overfitting and underfitting.",
        "What is feature engineering?",
        "How would you evaluate a machine learning model?",
        "What is the difference between TensorFlow and scikit-learn?"
    ]

};


// =========================================================
// INTERVIEW STATE
// =========================================================

let currentQuestion = 0;
let currentQuestions = [];
let mockInterviewScores=[];


// =========================================================
// START INTERVIEW
// =========================================================

startInterview.addEventListener("click", function () {

    const selectedRole = mockRole.value;

    currentQuestions =
        mockInterviewQuestions[selectedRole];

    currentQuestion = 0;
    mockInterviewScores=[];

    interviewSetup.style.display = "none";

    mockQuestionArea.style.display = "block";

    showMockQuestion();

    mockQuestionArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


// =========================================================
// SHOW QUESTION
// =========================================================

function showMockQuestion() {

    const question = currentQuestions[currentQuestion];

    questionText.textContent = question;

    questionNumber.textContent =
        `Question ${currentQuestion + 1}/${currentQuestions.length}`;

    interviewAnswer.value = "";

    interviewFeedback.style.display = "none";

    submitAnswer.style.display = "inline-block";

    interviewAnswer.disabled = false;

}


// =========================================================
// SUBMIT ANSWER - LOCAL EVALUATION
// =========================================================

submitAnswer.addEventListener("click", function () {

    const answer = interviewAnswer.value.trim();

    if (answer === "") {
        alert("Please write your answer first.");
        return;
    }

    const question = currentQuestions[currentQuestion].toLowerCase();
    const answerText = answer.toLowerCase();

    let score = 40;
    let feedback = "";

    // ---------------------------------
    // KEYWORD-BASED EVALUATION
    // ---------------------------------

    const questionKeywords = {

        "array": [
            "array",
            "memory",
            "index",
            "contiguous",
            "access"
        ],

        "linked list": [
            "linked list",
            "node",
            "pointer",
            "memory",
            "insertion",
            "deletion"
        ],

        "binary search": [
            "binary search",
            "log",
            "o(log n)",
            "sorted",
            "half"
        ],

        "object-oriented": [
            "class",
            "object",
            "encapsulation",
            "inheritance",
            "polymorphism",
            "abstraction"
        ],

        "git": [
            "version control",
            "repository",
            "commit",
            "branch",
            "code",
            "changes"
        ],

        "sql": [
            "database",
            "table",
            "sql",
            "schema",
            "query"
        ],

        "rest api": [
            "api",
            "http",
            "request",
            "response",
            "get",
            "post"
        ],

        "html": [
            "html",
            "structure",
            "element",
            "semantic"
        ],

        "css": [
            "css",
            "style",
            "box model",
            "margin",
            "padding"
        ],

        "javascript": [
            "javascript",
            "variable",
            "let",
            "const",
            "var"
        ],

        "react": [
            "react",
            "component",
            "props",
            "state",
            "jsx"
        ],

        "machine learning": [
            "machine learning",
            "model",
            "data",
            "training",
            "prediction"
        ],

        "overfitting": [
            "overfitting",
            "training",
            "testing",
            "regularization",
            "cross-validation"
        ]

    };


    // Find relevant keywords

    let keywords = [];

    for (const key in questionKeywords) {

        if (question.includes(key)) {

            keywords = questionKeywords[key];

            break;

        }

    }


    // Count matching keywords

    let matchedKeywords = 0;

    keywords.forEach(keyword => {

        if (answerText.includes(keyword)) {
            matchedKeywords++;
        }

    });


    // ---------------------------------
    // CALCULATE SCORE
    // ---------------------------------

    if (matchedKeywords >= 4) {

        score = 90;

        feedback =
            "Excellent answer. You covered several important technical concepts and demonstrated a strong understanding of the topic.";

    }

    else if (matchedKeywords >= 3) {

        score = 80;

        feedback =
            "Good answer. You covered the main concept correctly. Adding a practical example would make your answer stronger.";

    }

    else if (matchedKeywords >= 2) {

        score = 70;

        feedback =
            "Good attempt. You understand part of the concept, but your explanation could include more technical details.";

    }

    else if (answer.split(/\s+/).length >= 15) {

        score = 60;

        feedback =
            "Your answer has some explanation, but it needs more relevant technical details and terminology.";

    }

    else {

        score = 45;

        feedback =
            "Your answer is too brief. Try explaining the concept step by step and include an example.";

    }


    // ---------------------------------
    // DISPLAY RESULT
    // ---------------------------------

    answerScore.textContent = score;

    mockInterviewScores.push(score);

    feedbackText.textContent = feedback;

    interviewFeedback.style.display = "block";

    submitAnswer.style.display = "none";

    interviewAnswer.disabled = true;

});
// =========================================================
// NEXT QUESTION
// =========================================================

nextQuestion.addEventListener("click", function () {

    // START AGAIN
    if (nextQuestion.textContent === "Start Again") {

        currentQuestion = 0;
        interviewScores = [];

        interviewAnswer.style.display = "block";
        interviewAnswer.disabled=false;
        interviewAnswer.value="";
        
        submitAnswer.style.display="inline-block";
        
        nextQuestion.textContent = "Next Question";

        showMockQuestion();

        return;
    }


    // NEXT QUESTION
    currentQuestion++;

    if (currentQuestion < currentQuestions.length) {

        showMockQuestion();

    } else {

        // =====================================
        // INTERVIEW COMPLETED
        // =====================================

        const totalScore = mockInterviewScores.reduce(
            (sum, score) => sum + score,
            0
        );

        const overallScore = Math.round(
            totalScore / mockInterviewScores.length
        );

        questionText.textContent =
            "Interview Completed!";

        questionNumber.textContent =
            `${currentQuestions.length}/${currentQuestions.length} Questions Completed`;

        interviewAnswer.style.display = "none";

        submitAnswer.style.display = "none";

        answerScore.textContent =
            overallScore;

        interviewReadiness.textContent = overallScore + "%";
        interviewProgress.style.width = overallScore + "%";    

        let performance = "";

        if (overallScore >= 85) {

            performance = "Excellent performance .You demonstrated strong understanding across the interview.";

        } else if (overallScore >= 70) {

            performance = "Strong performance .Keep on practicing and add more technical depth to your answers.";

        } else if (overallScore >= 55) {

            performance = "Good attempt .Focus on explaining conceps clearly and supporting your answers with examples.";

        } else {

            performance = "Your interview need improvement and more practice .Review the concepts and work on giving clearer,more complete answers.";

        }

        feedbackText.innerHTML =
            `
            <strong>Overall Performance: ${performance}</strong><br><br>

            You completed all ${currentQuestions.length}
            interview questions.<br><br>

            <strong>Final Score: ${overallScore}/100</strong><br><br>

            Keep practicing technical explanations,
            improve your answer structure, and include
            practical examples whenever possible.
            `;

        interviewFeedback.style.display = "block";

        nextQuestion.textContent = "Start Again";

    }

});