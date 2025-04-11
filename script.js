let score = 0;
let pointsPerClick = 1;
let username = localStorage.getItem('username') || "Gracz";
const scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
let autoClicker = 0;
let goldenClick = false;
let backgroundChanged = false;
let isCodeInputOpen = false;
let kodyClickCount = 0; // Counter for KODY button clicks
const winThreshold = 100000;

const upgrades = {
    1: { cost: 10, bonus: 1 },
    2: { cost: 1000, bonus: 15 },
    3: { cost: 100, auto: 1 },
    4: { cost: 2000, auto: 10 },
    5: { cost: 750, action: "changeBackground" },
    6: { cost: 1500, action: "enableNightMode", hidden: true },
    7: { cost: 1000, action: "enhancedVisuals" } // New upgrade for enhanced visuals
};

function increaseScore() {
    score += goldenClick ? pointsPerClick * 2 : pointsPerClick;
    updateUI();
    checkWin();
    saveGame();
}

function startGame() {
    document.getElementById("click-button").style.display = "inline-block";
    document.getElementById("shop-button").style.display = "inline-block";
    showNicknameMenu();
}

function showNicknameMenu() {
    // Show nickname input modal
    document.getElementById("username-input").value = username;
    toggleElement("username-modal", true);
    
    // Hide start menu
    document.getElementById("start-menu").style.display = "none";
}

function saveUsername() {
    const newUsername = document.getElementById("username-input").value.trim();
    if (newUsername) {
        username = newUsername;
        document.getElementById("username-display").textContent = username;
        toggleElement("username-modal", false);
        localStorage.setItem('username', username);
        
        // Show game UI after nickname is set
        document.getElementById("user-info").style.display = "flex";
        document.getElementById("counter").style.display = "block";
        document.getElementById("scoreboard-toggle-btn").style.display = "inline-block";
    }
}

function updateScoreboard() {
    const scoreboardList = document.getElementById("scoreboard");
    scoreboardList.innerHTML = '';
    
    // Add current player to scoreboard if not already there
    const playerIndex = scoreboard.findIndex(entry => entry.username === username);
    if (playerIndex === -1) {
        scoreboard.push({username, score});
    } else if (score > scoreboard[playerIndex].score) {
        scoreboard[playerIndex].score = score;
    }
    
    // Sort by score descending and take top 5
    const topScores = [...scoreboard].sort((a, b) => b.score - a.score).slice(0, 5);
    
    // Display scores
    topScores.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.username}: ${entry.score}`;
        scoreboardList.appendChild(li);
    });
    
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
}

let purchasedUpgrades = JSON.parse(localStorage.getItem('purchasedUpgrades')) || [];

function saveGame() {
    localStorage.setItem('gameState', JSON.stringify({
        score,
        pointsPerClick,
        autoClicker,
        goldenClick,
        backgroundChanged,
        username
    }));
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades));
    updateScoreboard();
}

function loadGame() {
    const saved = JSON.parse(localStorage.getItem('gameState'));
    purchasedUpgrades = JSON.parse(localStorage.getItem('purchasedUpgrades')) || [];
    
    if (saved) {
        score = saved.score || 0;
        pointsPerClick = saved.pointsPerClick || 1;
        autoClicker = saved.autoClicker || 0;
        goldenClick = saved.goldenClick || false;
        backgroundChanged = saved.backgroundChanged || false;
        username = saved.username || "Gracz";
        
        document.getElementById("username-display").textContent = username;
        updateUI();
        updateScoreboard();
    }
}

function buyUpgrade(upgradeId) {
    if (score >= upgrades[upgradeId].cost) {
        score -= upgrades[upgradeId].cost;
        
        if (upgrades[upgradeId].auto) {
            autoClicker += upgrades[upgradeId].auto;
        } else if (upgrades[upgradeId].bonus) {
            pointsPerClick += upgrades[upgradeId].bonus;
        } else if (upgrades[upgradeId].action) {
            handleSpecialUpgrade(upgrades[upgradeId].action, upgradeId);
        }
        
        upgrades[upgradeId].cost *= 2;
        updateUI();
        saveGame();
    }
}

function handleSpecialUpgrade(action, upgradeId) {
    if (action === "changeBackground") {
        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
        backgroundChanged = true;
        toggleElement("upgrade5-btn", false);
        toggleElement("upgrade6-btn", true);
    } else if (action === "enableNightMode") {
        document.body.style.transition = "background 0.5s ease, color 0.5s ease";
        document.body.style.textShadow = "0 0 10px white";
    } else if (action === "enhancedVisuals") {
        // New visual effects logic
        document.body.style.transition = "background 0.5s ease, color 0.5s ease";
        document.body.style.textShadow = "0 0 10px white";
        // Trigger particle effects
        triggerParticleEffects();
    }
}

function triggerParticleEffects() {
    // Logic for particle effects on button click
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    document.body.appendChild(particleContainer);
    // Add particle effect logic here
}

function toggleElement(id, show) {
    const element = document.getElementById(id);
    if (element) element.style.display = show ? "inline-block" : "none";
}

function updateUI() {
    document.getElementById("counter").innerText = score;
    document.getElementById("username-display").textContent = username;
    for (let i = 1; i <= 7; i++) {
        const btn = document.getElementById(`upgrade${i}-btn`);
        if (btn) {
            btn.style.backgroundColor = "";
            btn.style.color = "";
            
            if (upgrades[i].bonus) {
                btn.innerText = `Kup ulepszenie (+${upgrades[i].bonus} pkt/klik) - ${upgrades[i].cost} pkt`;
            } else if (upgrades[i].auto) {
                btn.innerText = `Kup ulepszenie (+${upgrades[i].auto} pkt/sec) - ${upgrades[i].cost} pkt`;
            } else if (upgrades[i].action) {
                // Special action upgrades
                let actionText = "";
                if (i === 5) actionText = "Zmiana tła na czarne";
                else if (i === 6) actionText = "Tryb nocny";
                else if (i === 7) actionText = "Efekty wizualne";
                btn.innerText = `${actionText} - ${upgrades[i].cost} pkt`;
            }
        }
    }
}

function checkWin() {
    if (score >= winThreshold) {
        toggleElement("shop", false);
        toggleElement("win-screen", true);
    }
}

function restartGame() {
    score = 0;
    pointsPerClick = 1;
    autoClicker = 0;
    goldenClick = false;
    backgroundChanged = false;
    purchasedUpgrades = [];

    // Reset upgrade costs
    for (let i = 1; i <= 7; i++) {
        if (upgrades[i].cost) {
            const baseCost = i === 1 ? 10 : 
                           i === 2 ? 1000 : 
                           i === 3 ? 100 : 
                           i === 4 ? 2000 : 
                           i === 5 ? 750 : 
                           i === 6 ? 1500 : 1000;
            upgrades[i].cost = baseCost;
        }
    }

    // Reset scoreboard for current player
    const playerIndex = scoreboard.findIndex(entry => entry.username === username);
    if (playerIndex !== -1) {
        scoreboard[playerIndex].score = 0;
    }

    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    document.body.style.textShadow = "";
    
    toggleElement("win-screen", false);
    toggleElement("shop", true);
    toggleElement("upgrade5-btn", true);
    toggleElement("upgrade6-btn", false);

    updateUI();
    saveGame();
    console.log("Zresetowano grę i wyniki w tabeli wyników");
}

function openShop() {
    toggleElement("shop", true);
}

function closeShop() {
    toggleElement("shop", false);
}

function openCodeInput() {
    toggleElement("code-input", true);
}

function closeCodeInput() {
    toggleElement("code-input", false);
}

function validateCode() {
    const code = document.getElementById("code").value;
    const button = document.getElementById("kody-button");
    
    if (code === "Military") {
        console.log("Valid code entered - closing inputs");
        toggleElement("word-input", true);
        toggleElement("code-input", false);
        isCodeInputOpen = false;
        button.disabled = true;
        console.log("Button disabled after valid code");
    } 
    else if (code === "debugWin") {
        console.log("DebugWin code entered - starting process");
        score = winThreshold;
        console.log("Score set to:", score);
        updateUI();
        
        console.log("Checking win-screen element:", document.getElementById("win-screen"));
        console.log("Current win-screen display:", document.getElementById("win-screen").style.display);
        
        toggleElement("shop", false);
        toggleElement("win-screen", true);
        toggleElement("code-input", false);
        isCodeInputOpen = false;
        
        console.log("After toggle - win-screen display:", document.getElementById("win-screen").style.display);
        console.log("Debug win fully processed");
    }
    else if (code === "EzWin") {
        console.log("EzWin code entered - adding 10000 points");
        score += 10000;
        updateUI();
        toggleElement("code-input", false);
        isCodeInputOpen = false;
        console.log("Added 10000 points, new score:", score);
    }
    else {
        alert("Nieprawidłowy kod!");
    }
    console.log(`Current state after validation - isCodeInputOpen: ${isCodeInputOpen}, button disabled: ${button.disabled}`);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playAudio() {
    const words = document.getElementById("words").value.trim().toLowerCase();
    if (!words) {
        console.log("No words entered.");
        return;
    }
    
    // Split by spaces and remove punctuation
    const wordArray = words.split(' ').map(word => word.replace(/[.,!?]/g, '').trim());
    const folders = ["military/military/military1", "military/military/military2", "military/military/military3"];
    
    for (let word of wordArray) {
        let found = false;
        for (let folder of folders) {
            const audioFilePath = `./secretcodes/${folder}/${word}.wav`;
            
            try {
                console.log(`Checking audio file: ${audioFilePath}`);
                const audio = new Audio(audioFilePath);
                
                // Check if audio can be played
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve);
                    audio.addEventListener('error', reject);
                });
                
                // Play the audio
                await audio.play();
                console.log("Audio is playing successfully from:", audioFilePath);
                found = true;
                await delay(audio.duration * 1000); // Wait for audio to finish
                break;
                
            } catch (error) {
                console.error(`Error with audio file ${audioFilePath}:`, error);
                continue; // Try next folder
            }
        }
        if (!found) {
            alert(`Plik dźwiękowy "${word}" nie istnieje w żadnym folderze!`);
        }
    }
}

function toggleScoreboard() {
    const scoreboardContainer = document.getElementById("scoreboard-container");
    const toggleButton = document.getElementById("scoreboard-toggle-btn");
    
    console.log("Toggling scoreboard. Current state:", scoreboardContainer.style.display);
    console.log("Toggle button found:", toggleButton);
    
    if (scoreboardContainer.style.display === "none") {
        scoreboardContainer.style.display = "block";
        toggleButton.textContent = "Ukryj tabelę wyników";
    } else {
        scoreboardContainer.style.display = "none";
        toggleButton.textContent = "Pokaż tabelę wyników";
    }
}

// Expose console commands
window.Scoreboard = function() {
    console.log("Showing scoreboard via console command");
    toggleScoreboard();
};

window.resetUpgrades = function() {
    purchasedUpgrades = [];
    for (let i = 1; i <= 7; i++) {
        if (upgrades[i].cost) {
            const baseCost = i === 1 ? 10 : 
                           i === 2 ? 1000 : 
                           i === 3 ? 100 : 
                           i === 4 ? 2000 : 
                           i === 5 ? 750 : 
                           i === 6 ? 1500 : 1000;
            upgrades[i].cost = baseCost;
        }
    }
    updateUI();
    saveGame();
    console.log("Zresetowano wszystkie zakupione ulepszenia");
};

// Load saved game on startup
window.addEventListener('DOMContentLoaded', () => {
    loadGame();
});

// Save game when page is closing
window.addEventListener('beforeunload', () => {
    saveGame();
});

setInterval(() => {
    score += autoClicker;
    updateUI();
    checkWin();
    saveGame();
}, 1000);
