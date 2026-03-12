const staticData = {
    names: ["Thalric", "Korg", "Vayn", "Zora", "Braum", "Mog", "Elora", "Kaelen"],
    races: ["Goliath", "Human", "Elf", "Dwarf", "Orc", "Halfling"],
    classes: ["Barbarian", "Fighter", "Rogue", "Wizard", "Paladin", "Cleric"]
};

async function generateDrafts() {
    const vision = document.getElementById('vision-input').value;
    const lowerVision = vision.toLowerCase();
    const output = document.getElementById('forge-output');
    
    document.getElementById('loading').classList.remove('hidden');
    output.innerHTML = '';

    try {
        const response = await fetch('backstories.json');
        const backstoryLibrary = await response.json();
        document.getElementById('loading').classList.add('hidden');

        // Logic Capture
        let dName = vision.match(/name is\s+([A-Z][a-z]+)/i)?.[1] || staticData.names[Math.floor(Math.random()*staticData.names.length)];
        let dRace = staticData.races.find(r => lowerVision.includes(r.toLowerCase())) || "Human";
        let dClass = staticData.classes.find(c => lowerVision.includes(c.toLowerCase())) || "Fighter";

        for(let i=0; i<3; i++) {
            let currentClass = (i === 0) ? dClass : staticData.classes[Math.floor(Math.random()*staticData.classes.length)];
            let story = backstoryLibrary[Math.floor(Math.random() * backstoryLibrary.length)];
            
            const card = document.createElement('div');
            card.className = 'draft-card';
            card.onclick = function() { selectCard(this, dName, dRace, currentClass, story.text); };
            
            card.innerHTML = `
                <div class="token-frame">PORTRAIT</div>
                <div class="match-score">Vision Match: ★★★★★</div>
                <div style="text-align:center; font-weight:bold; font-size:18px; color:var(--accent);">${dName}</div>
                <div style="text-align:center; color:var(--primary); margin-bottom:10px;">${dRace} ${currentClass}</div>
                <div class="backstory-box"><strong>Scribe Backstory:</strong><br>${story.text}</div>
                <button style="width:100%; margin-top:10px; background:transparent; border:1px solid #444; color:#888; font-size:10px;" onclick="event.stopPropagation(); this.parentElement.querySelector('.backstory-box').innerHTML='<textarea placeholder=\'Write your own...\' style=\'width:100%; height:80px; background:#000; color:white; border:none;\'></textarea>'">Manual Edit</button>
            `;
            output.appendChild(card);
        }
    } catch (e) { alert("Error: Make sure backstories.json is uploaded to GitHub."); }
}

function selectCard(el, name, race, cls, story) {
    document.querySelectorAll('.draft-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    
    document.getElementById('race-edit').innerHTML = staticData.races.map(r => `<option ${r===race?'selected':''}>${r}</option>`).join('');
    document.getElementById('class-edit').innerHTML = staticData.classes.map(c => `<option ${c===cls?'selected':''}>${c}</option>`).join('');
    
    document.getElementById('refine-ui').classList.remove('hidden');
    window.currentBuild = { name, race, cls, story, level: document.getElementById('char-level').value };
}

function lockCharacter() {
    const exportPre = document.getElementById('json-export');
    exportPre.innerText = JSON.stringify(window.currentBuild, null, 2);
    exportPre.classList.remove('hidden');
    alert("Character Synced to Aether Might Vault!");
}
