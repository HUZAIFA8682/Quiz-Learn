document.addEventListener("DOMContentLoaded", () => {

    /* ================= QUESTIONS ================= */

    const questions = [
        {
            question: "Capital of France?",
            answers: ["Berlin", "Paris", "Rome", "Madrid"],
            correct: 1,
            category: "General",
            difficulty: "easy"
        },
        {
            question: "Language used in browser?",
            answers: ["Python", "Java", "C++", "JavaScript"],
            correct: 3,
            category: "Programming",
            difficulty: "medium"
        },
        {
            question: "12 × 12 = ?",
            answers: ["124", "144", "132", "142"],
            correct: 1,
            category: "Math",
            difficulty: "hard"
        }
    ];

    const difficultyTime = { easy: 20, medium: 15, hard: 10 };
    const MAX_ATTEMPTS = 3;

    /* ================= ELEMENTS ================= */

    const screens = document.querySelectorAll(".screen");
    const startScreen = document.getElementById("start-screen");
    const quizScreen = document.getElementById("quiz-screen");
    const resultScreen = document.getElementById("result-screen");
    const leaderboardScreen = document.getElementById("leaderboard-screen");

    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const restartBtn = document.getElementById("restartBtn");

    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const scoreEl = document.getElementById("score");
    const timerEl = document.getElementById("timer");
    const progressBar = document.getElementById("progressBar");

    const highScoreEl = document.getElementById("highScore");
    const attemptsLeftEl = document.getElementById("attemptsLeft");
    const categorySelect = document.getElementById("categorySelect");
    const playerNameInput = document.getElementById("playerName");

    const themeToggle = document.getElementById("themeToggle");
    const viewLeaderboard = document.getElementById("viewLeaderboard");
    const leaderboardList = document.getElementById("leaderboardList");

    /* ================= STATE ================= */

    let attemptsUsed = parseInt(localStorage.getItem("attemptsUsed")) || 0;
    let highScore = parseInt(localStorage.getItem("highScore")) || 0;

    highScoreEl.innerText = highScore;
    attemptsLeftEl.innerText = MAX_ATTEMPTS - attemptsUsed;

    let filteredQuestions = [];
    let currentQuestion = 0;
    let score = 0;
    let timeLeft = 0;
    let timerInterval;

    /* ================= UTIL ================= */

    function switchScreen(target) {
        screens.forEach(s => s.classList.remove("active"));
        target.classList.add("active");
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /* ================= QUIZ LOGIC ================= */

    function startQuiz() {

        if (attemptsUsed >= MAX_ATTEMPTS) {
            alert("Attempt limit reached!");
            return;
        }

        if (!playerNameInput.value.trim()) {
            alert("Enter your name first!");
            return;
        }

        attemptsUsed++;
        localStorage.setItem("attemptsUsed", attemptsUsed);
        attemptsLeftEl.innerText = MAX_ATTEMPTS - attemptsUsed;

        filteredQuestions = questions.filter(q =>
            categorySelect.value === "All" || q.category === categorySelect.value
        );

        shuffle(filteredQuestions);

        currentQuestion = 0;
        score = 0;

        switchScreen(quizScreen);
        showQuestion();
    }

    function showQuestion() {

        const q = filteredQuestions[currentQuestion];

        questionEl.innerText =
            `Question ${currentQuestion + 1}/${filteredQuestions.length}\n\n${q.question}`;

        answersEl.innerHTML = "";
        nextBtn.disabled = true;

        progressBar.style.width =
            (currentQuestion / filteredQuestions.length) * 100 + "%";

        timeLeft = difficultyTime[q.difficulty];
        timerEl.innerText = timeLeft;
        timerEl.classList.remove("timer-warning");

        startTimer();

        q.answers.forEach((ans, i) => {
            const btn = document.createElement("div");
            btn.classList.add("answer-btn");
            btn.innerText = ans;
            btn.onclick = () => selectAnswer(btn, i);
            answersEl.appendChild(btn);
        });
    }

    function selectAnswer(btn, index) {

        clearInterval(timerInterval);

        const correctIndex = filteredQuestions[currentQuestion].correct;

        document.querySelectorAll(".answer-btn")
            .forEach(b => b.style.pointerEvents = "none");

        if (index === correctIndex) {
            btn.classList.add("correct");
            score++;
        } else {
            btn.classList.add("wrong");
            answersEl.children[correctIndex].classList.add("correct");
        }

        nextBtn.disabled = false;
    }

    function nextQuestion() {
        currentQuestion++;
        if (currentQuestion < filteredQuestions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }

    function showResult() {

        switchScreen(resultScreen);

        const percentage =
            Math.round((score / filteredQuestions.length) * 100);

        let grade =
            percentage >= 90 ? "A" :
            percentage >= 75 ? "B" :
            percentage >= 60 ? "C" :
            percentage >= 50 ? "D" : "F";

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        scoreEl.innerHTML =
            `Player: ${playerNameInput.value}<br>
             Score: ${score}/${filteredQuestions.length}<br>
             Percentage: ${percentage}%<br>
             Grade: ${grade}`;

        updateLeaderboard(playerNameInput.value, score, percentage);
    }

    function updateLeaderboard(name, score, percentage) {

        let leaderboard =
            JSON.parse(localStorage.getItem("leaderboard")) || [];

        leaderboard.push({
            name,
            score,
            percentage,
            date: new Date().toLocaleString()
        });

        leaderboard.sort((a, b) => b.percentage - a.percentage);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem("leaderboard",
            JSON.stringify(leaderboard));
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.innerText = timeLeft;

            if (timeLeft <= 5)
                timerEl.classList.add("timer-warning");

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                nextQuestion();
            }
        }, 1000);
    }

    /* ================= EVENTS ================= */

    startBtn.onclick = startQuiz;
    nextBtn.onclick = nextQuestion;
    restartBtn.onclick = () => location.reload();

    themeToggle.onclick = () =>
        document.body.classList.toggle("light-mode");

    viewLeaderboard.onclick = () => {

        switchScreen(leaderboardScreen);

        const data =
            JSON.parse(localStorage.getItem("leaderboard")) || [];

        leaderboardList.innerHTML = data.map((item, i) =>
            `<p><strong>#${i+1} ${item.name}</strong><br>
             ${item.score} pts | ${item.percentage}%<br>
             <small>${item.date}</small></p>`
        ).join("");

        renderChart(data);
    };

    function renderChart(data) {

        const ctx = document.getElementById("statsChart");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: "Percentage",
                    data: data.map(d => d.percentage),
                    backgroundColor: "#22c55e"
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

});
