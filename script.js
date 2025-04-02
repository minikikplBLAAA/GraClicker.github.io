let score = 0;
let pointsPerClick = 1;
let autoClicker = 0;
let goldenClick = false;
let backgroundChanged = false;
const winThreshold = 100000;

const upgrades = {
    1: { cost: 10, bonus: 1 },
    2: { cost: 1000, bonus: 15 },
    3: { cost: 100, auto: 1 },
    4: { cost: 2000, auto: 10 },
    5: { cost: 750, action: "changeBackground" },
    6: { cost: 1500, action: "enableNightMode", hidden: true }
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
    }
}

function toggleElement(id, show) {
    const element = document.getElementById(id);
    if (element) element.style.display = show ? "inline-block" : "none";
}

function updateUI() {
    document.getElementById("counter").innerText = score;
    for (let i = 1; i <= 6; i++) {
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
    if (code === "Military") {
        toggleElement("word-input", true);
        toggleElement("code-input", false);
    } else {
        alert("Nieprawidłowy kod!");
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playAudio() {
    const words = document.getElementById("words").value.trim();
    if (!words) {
        console.log("No words entered.");
        return;
    }
    
    // Split by spaces and remove punctuation
    const wordArray = words.split(' ').map(word => word.replace(/[.,!?]/g, '').trim());
    const folders = ["military/military1", "military/military2", "military/military3"];
    
    for (let word of wordArray) {
        let found = false;
        for (let folder of folders) {
            const audioFilePath = `secretcodes/military/${folder}/${word}.wav`;
            
            try {
                console.log(`Checking audio file: ${audioFilePath}`); // Debugging log
                const response = await fetch(audioFilePath, { method: 'HEAD' });
                console.log(`Response status for ${audioFilePath}: ${response.status}`); // Debugging log
                console.log(`Audio file path constructed: ${audioFilePath}`); // Additional debugging log
                if (response.ok) {
                    const audio = new Audio(audioFilePath);
                    audio.play().then(() => {
                        console.log("Audio is playing successfully from:", audioFilePath);
                    }).catch(error => {
                        console.error("Error playing audio:", error);
                    });
                    found = true;
                    await delay(1000); // Wait for 1 second before playing the next audio
                    break; // Move to the next word after starting playback
                }
            } catch (error) {
                console.error("Error checking audio file in", folder, error);
            }
        }
        if (!found) {
            alert(`Plik dźwiękowy "${word}" nie istnieje w żadnym folderze!`);
        }
    }
}

async function toggleCodeInput() {
    const codeInputElement = document.getElementById("code-input");
    const button = document.getElementById("kody-button"); // Assuming the button has this ID

    if (codeInputElement.style.display === "none" || codeInputElement.style.display === "") {
        button.disabled = true; // Disable the button to prevent spamming
        closeCodeInput(); // Close any open input before opening a new one
        await delay(500); // Wait for half a second before re-enabling the button
        openCodeInput();
    } else {
        closeCodeInput();
    }

    button.disabled = false; // Re-enable the button
}

setInterval(() => {
    score += autoClicker;
    updateUI();
    checkWin();
}, 1000);
