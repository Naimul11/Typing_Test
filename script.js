document.addEventListener('DOMContentLoaded', function () {
    loadNewWordSet();
    document.getElementById('word-box').style.visibility = "visible";
    displayLeaderboard();
    document.getElementById('toggle-leaderboard').addEventListener('click', toggleLeaderboard);
});

let timer = 60;
let isRunning = false;
let interval;
let correctWords = 0;
let incorrectWords = 0;
let totalCharactersTyped = 0; // Track total characters typed
let wordIndex = 0;

document.getElementById('input-box').addEventListener('input', function (event) {
    if (this.value === " ") {
        this.value = "";
        return;
    }
    if (!isRunning && this.value.trim() !== "") {
        startTest();
    }
    if (this.value.trim() !== "" && this.value.slice(-1) === " ") {
        checkWord();
        this.value = '';
    } else {
        validateCurrentInput(this.value);
    }
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
        document.getElementById('input-box').disabled = true; // Disable input box after time ends
        showResults(); // Show results as a paragraph
    }
}

function checkWord() {
    const words = document.getElementById('word-box').textContent.split(/\s+/);
    const currentInput = document.getElementById('input-box').value.trim();

    if (currentInput === words[wordIndex]) {
        totalCharactersTyped += currentInput.length + 1;
        correctWords++;
        document.getElementById('correct-count').textContent = correctWords;
    } else {
        const currentWord = words[wordIndex];

    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
        if (currentInput[i] === currentWord[i]) {
            correctChars++;
        }
    }

    totalCharactersTyped += correctChars;
        
        if (incorrectWords > 20) {
            clearInterval(interval);
            document.getElementById('input-box').disabled = true; // Disable input box
            alert("Too many mistakes! Please retry.");
            document.getElementById('result-text').textContent = "Your WPM is NaN";
            document.getElementById('result-text').style.display = "block";
            return;
        }
        
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
    const words = document.getElementById('word-box').textContent.split(/\s+/);
    updateWordBox(words, !words[wordIndex].startsWith(currentInput));
}

function loadNewWordSet() {
    currentSet = generateRandomWords(8);
    updateWordBox(currentSet, false);
    wordIndex = 0;
}


function generateRandomWords(count) {
    const wordPool = [
        // Short words (4-5 characters)
        "apple", "grape", "happy", "light", "music", "ocean", "water", "cloud", "phone", "mouse",
        "train", "green", "black", "white", "river", "chair", "table", "story", "paper", "money",
        "brick", "glass", "plant", "shirt", "sound", "spoon", "bread", "grill", "skirt", "jelly",
        "piano", "world", "space", "field", "grass", "tiger", "horse", "zebra", "beach", "storm",
        "flame", "smoke", "sugar", "lemon", "melon", "grape", "chess", "block", "angle", "frame",
        "honey", "snack", "fruit", "juice", "swing", "pride", "cliff", "daisy", "toast", "fence",
        "spade", "pearl", "scent", "lunar", "novel", "wagon", "charm", "carol", "dough", "swirl",
        "frost", "crown", "badge", "spark", "flute", "chill", "coast", "straw", "blaze", "glove",
        "brave", "serum", "candy", "hazel", "slate", "maple", "petal", "cocoa", "ivory", "trend",
        "marsh", "slope", "coral", "quest", "drift", "brisk", "pouch", "scarf", "gloom", "latch"
    ];

    return Array.from({ length: count }, () => wordPool[Math.floor(Math.random() * wordPool.length)]);
}



function updateWordBox(words, isError) {
    document.getElementById('word-box').innerHTML = words.map((word, index) =>
        `<span class="${index === wordIndex ? (isError ? 'current-word incorrect' : 'current-word') : ''}">${word}</span>`
    ).join(" ");
}

// **Updated WPM Calculation (10FastFingers Style)**
function calculateWPM() {
    return Math.round((totalCharactersTyped / 5) / (60 / 60)); // (Characters / 5) ÷ (Seconds / 60)
}

function showResults() {
    let finalWPM = calculateWPM();
    document.getElementById('result-text').textContent = `Your WPM is ${finalWPM}`;
    document.getElementById('result-text').style.display = "block";

    checkHighScore(finalWPM);
}

// **Leaderboard Logic**
function checkHighScore(score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (leaderboard.length < 3 || score > leaderboard[leaderboard.length - 1].score) {
        let userName = prompt("🎉 You made it to the leaderboard! Enter your name:");
        
        if (userName) {
            let incorrectWords = document.getElementById('incorrect-count').textContent;

            leaderboard.push({ name: userName, score: score });
            leaderboard.sort((a, b) => b.score - a.score);
            
            if (leaderboard.length > 3) leaderboard.pop();
            
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            displayLeaderboard();

            fetch("https://script.google.com/macros/s/AKfycbyfDYqdSgoQrcWvK8V8i1nZpiMrytSme4GlXCKrBB1DrQA7JeCPAwnl8hnFu5do2-2dbw/exec", {
                method: "POST",
                mode: "no-cors",  
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: userName, wpm: score, incorrect: incorrectWords })
            })
            .then(response => console.log("Data sent successfully"))
            .catch(error => console.error("Fetch Error:", error));            
            
        }
    }
}


function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    document.getElementById('leaderboard').innerHTML = "<h2>Leaderboard</h2>" +
        leaderboard.map((entry, index) => `<p>${index + 1}. ${entry.name} - ${entry.score} WPM</p>`).join("");
}

function restartTest() {
    clearInterval(interval);
    document.getElementById('input-box').value = "";
    document.getElementById('input-box').disabled = false;
    document.getElementById('timer').textContent = "60";
    correctWords = 0;
    timer = 60;
    incorrectWords = 0;
    totalCharactersTyped = 0; // Reset character count
    wordIndex = 0;
    document.getElementById('correct-count').textContent = "0";
    document.getElementById('incorrect-count').textContent = "0";
    document.getElementById('result-text').style.display = "none"; // Hide the result text when retrying
    loadNewWordSet();
    isRunning = false;
}

function toggleLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const toggleButton = document.getElementById('toggle-leaderboard');

    if (leaderboardContainer.style.right === "10px") {
        leaderboardContainer.style.right = "-300px";
        toggleButton.style.right = "-30px";
    } else {
        leaderboardContainer.style.right = "10px";
        toggleButton.style.right = "270px";
    }
}

document.getElementById('reset-leaderboard').addEventListener('click', function () {
    let password = prompt('Enter the reset password:');
    if (password === 'naimulislam1') {
        localStorage.removeItem('leaderboard');
        alert('Leaderboard has been reset!');
        displayLeaderboard();
    } else {
        alert('Incorrect password!');
    }
});


