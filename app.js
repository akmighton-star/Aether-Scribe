// High-Tier Data Structures (Simulating your 100+ Backstories)
const classData = {
    "Paladin": { abilities: ["Lay on Hands", "Divine Sense"], gear: ["Chain Mail", "Holy Symbol"], pros: "High Defense", cons: "Low Stealth" },
    "Barbarian": { abilities: ["Rage", "Unarmored Defense"], gear: ["Greataxe", "Explorer's Pack"], pros: "Extreme HP", cons: "No Ranged" },
    "Rogue": { abilities: ["Sneak Attack", "Thieves' Cant"], gear: ["Leather Armor", "Daggers"], pros: "Huge Damage", cons: "Glass Cannon" }
};

async function forgeCharacters() {
    const vision = document.getElementById('vision-input').value;
    const container = document.getElementById('forge-output');
    
    // Automation: Visual Feedback
    container.innerHTML = `<div class="glass-card" style="text-align:center;">The Scribe is weaving destiny...</div>`;

    try {
        const response = await fetch('backstories.json');
        const backstories = await response.json();

        // 1. Identify "Fuzzy" Keywords
        const dRace = ["Goliath", "Elf", "Human", "Dwarf"].find(r => vision.toLowerCase().includes(r.toLowerCase())) || "Human";
        const dClass = ["Paladin", "Barbarian", "Rogue", "Wizard"].find(c => vision.toLowerCase().includes(c.toLowerCase())) || "Fighter";
        const dName = vision.match(/name is\s+([A-Z][a-z]+)/i)?.[1] || "Unnamed Traveler";

        container.innerHTML = ''; // Clear loading

        for (let i = 0; i < 3; i++) {
            // Logic: Mix of requested class and potential alternatives
            const currentClass = (i === 0) ? dClass : Object.keys(classData)[Math.floor(Math.random() * 3)];
            const charData = classData[currentClass] || { abilities: ["Survival"], gear: ["Basic Kit"], pros: "Balanced", cons: "Average" };
            const story = backstories[Math.floor(Math.random() * backstories.length)];

            const card = document.createElement('div');
            card.className = 'draft-card';
            card.onclick = () => selectCard(card, dName, dRace, currentClass, story.text);
            
            card.innerHTML = `
                <div class="token-circle">PORTRAIT</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="rating-tag">Vision Match: ★★★★★</span>
                    <span style="font-size:10px; opacity:0.6;">Option ${i+1}</span>
                </div>
                <h2 style="margin:10px 0 0 0; color:var(--accent);">${dName}</h2>
                <p style="margin:0; font-weight:bold; color:var(--primary);">${dRace} ${currentClass}</p>
                
                <div style="font-size:11px; margin-top:15px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px;">
                    <strong>Core Ability:</strong> ${charData.abilities[0]}<br>
                    <strong>Starting Gear:</strong> ${charData.gear.join(', ')}
                </div>

                <p style="font-size:12px; font-style:italic; opacity:0.8; margin-top:15px;">"${story.text}"</p>
                
                <div style="display:flex; justify-content:space-between; font-size:10px; margin-top:10px;">
                    <span style="color:#2ecc71;">Pros: ${charData.pros}</span>
                    <span style="color:#e74c3c;">Cons: ${charData.cons}</span>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (e) {
        console.error("JSON Link Failed. Check your GitHub file path.", e);
    }
}
