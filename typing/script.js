document.addEventListener('DOMContentLoaded', function() {
    loadNewWordSet(); // Load the initial set of words right away
    document.getElementById('word-box').style.visibility = "visible"; // Make words visible initially
});

let timer = 60;
let isRunning = false;
let interval;
let correctWords = 0;
let incorrectWords = 0;
let currentSet = [];
let wordIndex = 0;

document.getElementById('input-box').addEventListener('input', function(event) {
    if (!isRunning && this.value !== "") {
        startTest();
    }
    // Real-time letter-by-letter checking
    if (this.value.slice(-1) === " ") {
        // When space is pressed, evaluate the word and reset for the next one
        checkWord();
        this.value = ''; // Clear input box immediately after space
    } else {
        // Continuous check as user types
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
        document.getElementById('results').textContent = `Time's up! Your WPM is ${correctWords}`;
        document.getElementById('input-box').disabled = true;
    }
}

function checkWord() {
    const inputBox = document.getElementById('input-box');
    const wordBox = document.getElementById('word-box');
    const words = wordBox.textContent.split(/\s+/);
    const currentInput = inputBox.value.trim();

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

    // Highlight the word if the current input does not match the beginning of the target word
    updateWordBox(words, !targetWord.startsWith(currentInput));
}

function loadNewWordSet() {
    currentSet = generateRandomWords(10);
    updateWordBox(currentSet, false);
    wordIndex = 0;
}

function generateRandomWords(count) {
    const wordPool = ["example", "random", "test", "words", "javascript", "challenge", "speed", "accuracy", "keyboard", "practice", "session", "improve", "skills", "typing", "text"];
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
