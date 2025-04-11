let score = 0;
let pointsPerClick = 1;
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
    for (let i = 1; i <= 7; i++) { // Updated to include new upgrade
        const btn = document.getElementById(`upgrade${i}-btn`);
        if (btn && (upgrades[i].bonus || upgrades[i].auto)) {
            btn.innerText = `Kup ulepszenie (+${upgrades[i].bonus || upgrades[i].auto} ${upgrades[i].bonus ? "pkt/klik" : "pkt/sec"}) - ${upgrades[i].cost} pkt`;
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

    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    document.body.style.textShadow = "";
    
    toggleElement("win-screen", false);
    toggleElement("shop", true);
    toggleElement("upgrade5-btn", true);
    toggleElement("upgrade6-btn", false);

    updateUI();
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

function toggleCodeInput() {
    const button = document.getElementById("kody-btn");
    const inputContainer = document.querySelector(".kody-input-container");
    
    // If input is already open, close it
    if (inputContainer.style.display === "block") {
        closeCodeInput();
        return;
    }

    // Open the input window
    openCodeInput();
    isCodeInputOpen = true;
}

setInterval(() => {
    score += autoClicker;
    updateUI();
    checkWin();
}, 1000);
