document.addEventListener('DOMContentLoaded', function() {
    loadNewWordSet();
    document.getElementById('word-box').style.visibility = "visible";
    displayLeaderboard(); // Display leaderboard on load
});

let timer = 60;
let isRunning = false;
let interval;
let correctWords = 0;
let incorrectWords = 0;
let currentSet = [];
let wordIndex = 0;
let totalCharactersTyped = 0; // New variable to track typed characters

document.getElementById('input-box').addEventListener('input', function(event) {
    if (!isRunning && this.value !== "") {
        startTest();
    }
    if (this.value.slice(-1) === " ") {
        checkWord();
        this.value = '';
    } else {
        validateCurrentInput(this.value);
    }
    updateLiveWPM(); // Real-time WPM update
});

function startTest() {
    isRunning = true;
    interval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (timer > 0) {
        timer--;
        document.getElementById('timer').textContent = timer;
    } else {
        clearInterval(interval);
        let finalWPM = calculateWPM(); // Correct WPM calculation
        document.getElementById('results').textContent = `Time's up! Your WPM is ${finalWPM}`;
        document.getElementById('input-box').disabled = true;
        document.getElementById('retry-button').style.display = "inline-block"; // Show retry button
        checkHighScore(finalWPM);
    }
}

function checkWord() {
    const inputBox = document.getElementById('input-box');
    const wordBox = document.getElementById('word-box');
    const words = wordBox.textContent.split(/\s+/);
    const currentInput = inputBox.value.trim();

    totalCharactersTyped += currentInput.length + 1; // Track total characters (including space)

    if (currentInput === words[wordIndex]) {
        correctWords++;
        document.getElementById('correct-count').textContent = correctWords;
    } else {
        incorrectWords++;
        document.getElementById('incorrect-count').textContent = incorrectWords;
    }
    wordIndex++;
    if (wordIndex >= words.length) {
        loadNewWordSet();
    } else {
        updateWordBox(words, false);
    }
}

function validateCurrentInput(currentInput) {
    const wordBox = document.getElementById('word-box');
    const words = wordBox.textContent.split(/\s+/);
    const targetWord = words[wordIndex];
    updateWordBox(words, !targetWord.startsWith(currentInput));
}

function loadNewWordSet() {
    currentSet = generateRandomWords(10);
    updateWordBox(currentSet, false);
    wordIndex = 0;
}

function generateRandomWords(count) {
    const wordPool = [
        "apple", "banana", "orange", "grape", "water", "happy", "love", "friend", "sun", "moon",
        "light", "dark", "strong", "weak", "fast", "slow", "run", "walk", "jump", "play",
        "book", "story", "paper", "pen", "pencil", "chair", "table", "window", "door", "school",
        "teacher", "student", "learn", "read", "write", "think", "listen", "watch", "smile", "laugh",
        "kind", "brave", "help", "share", "talk", "sing", "dance", "music", "color", "number",
        "first", "second", "third", "big", "small", "hot", "cold", "summer", "winter", "spring",
        "autumn", "morning", "night", "yesterday", "today", "tomorrow", "happy", "sad", "angry", "excited",
        "hungry", "tired", "sleep", "dream", "hope", "believe", "trust", "truth", "false", "right",
        "wrong", "inside", "outside", "above", "below", "front", "behind", "near", "far", "between",
        "before", "after", "start", "finish", "early", "late", "open", "close", "push", "pull"
    ];
    let words = [];
    for (let i = 0; i < count; i++) {
        words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }
    return words;
}

function updateWordBox(words, isError) {
    const markedWords = words.map((word, index) => {
        if (index === wordIndex) {
            return `<span class="current-word ${isError ? 'incorrect' : ''}">${word}</span>`;
        }
        return `<span>${word}</span>`;
    });
    document.getElementById('word-box').innerHTML = markedWords.join(" ");
}

/* ---------- LEADERBOARD FUNCTIONS ---------- */

function checkHighScore(score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (leaderboard.length < 3) {
        // If there are less than 3 scores, always ask for the name
        let userName = prompt("🎉 You made it to the leaderboard! Enter your name:");
        if (userName) {
            leaderboard.push({ name: userName, score: score });
        }
    } else {
        let lowestScoreIndex = leaderboard.length - 1;
        let lowestScore = leaderboard[lowestScoreIndex].score;

        if (score > lowestScore) {
            let userName = prompt("🎉 You beat the lowest high score! Enter your name:");
            if (userName) {
                leaderboard[lowestScoreIndex] = { name: userName, score: score }; // Replace lowest score
                leaderboard.sort((a, b) => b.score - a.score); // Sort leaderboard
            }
        }
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}


function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = "<h2>Leaderboard</h2>";
    leaderboard.forEach((entry, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score} WPM</p>`;
    });
}

/* ---------- WPM CALCULATION (10 Fast Fingers Logic) ---------- */

function calculateWPM() {
    let timeSpent = 60 - timer; // Time elapsed
    if (timeSpent === 0) timeSpent = 1; // Avoid division by zero
    let wpm = (totalCharactersTyped / 5) * (60 / timeSpent); // Normalize to 60s
    return Math.round(wpm);
}

/* ---------- REAL-TIME WPM UPDATE ---------- */

function updateLiveWPM() {
    let liveWPM = calculateWPM();
    document.getElementById('results').textContent = `Current WPM: ${liveWPM}`;
}

/* ---------- RETRY FUNCTION ---------- */

function restartTest() {
    // Reset variables
    timer = 60;
    isRunning = false;
    correctWords = 0;
    incorrectWords = 0;
    wordIndex = 0;
    totalCharactersTyped = 0; // Reset character count

    // Reset UI elements
    document.getElementById('timer').textContent = timer;
    document.getElementById('results').textContent = "";
    document.getElementById('correct-count').textContent = 0;
    document.getElementById('incorrect-count').textContent = 0;
    document.getElementById('input-box').value = "";
    document.getElementById('input-box').disabled = false;
    document.getElementById('retry-button').style.display = "none"; // Hide retry button

    // Load new words
    loadNewWordSet();
}

