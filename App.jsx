import React, { useState, useEffect } from 'react';
import { 
  User, Sword, ScrollText, Heart, Zap, Dna, Brain, Eye, Sparkles, 
  Terminal, X, ShieldAlert, ShieldCheck, LogIn, Swords, Printer, Download, Dices, Moon, Flame, Wand2, Search, ArrowUpCircle, Lock, RefreshCw, Crosshair, Shield, Backpack, Coins, ChevronDown, Plus, Package, Database, BookOpen
} from 'lucide-react';

// ========================================================================= //
// === 0. AAA ERROR BOUNDARY ===
// ========================================================================= //
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center p-8 text-white font-sans">
          <ShieldAlert size={64} className="mb-6 text-rose-400" />
          <h1 className="text-3xl font-black uppercase tracking-widest mb-4">Aether Anomaly Detected</h1>
          <p className="text-rose-200 mb-6 text-center">A logic error occurred. Click below to restart the weave.</p>
          <div className="bg-black/50 p-6 rounded-xl font-mono text-xs text-rose-300 max-w-2xl w-full overflow-x-auto mb-6">
            {this.state.errorMsg}
          </div>
          <button onClick={() => window.location.reload()} className="bg-white text-rose-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-100">Restart System</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========================================================================= //
// === 1. CONSTANTS & MOCK DATA ===
// ========================================================================= //
const MAX_LEVEL = 20;
const AVAILABLE_CLASSES = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
const STAT_MAP = [
  { id: 'str', label: 'STR', icon: Heart }, { id: 'dex', label: 'DEX', icon: Zap },
  { id: 'con', label: 'CON', icon: Dna }, { id: 'int', label: 'INT', icon: Brain },
  { id: 'wis', label: 'WIS', icon: Eye }, { id: 'cha', label: 'CHA', icon: Sparkles }
];

const TABS = [
  { id: 'sheet', icon: User, title: "Character Sheet" },
  { id: 'loadout', icon: Sword, title: "Gear & Magic" },
  { id: 'inventory', icon: Backpack, title: "Inventory" },
  { id: 'export', icon: ScrollText, title: "Chronicle" }
];

const INITIAL_CHARACTER = {
  nickname: "The Unscribed", hp: { current: 12, max: 12 }, spent_hit_dice: 0, race: { name: "Human", speed: 30 },
  classes: [{ name: "Fighter", subtype: "", level: 1, hit_die: 10, spellcasting_ability: null }],
  stats: { str: 16, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
  saving_throws: ["STR", "CON"],
  skills: ["Athletics", "Perception"],
  other_proficiencies: ["All Armor", "Shields", "Simple Weapons", "Martial Weapons", "Common"],
  features: [{ name: "Second Wind", description: "You have a limited well of stamina that you can draw on to protect yourself from harm." }],
  details: { backstory: "A wandering sellsword.", background_name: "Mercenary" },
  equipped: { 
      weapons: [{ name: "Longsword", dice: "1d8", type: "Slashing" }], 
      armor: [{ name: "Chain Mail", ac: 16 }], 
      spells: [] 
  },
  money: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
  inventory: [
    { name: "Explorer's Pack", desc: "Includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin." }
  ]
};

// Grand Library Data for manual searches (Preview mode only)
const FALLBACK_LIBRARY = {
  weapons: [
    { name: "Longsword", dice: "1d8", type: "Slashing" },
    { name: "Dagger", dice: "1d4", type: "Piercing", properties: ["Finesse"] },
    { name: "Heavy Crossbow", dice: "1d10", type: "Piercing", properties: ["Ranged"] },
    { name: "Warhammer", dice: "1d8", type: "Bludgeoning" },
    { name: "Maul", dice: "2d6", type: "Bludgeoning", properties: ["Heavy"] }
  ],
  spells: [
    { name: "Fireball", level: "3rd Level", school: "Evocation", dice: "8d6", type: "Fire", save: "DEX Save", desc: "A bright streak flashes from your pointing finger to a point you choose... and blossoms with a low roar into an explosion of flame." },
    { name: "Cure Wounds", level: "1st Level", school: "Evocation", dice: "1d8", type: "Healing", desc: "A creature you touch regains hit points." },
    { name: "Magic Missile", level: "1st Level", school: "Evocation", dice: "3d4", type: "Force", desc: "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range." },
    { name: "Mage Hand", level: "Cantrip", school: "Conjuration", effect: "Utility", desc: "A spectral, floating hand appears at a point you choose within range." },
    { name: "Eldritch Blast", level: "Cantrip", school: "Evocation", dice: "1d10", type: "Force", desc: "A beam of crackling energy streaks toward a creature within range." }
  ],
  gear: [
    { name: "Backpack", desc: "A standard adventurer's backpack. Holds up to 30 pounds of gear." },
    { name: "Bag of Holding", desc: "Wondrous item. This bag has an interior space considerably larger than its outside dimensions. It can hold up to 500 pounds." },
    { name: "Lantern, Hooded", desc: "Casts bright light in a 30-foot radius and dim light for an additional 30 feet. Burns for 6 hours on a flask of oil." },
    { name: "Rope, Hempen (50 feet)", desc: "Has 2 hit points and can be burst with a DC 17 Strength check." },
    { name: "Rations (1 day)", desc: "Compact, dry foods suitable for extended travel, including jerky, dried fruit, hardtack, and nuts." }
  ],
  backstories: [
    { type: "Acolyte", tier: "Premium", text: "[Premium Lore] Raised within the towering alabaster walls of the Sun Temple, you were taught that the Aether is a sacred river. You spent your youth transcribing ancient texts, until a vision of a weeping star forced you into the adventuring world." },
    { type: "Soldier", tier: "Short", text: "[Short Lore] A former infantryman of the Royal Vanguard. You survived the siege of Blackwood, but the horrors of war left you seeking a new, quieter purpose." },
    { type: "Criminal", tier: "Premium", text: "[Premium Lore] The rooftops of the Lower Wards were your playground. As a notorious cat burglar known as 'The Wraith', you stole from corrupt nobles to fund your lavish lifestyle, until a job went terribly wrong and forced you into hiding." }
  ]
};

// ========================================================================= //
// === 2. SECURITY CAPTCHA MINIGAME ===
// ========================================================================= //
const GoblinIcon = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg p-2"><polygon points="5,40 30,50 10,65" fill="#166534" /><polygon points="95,40 70,50 90,65" fill="#166534" /><circle cx="50" cy="50" r="35" fill="#22c55e" /><path d="M 30 45 L 45 50 L 35 55 Z" fill="#064e3b" /><path d="M 70 45 L 55 50 L 65 55 Z" fill="#064e3b" /><path d="M 35 70 Q 50 55 65 70" stroke="#064e3b" strokeWidth="4" fill="transparent" strokeLinecap="round" /><polygon points="40,65 45,75 48,63" fill="#ffffff" /><polygon points="60,65 55,75 52,63" fill="#ffffff" /></svg>);
const GuardIcon = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg p-2"><path d="M 25 50 A 25 25 0 0 1 75 50 L 75 80 A 10 10 0 0 1 65 90 L 35 90 A 10 10 0 0 1 25 80 Z" fill="#94a3b8" /><path d="M 25 50 Q 50 35 75 50" stroke="#cbd5e1" strokeWidth="3" fill="transparent" /><rect x="32" y="55" width="14" height="6" rx="2" fill="#0f172a" /><rect x="54" y="55" width="14" height="6" rx="2" fill="#0f172a" /><rect x="46" y="45" width="8" height="35" rx="2" fill="#cbd5e1" /></svg>);

const SecurityMinigame = ({ onVerify }) => {
  const [entities, setEntities] = useState([]);
  const [status, setStatus] = useState('idle'); 
  
  useEffect(() => {
    let newEntities = [...Array(3).fill({ type: 'goblin', icon: <GoblinIcon /> }), ...Array(2).fill({ type: 'guard', icon: <GuardIcon /> })];
    setEntities(newEntities.map((e, i) => ({...e, id: i, defeated: false})).sort(() => Math.random() - 0.5));
  }, []);

  const handleClick = (id, type) => {
    if (status !== 'idle') return;
    if (type === 'guard') setStatus('failed');
    else {
      const next = entities.map(e => e.id === id ? {...e, defeated: true} : e);
      setEntities(next);
      if (next.filter(e => e.type === 'goblin').every(e => e.defeated)) setStatus('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative z-[9999]">
      <button onClick={onVerify} className="absolute top-4 right-4 bg-slate-800 text-slate-500 hover:text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-lg">Dev Skip</button>
      <div className={`max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border-2 overflow-hidden transition-all duration-300 ${status === 'failed' ? 'border-red-500' : status === 'success' ? 'border-emerald-500' : 'border-slate-700'}`}>
        <div className="bg-slate-950 p-6 text-center border-b border-slate-700">
          <div className="flex justify-center mb-3">
            {status === 'success' ? <ShieldCheck className="w-12 h-12 text-emerald-500" /> : status === 'failed' ? <ShieldAlert className="w-12 h-12 text-red-500" /> : <Swords className="w-12 h-12 text-indigo-400" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Aether Gate</h1>
        </div>
        <div className="p-6">
          <div className="mb-6 text-center h-16 flex items-center justify-center">
            {status === 'idle' && <p className="font-medium text-amber-400 bg-amber-400/10 py-2 px-4 rounded-lg">Attack 3 Goblins. <span className="text-slate-400 font-normal">Not guards!</span></p>}
            {status === 'success' && <p className="font-medium text-emerald-400 bg-emerald-400/10 py-2 px-4 rounded-lg animate-pulse">Access Granted.</p>}
            {status === 'failed' && <p className="font-medium text-red-400 bg-red-400/10 py-2 px-4 rounded-lg">Verification Failed.</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6 max-w-[280px] mx-auto">
            {entities.map((e) => (
              <button key={e.id} onClick={() => handleClick(e.id, e.type)} disabled={status !== 'idle' || e.defeated} className={`aspect-square flex items-center justify-center rounded-xl transition-all duration-200 ${e.defeated && e.type === 'goblin' ? 'bg-slate-700/50 opacity-50 scale-95' : e.defeated && e.type === 'guard' ? 'bg-red-500/20 border-2 border-red-500 scale-95' : !e.defeated && status === 'idle' ? 'bg-slate-700 hover:bg-slate-600 shadow-lg cursor-pointer' : 'cursor-not-allowed'}`}>
                <span className={`w-full h-full transition-all duration-300 ${e.defeated ? 'grayscale opacity-50 scale-75' : ''}`}>{e.icon}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-8 min-h-[48px]">
            {status === 'failed' && <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"><RefreshCw className="inline mr-2" size={18}/> Try Again</button>}
            {status === 'success' && <button onClick={onVerify} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg animate-pulse"><LogIn className="inline mr-2" size={18}/> Enter Character Builder</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
// ========================================================================= //
// === 4. MAIN APP COMPONENT ===
// ========================================================================= //
const App = () => {
  const [appView, setAppView] = useState('security'); 
  const [activeTab, setActiveTab] = useState('sheet'); 
  const [character, setCharacter] = useState(INITIAL_CHARACTER);
  const [activeRoll, setActiveRoll] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ type: 'desktop' });
  
  // Gemini Oracle Brain
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tab States
  const [grimoireTab, setGrimoireTab] = useState('weapons');
  const [grimoireSearch, setGrimoireSearch] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Inventory State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSearchingLibrary, setIsSearchingLibrary] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [newItemData, setNewItemData] = useState({ name: "", desc: "" });

  useEffect(() => {
    const handleResize = () => setDeviceInfo({ type: window.innerWidth < 768 ? 'phone' : 'desktop' });
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalLevel = character.classes?.reduce((sum, cls) => sum + parseInt(cls.level || 1, 10), 0) || 1;
  const getMod = (val) => Math.floor(((val || 10) - 10) / 2);
  const profBonus = Math.max(2, Math.ceil(1 + (totalLevel / 4)));

  // DYNAMIC MATH: Armor Class, Initiative, Spellcasting
  const calculateAC = () => {
      const dexMod = getMod(character.stats.dex);
      const equippedArmor = character.equipped?.armor?.[0];
      if (!equippedArmor) return 10 + dexMod; 
      const baseAC = parseInt(equippedArmor.ac, 10);
      if (isNaN(baseAC)) return 10 + dexMod;
      const armorName = equippedArmor.name.toLowerCase();
      if (armorName.includes("plate") || armorName.includes("chain") || armorName.includes("splint")) return baseAC; 
      return baseAC + dexMod; 
  };

  const currentAC = calculateAC();
  const initiative = getMod(character.stats.dex);
  
  const primaryClass = character.classes[0] || {};
  const spellAbility = primaryClass.spellcasting_ability;
  let spellSaveDC = 0;
  let spellAttackMod = 0;
  
  if (spellAbility) {
      const abilityScore = character.stats[spellAbility.toLowerCase()] || 10;
      const abilityMod = getMod(abilityScore);
      spellSaveDC = 8 + profBonus + abilityMod;
      spellAttackMod = profBonus + abilityMod;
  }

  // REST SYSTEM: Short Rest (Hit Dice) & Long Rest
  const handleRollHitDie = () => {
      if (character.spent_hit_dice >= totalLevel) {
          alert("You have no Hit Dice remaining! You must take a Long Rest.");
          return;
      }
      const hitDie = primaryClass.hit_die || 8;
      const conMod = getMod(character.stats.con);
      
      setCharacter(prev => ({
          ...prev,
          spent_hit_dice: prev.spent_hit_dice + 1
      }));
      
      setActiveRoll(`1d${hitDie} + ${conMod}`);
  };

  const handleLongRest = () => {
      setCharacter(prev => ({
          ...prev,
          spent_hit_dice: 0,
          hp: { ...prev.hp, current: prev.hp.max }
      }));
  };

  // LEVELING & MULTICLASSING 
  const handleUpdateClass = (idx, field, value) => {
    setCharacter(prev => {
        const newClasses = prev.classes.map(c => ({ ...c }));
        let updatedHp = prev.hp;

        if (field === 'level') {
            let parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 1) parsed = 1; 
            
            const otherTotal = newClasses.reduce((s, c, i) => s + (i === idx ? 0 : parseInt(c.level, 10)), 0);
            const safeLevel = Math.min(parsed, MAX_LEVEL - otherTotal);
            const oldLevel = parseInt(newClasses[idx].level, 10);
            
            newClasses[idx].level = safeLevel;

            if (safeLevel !== oldLevel) {
                const conMod = getMod(prev.stats.con || 10);
                const hitDieBase = parseInt(newClasses[idx].hit_die, 10) || 8;
                const hpGainedPerLevel = Math.floor(hitDieBase / 2) + 1 + conMod;
                const hpChange = hpGainedPerLevel * (safeLevel - oldLevel);
                
                const newMaxHp = Math.max(1, prev.hp.max + hpChange);
                updatedHp = { max: newMaxHp, current: Math.min(newMaxHp, prev.hp.current + Math.max(0, hpChange)) };
            }
        } else {
            newClasses[idx][field] = value;
        }
        return { ...prev, classes: newClasses, hp: updatedHp };
    });
  };

  const handleAddClass = () => {
    setCharacter(prev => {
        const newClasses = prev.classes.map(c => ({ ...c }));
        let currentTotal = newClasses.reduce((sum, c) => sum + parseInt(c.level || 1, 10), 0);
        
        if (currentTotal >= MAX_LEVEL) {
            let highestIdx = 0;
            for (let i = 1; i < newClasses.length; i++) {
                if (newClasses[i].level > newClasses[highestIdx].level) highestIdx = i;
            }
            if (newClasses[highestIdx].level > 1) {
                newClasses[highestIdx].level -= 1;
            } else {
                return prev; 
            }
        }
        
        return { ...prev, classes: [...newClasses, { name: "Fighter", subtype: "", level: 1, hit_die: 10, spellcasting_ability: null }] };
    });
  };

  // INVENTORY FUNCTIONS
  const handleAddCustomItem = () => {
      if (!newItemData.name.trim()) return;
      setCharacter(prev => ({
          ...prev,
          inventory: [{ name: newItemData.name, desc: newItemData.desc }, ...(prev.inventory || [])]
      }));
      setNewItemData({ name: "", desc: "" });
      setIsAddingItem(false);
  };
  
  const handleAddLibraryItem = (item) => {
      setCharacter(prev => ({
          ...prev,
          inventory: [{ name: item.name, desc: item.desc }, ...(prev.inventory || [])]
      }));
      setIsSearchingLibrary(false);
      setInventorySearch("");
  };

  // ORACLE CONNECTION (AAA Schema)
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const systemPrompt = `Manifest a complete, mathematically accurate D&D 5e character JSON. 
        RULES:
        1. Extract the requested level. Default to 1 if none provided.
        2. STATS: Standard array + racial modifiers.
        3. CLASS DATA: Include the correct hit_die integer (e.g. 8, 10, 12) and the spellcasting_ability string ("INT", "WIS", "CHA", or null for non-casters).
        4. RACE DATA: Include the character's base speed integer (e.g. 25, 30, 35).
        5. PROFICIENCIES: 
           - saving_throws: Array of exactly two abilities (e.g. ["STR", "CON"]).
           - skills: Array of 4-6 skill strings.
           - other_proficiencies: Array of languages, tools, armor, and weapons proficiencies.
        6. GEAR: Provide level-appropriate weapons and armor.
        7. SPELLS: Provide prepared spells as objects. Include actual 5e damage dice (e.g. "8d6" for Fireball).
        8. FEATURES: Provide an array of key class/racial features.
        9. LORE: Pick a standard background. DO NOT write a custom backstory UNLESS explicitly requested.
        
        SCHEMA REQUIRED: { 
          "nickname": "string", "race": "string", "speed": number, "className": "string", "level": number, "hit_die": number, "spellcasting_ability": "string", "background": "string", "custom_backstory": "string",
          "stats": {"str": number, "dex": number, "con": number, "int": number, "wis": number, "cha": number}, 
          "saving_throws": ["string"], "skills": ["string"], "other_proficiencies": ["string"],
          "features": [{"name": "string", "description": "string"}],
          "weapons": [{"name": "string", "dice": "string", "type": "string"}], 
          "armor": [{"name": "string", "ac": number}], 
          "spells": [{"name": "string", "level": "string", "school": "string", "dice": "string", "effect": "string", "save": "string", "desc": "string"}]
        }`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Generate a D&D character based on this prompt: "${prompt}"` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error("API response was not ok");
        const data = await response.json();
        
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiData = JSON.parse(rawText);

        const charLevel = parseInt(aiData.level, 10) || 1;
        const classHitDie = parseInt(aiData.hit_die, 10) || 8;
        const speed = parseInt(aiData.speed, 10) || 30;
        const spellcastingAbility = aiData.spellcasting_ability === "null" ? null : aiData.spellcasting_ability;
        
        const safeStats = {
            str: parseInt(aiData.stats?.str, 10) || 10, dex: parseInt(aiData.stats?.dex, 10) || 10, 
            con: parseInt(aiData.stats?.con, 10) || 10, int: parseInt(aiData.stats?.int, 10) || 10, 
            wis: parseInt(aiData.stats?.wis, 10) || 10, cha: parseInt(aiData.stats?.cha, 10) || 10
        };
        
        const conMod = Math.floor((safeStats.con - 10) / 2);
        const hpGainedPerLevel = Math.floor(classHitDie / 2) + 1 + conMod;
        const maxHp = (classHitDie + conMod) + Math.max(0, charLevel - 1) * hpGainedPerLevel;

        const weaponsRaw = Array.isArray(aiData.weapons) ? aiData.weapons : [];
        const autoEquipWeapons = weaponsRaw.map(wep => {
            if (typeof wep === 'string') return { name: wep, dice: "1d8", type: "Slashing" };
            return { name: wep.name || "Unknown Weapon", dice: wep.dice || "1d8", type: wep.type || "Slashing" };
        });
        
        const armorRaw = Array.isArray(aiData.armor) ? aiData.armor : [];
        const autoEquipArmor = armorRaw.length > 0 ? (typeof armorRaw[0] === 'string' ? [{ name: armorRaw[0], ac: 16 }] : [{ name: armorRaw[0].name, ac: armorRaw[0].ac || 16 }]) : [];
        
        const spellsRaw = Array.isArray(aiData.spells) ? aiData.spells : [];
        const autoEquipSpells = spellsRaw.map(spell => {
            if (typeof spell === 'string') return { name: spell, level: "1st Level", desc: "A mystical spell." };
            return {
                name: spell.name || "Unknown Spell",
                level: spell.level || "1st Level",
                school: spell.school || "Evocation",
                dice: spell.dice || null,
                effect: spell.effect || null,
                save: spell.save || null,
                desc: spell.desc || "A mystical spell."
            };
        });

        // LORE HYDRATION ENGINE
        let finalLore = aiData.custom_backstory;
        let finalBackground = aiData.background || "Mercenary";
        
        if (!finalLore || finalLore.trim() === "") {
            const matchingLores = FALLBACK_LIBRARY.backstories.filter(b => b.type.toLowerCase() === finalBackground.toLowerCase());
            if (matchingLores.length > 0) {
                finalLore = matchingLores[Math.floor(Math.random() * matchingLores.length)].text;
            } else {
                const randomLoreObj = FALLBACK_LIBRARY.backstories[Math.floor(Math.random() * FALLBACK_LIBRARY.backstories.length)];
                finalLore = randomLoreObj.text;
                finalBackground = randomLoreObj.type; 
            }
        }

        setCharacter(prev => ({
            ...prev,
            nickname: aiData.nickname || "Unknown Hero",
            race: { name: aiData.race || "Human", speed: speed },
            classes: [{ name: aiData.className || "Fighter", subtype: "Standard", level: charLevel, hit_die: classHitDie, spellcasting_ability: spellcastingAbility }],
            stats: safeStats, 
            saving_throws: aiData.saving_throws || ["STR", "CON"],
            skills: aiData.skills || [],
            other_proficiencies: aiData.other_proficiencies || [],
            features: aiData.features || [],
            details: { backstory: finalLore, background_name: finalBackground },
            hp: { current: maxHp, max: maxHp },
            spent_hit_dice: 0,
            equipped: { weapons: autoEquipWeapons, armor: autoEquipArmor, spells: autoEquipSpells },
            inventory: [{ name: "Explorer's Pack", desc: "Standard adventuring gear." }]
        }));

        setPrompt("");
        setAppView('dashboard');
        setActiveTab('sheet');

    } catch (error) {
        console.error("Oracle Connection Error:", error);
        alert("The Weave is currently turbulent. Could not manifest character.");
    } finally {
        setIsGenerating(false);
    }
  };

  const toggleWeaponEquip = (weaponObj) => {
      setCharacter(prevChar => {
          const isEquipped = prevChar.equipped?.weapons?.find(w => w.name === weaponObj.name);
          const newWeapons = isEquipped ? prevChar.equipped.weapons.filter(w => w.name !== weaponObj.name) : [...(prevChar.equipped?.weapons || []), weaponObj];
          return { ...prevChar, equipped: { ...prevChar.equipped, weapons: newWeapons } };
      });
  };

  const toggleSpellPrep = (spellObj) => {
      setCharacter(prevChar => {
          const isPrep = prevChar.equipped?.spells?.find(s => s.name === spellObj.name);
          const newSpells = isPrep ? prevChar.equipped.spells.filter(s => s.name !== spellObj.name) : [...(prevChar.equipped?.spells || []), spellObj];
          return { ...prevChar, equipped: { ...prevChar.equipped, spells: newSpells } };
      });
  };

  // HELPER: Group Spells by Level
  const groupedSpells = (character.equipped?.spells || []).reduce((acc, spell) => {
      const lvl = spell.level || "Unknown";
      if (!acc[lvl]) acc[lvl] = [];
      acc[lvl].push(spell);
      return acc;
  }, {});
  const spellLevelsOrder = ["Cantrip", "1st Level", "2nd Level", "3rd Level", "4th Level", "5th Level", "6th Level", "7th Level", "8th Level", "9th Level", "Unknown"];

  const isMobile = deviceInfo.type === 'phone';
  // --- RENDER FLOW ---

  if (appView === 'security') {
    return <SecurityMinigame onVerify={() => setAppView('oracle')} />;
  }

  if (appView === 'oracle') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
          <div className="w-full max-w-2xl bg-slate-950/80 backdrop-blur-md rounded-[3rem] shadow-2xl border border-indigo-900 p-8 md:p-12 text-center animate-in fade-in duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <Wand2 size={64} className="mx-auto text-indigo-400 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">Aether Oracle</h1>
              <p className="text-slate-400 mb-8 text-sm md:text-base px-4 leading-relaxed">
                 Speak your hero into existence. The Oracle will forge their stats, skills, magic, and lore.
              </p>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A grumpy level 14 dwarven cleric who uses a frying pan..."
                className="w-full bg-slate-900 text-white rounded-2xl p-6 mb-6 border border-slate-700 outline-none focus:border-indigo-500 min-h-[160px] resize-none text-lg font-serif shadow-inner"
              />
              
              <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => { setAppView('dashboard'); setActiveTab('sheet'); }}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black uppercase tracking-widest text-sm transition-colors"
                  >
                    Build Manually
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || prompt.trim() === ""}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  >
                    {isGenerating ? <Zap size={24} className="animate-pulse text-yellow-300" /> : <Sparkles size={24} />}
                    {isGenerating ? "Consulting The Weave..." : "Manifest Soul"}
                  </button>
              </div>
          </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className={`flex ${isMobile ? 'flex-col min-h-[100dvh]' : 'h-screen flex-row overflow-hidden'} bg-[#f4f1ea] text-slate-900 font-sans`}>
      
      <SimpleDiceRoller isActive={!!activeRoll} formula={activeRoll || ""} onClose={() => setActiveRoll(null)} />

      {/* NAVIGATION BAR */}
      <aside className={`bg-indigo-950 flex z-50 shadow-2xl ${isMobile ? 'fixed bottom-0 left-0 right-0 h-[72px] flex-row justify-around items-center' : 'w-24 h-full py-8 border-r border-indigo-900 flex-col items-center gap-6'}`}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} title={t.title} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === t.id ? 'bg-white text-indigo-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110' : 'text-indigo-300 hover:bg-white/10'}`}>
                <Icon size={24} />
              </button>
            )
          })}
      </aside>

      {/* LEFT PANE: AVATAR / VITALS */}
      <main className={`relative flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] overflow-y-auto ${isMobile && activeTab === 'export' ? 'hidden' : isMobile ? 'w-full min-h-[50vh]' : 'flex-1 border-r border-slate-300'}`}>
          
          {/* Top Vitals HUD */}
          <div className="absolute top-6 left-6 right-6 flex justify-between z-40 pointer-events-none">
              <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-slate-200 pointer-events-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{character.nickname}</p>
                  <p className="text-xl font-serif text-indigo-950 leading-none mt-1">Lv {totalLevel} {character.race?.name}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">{primaryClass.name || "Unknown"}</p>
              </div>
              <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-slate-200 pointer-events-auto text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                      <button onClick={handleLongRest} className="text-[9px] bg-slate-100 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1">
                          <Moon size={10}/> Long Rest
                      </button>
                  </div>
                  <div className="text-2xl font-black text-rose-600">{character.hp?.current} <span className="text-sm text-slate-400">/ {character.hp?.max}</span></div>
              </div>
          </div>

          {/* Paper Doll Placeholder */}
          <div className="relative w-full max-w-[380px] aspect-[4/5] bg-slate-900 rounded-[3rem] shadow-2xl border-[8px] border-slate-800 flex flex-col items-center justify-center mt-32 sm:mt-8 p-6 text-center z-10 pointer-events-auto">
              <User size={64} className="mx-auto text-slate-700 mb-6 opacity-50" />
              <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">Visual Engine</h3>
              <p className="text-slate-600 text-xs px-4">Avatar composite system will be integrated in V2.</p>
          </div>

          {/* Ko-fi Tip Jar */}
          <div className="mt-8 z-40 pointer-events-auto pb-10">
             <a href="https://ko-fi.com/aetherscribe" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#FF5E5B] hover:bg-[#E04D4A] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all border border-red-400">
                <Heart size={16} /> Buy me a Health Potion
             </a>
          </div>
      </main>

      {/* RIGHT PANE: DATA TABS */}
      <section className={`bg-white z-30 flex flex-col ${isMobile ? 'w-full flex-none pb-24' : activeTab === 'export' ? 'w-full max-w-4xl' : 'w-[450px] lg:w-[550px] h-full shadow-[-20px_0_40px_rgba(0,0,0,0.05)]'}`}>
         
         <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
               {React.createElement(TABS.find(t => t.id === activeTab)?.icon || User, { size: 24, className: "text-indigo-500" })}
               {TABS.find(t => t.id === activeTab)?.title}
            </h2>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
            
            {/* --- SHEET TAB --- */}
            {activeTab === 'sheet' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* DYNAMIC COMBAT MATH */}
                  <div className="flex gap-4">
                      <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center flex flex-col justify-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Armor Class</p>
                          <p className="text-4xl font-serif text-indigo-950">{currentAC}</p>
                          <p className="text-[9px] text-indigo-600 mt-1 truncate px-2">{character.equipped?.armor?.[0]?.name || "Unarmored"}</p>
                      </div>
                      
                      {spellAbility ? (
                          <div className="flex-[1.5] bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-sm">
                              <div className="absolute -right-2 -bottom-2 opacity-10 text-amber-500"><Sparkles size={64}/></div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 relative z-10 flex items-center gap-1"><BookOpen size={12}/> Spellcasting ({spellAbility})</p>
                              <div className="flex justify-between items-end relative z-10">
                                  <div>
                                      <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">Save DC</p>
                                      <p className="text-3xl font-serif text-amber-900">{spellSaveDC}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">Attack</p>
                                      <button onClick={() => setActiveRoll(`1d20 + ${spellAttackMod}`)} className="text-2xl font-serif text-amber-900 hover:text-indigo-600 transition-colors">
                                          +{spellAttackMod}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center flex flex-col justify-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Initiative</p>
                              <p className="text-4xl font-serif text-slate-800">{initiative >= 0 ? `+${initiative}` : initiative}</p>
                              <button onClick={() => setActiveRoll(`1d20 ${initiative >= 0 ? '+' : '-'} ${Math.abs(initiative)}`)} className="mt-1 text-[9px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-300 transition-colors">Roll</button>
                          </div>
                      )}

                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Hit Dice</p>
                          <p className="text-xl font-serif text-slate-800">{totalLevel - (character.spent_hit_dice || 0)} <span className="text-sm text-slate-400">/ {totalLevel}</span></p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">d{primaryClass.hit_die || 8}</p>
                          <button onClick={handleRollHitDie} className="text-[9px] font-bold bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-200 transition-colors shadow-sm">Roll Rest</button>
                      </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                      {STAT_MAP.map(s => {
                      const statVal = character.stats[s.id] || 10;
                      const statMod = getMod(statVal);
                      const StatIcon = s.icon; 
                      const isSaveProf = (character.saving_throws || []).includes(s.label);
                      const saveBonus = statMod + (isSaveProf ? profBonus : 0);
                      
                      return (
                      <div key={s.id} className={`bg-slate-50 p-4 rounded-2xl border text-center transition-colors ${isSaveProf ? 'border-indigo-300 shadow-sm' : 'border-slate-200 hover:border-indigo-300'}`}>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center justify-center gap-1"><StatIcon size={12} className={isSaveProf ? "text-indigo-500" : "text-slate-400"}/> {s.label}</label>
                          <input type="number" value={statVal} onChange={(e) => setCharacter({ ...character, stats: { ...character.stats, [s.id]: parseInt(e.target.value)||0 } })} className="w-full bg-transparent border-0 text-3xl font-serif text-indigo-950 outline-none text-center" />
                          <div className="flex gap-1 mt-2">
                              <button onClick={() => setActiveRoll(`1d20 ${statMod >= 0 ? '+' : '-'} ${Math.abs(statMod)}`)} className="flex-1 text-[10px] font-black text-slate-600 bg-slate-200 py-1 rounded hover:bg-slate-300 transition-colors" title="Ability Check">
                                  {statMod >= 0 ? `+${statMod}` : statMod}
                              </button>
                              <button onClick={() => setActiveRoll(`1d20 ${saveBonus >= 0 ? '+' : '-'} ${Math.abs(saveBonus)}`)} className={`flex-1 text-[10px] font-black py-1 rounded transition-colors ${isSaveProf ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`} title="Saving Throw">
                                  Save {saveBonus >= 0 ? `+${saveBonus}` : saveBonus}
                              </button>
                          </div>
                      </div>
                      )})}
                  </div>

                  {/* Leveling Box */}
                  <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">Class Progression <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Lv {totalLevel}/{MAX_LEVEL}</span></h3>
                          <button onClick={handleAddClass} className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <Plus size={12}/> Multiclass
                          </button>
                      </div>
                      <div className="space-y-3">
                          {character.classes.map((cls, idx) => (
                              <div key={idx} className="flex gap-3 items-center bg-slate-800 p-2 rounded-xl">
                                  <select value={cls.name} onChange={(e) => handleUpdateClass(idx, 'name', e.target.value)} className="flex-1 bg-transparent border-0 text-sm font-black outline-none p-2 text-white">
                                      {AVAILABLE_CLASSES.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                                  </select>
                                  <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-1 border border-slate-700">
                                      <label className="text-[10px] font-black text-slate-500">LVL</label>
                                      <input type="number" min="1" max="20" value={cls.level} onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)} className="w-10 py-1 bg-transparent text-center text-sm font-black text-indigo-400 outline-none" />
                                  </div>
                                  <div className="flex items-center gap-2 bg-rose-950/50 rounded-lg px-2 py-1 border border-rose-900/50 text-rose-400" title="Hit Dice">
                                      <Heart size={12}/> <span className="text-xs font-bold">d{cls.hit_die || 8}</span>
                                  </div>
                                  {character.classes.length > 1 && (
                                      <button onClick={() => setCharacter(p => ({ ...p, classes: p.classes.filter((_, i) => i !== idx) }))} className="p-2 text-slate-500 hover:text-rose-400 transition-colors"><X size={16} /></button>
                                  )}
                                  <button onClick={() => alert("In V1, this will trigger the GitHub JSON to sync Class Features completely free of AI API limits!")} className="text-slate-500 hover:text-indigo-400 transition-colors px-2" title="Refresh Class Features">
                                      <Database size={16}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Skills & Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Sparkles size={14}/> Proficient Skills</h3>
                          <div className="flex flex-wrap gap-2">
                              {(character.skills || []).length === 0 && <span className="text-sm italic text-slate-400">No skills identified.</span>}
                              {(character.skills || []).map((skill, idx) => (
                                  <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">{skill}</span>
                              ))}
                          </div>
                      </div>
                      <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Shield size={14}/> Key Features & Traits</h3>
                          <div className="space-y-3">
                              {(character.features || []).length === 0 && <span className="text-sm italic text-slate-400">No features unlocked.</span>}
                              {(character.features || []).map((feature, idx) => (
                                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                      <p className="text-xs font-black text-slate-800 mb-1">{feature.name}</p>
                                      <p className="text-[10px] text-slate-600 font-serif leading-relaxed">{feature.description || feature.desc}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Proficiencies & Languages */}
                  <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><BookOpen size={14}/> Proficiencies & Languages</h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-serif text-sm text-slate-700 shadow-sm">
                          {(character.other_proficiencies || []).length === 0 ? (
                              <span className="italic text-slate-400">None specified.</span>
                          ) : (
                              <p className="leading-relaxed text-sm">{(character.other_proficiencies || []).join(", ")}</p>
                          )}
                      </div>
                  </div>

                  {/* Backstory */}
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><ScrollText size={14}/> Lore & Background</h3>
                          <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{character.details?.background_name || "Unknown"}</span>
                      </div>
                      <textarea value={character.details?.backstory || ""} onChange={(e) => setCharacter({...character, details: {...character.details, backstory: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[140px] font-serif text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none shadow-sm leading-relaxed"/>
                  </div>
               </div>
            )}

            {/* --- LOADOUT TAB (Armory & Spells) --- */}
            {activeTab === 'loadout' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full space-y-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                        <button onClick={() => setGrimoireTab('weapons')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${grimoireTab === 'weapons' ? 'bg-white shadow-md text-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}>Armory</button>
                        <button onClick={() => setGrimoireTab('spells')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${grimoireTab === 'spells' ? 'bg-white shadow-md text-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}>Spellbook</button>
                    </div>

                    {/* WEAPONS VIEW */}
                    {grimoireTab === 'weapons' && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-200 pb-2">Equipped Arsenal</h3>
                            <div className="space-y-3">
                                {(character.equipped?.weapons || []).length === 0 && <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">No weapons equipped.</p>}
                                {(character.equipped?.weapons || []).map((w, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
                                        <div className="p-4 flex justify-between items-center bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Sword size={18}/></div>
                                                <div>
                                                    <p className="font-black text-slate-100">{w.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{w.dice} {w.type}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => toggleWeaponEquip(w)} className="text-slate-500 hover:text-rose-400 p-2 transition-colors"><X size={16}/></button>
                                        </div>
                                        <div className="flex border-t border-slate-700/50">
                                            <button onClick={() => setActiveRoll(`1d20 + ${getMod(character.stats.str) + profBonus}`)} className="flex-1 py-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-slate-800 transition-colors border-r border-slate-700/50 flex justify-center items-center gap-2">
                                                <Crosshair size={14}/> Attack (+{getMod(character.stats.str) + profBonus})
                                            </button>
                                            <button onClick={() => setActiveRoll(`${w.dice || '1d8'} + ${getMod(character.stats.str)}`)} className="flex-1 py-3 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                                                <Flame size={14}/> Damage
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Search size={14}/> Grand Library Search</span>
                                </h3>
                                <p className="text-[10px] text-slate-400 mb-4 italic">(Note: Preview mode uses a limited fallback library. V1 connects to your unlimited GitHub JSON!)</p>
                                <input value={grimoireSearch} onChange={(e) => setGrimoireSearch(e.target.value)} placeholder="Search for weapons to equip..." className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-serif outline-none focus:border-indigo-500 mb-4 shadow-sm"/>
                                <div className="space-y-2">
                                    {FALLBACK_LIBRARY.weapons.filter(w => w.name.toLowerCase().includes(grimoireSearch.toLowerCase())).map((w, idx) => {
                                        const isEq = character.equipped?.weapons?.some(eq => eq.name === w.name);
                                        return (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{w.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{w.dice} {w.type}</p>
                                                </div>
                                                <button onClick={() => toggleWeaponEquip(w)} className={`text-[10px] font-black px-4 py-2 rounded-lg transition-colors ${isEq ? 'bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}>
                                                    {isEq ? 'Unequip' : 'Equip'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SPELLBOOK VIEW */}
                    {grimoireTab === 'spells' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 border-b border-indigo-100 pb-2 flex items-center justify-between">
                                    Prepared Spells
                                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[9px] shadow-sm">{(character.equipped?.spells || []).length} / {Math.max(1, totalLevel + getMod(character.stats.int))} Max</span>
                                </h3>
                                
                                {/* Group Spells by Level */}
                                {spellLevelsOrder.map(lvl => {
                                    const spellsInLvl = groupedSpells[lvl];
                                    if (!spellsInLvl) return null;
                                    return (
                                        <div key={lvl} className="mb-6">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-2 border-l-2 border-slate-300">{lvl}</h4>
                                            <div className="space-y-3">
                                                {spellsInLvl.map((spell, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-indigo-300">
                                                        <button onClick={() => setExpandedCard(expandedCard === spell.name ? null : spell.name)} className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-indigo-50 transition-colors text-left">
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">{spell.name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                    {spell.school} • {spell.dice ? `${spell.dice} ${spell.type||'Dmg'}` : (spell.effect || 'Utility')}
                                                                    {spell.save ? ` • Save: ${spell.save}` : ''}
                                                                </p>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedCard === spell.name ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {expandedCard === spell.name && (
                                                            <div className="p-4 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                                                                <p className="text-xs font-serif leading-relaxed text-slate-600 mb-4">{spell.desc || "A magical effect."}</p>
                                                                <div className="flex gap-2">
                                                                    {spell.dice ? (
                                                                        <>
                                                                            <button onClick={() => setActiveRoll(spell.dice)} className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-indigo-500 shadow-md transition-colors">Cast (Base)</button>
                                                                            {lvl !== "Cantrip" && (
                                                                                <button onClick={() => {
                                                                                    const upcastDice = spell.dice.replace(/(\d+)d(\d+)/, (match, c, s) => `${parseInt(c)+1}d${s}`);
                                                                                    setActiveRoll(upcastDice);
                                                                                }} className="flex-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-purple-500 shadow-md transition-colors">Cast (Upcast)</button>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => alert(`${spell.name} Cast! Effect: ${spell.effect || 'Utility'}`)} className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-indigo-500 shadow-md transition-colors">Use Spell</button>
                                                                    )}
                                                                    <button onClick={() => toggleSpellPrep(spell)} className="bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-100 transition-colors" title="Unprepare"><X size={16}/></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                                {(character.equipped?.spells || []).length === 0 && <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">Your spellbook is empty.</p>}
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Search size={14}/> Grand Library Search</span>
                                </h3>
                                <p className="text-[10px] text-slate-400 mb-4 italic">(Note: Preview mode uses a limited fallback library. V1 connects to your unlimited GitHub JSON!)</p>
                                <input value={grimoireSearch} onChange={(e) => setGrimoireSearch(e.target.value)} placeholder="Search for spells to prepare..." className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-serif outline-none focus:border-indigo-500 mb-4 shadow-sm"/>
                                <div className="space-y-2">
                                    {FALLBACK_LIBRARY.spells.filter(s => s.name.toLowerCase().includes(grimoireSearch.toLowerCase())).map((s, idx) => {
                                        const isEq = character.equipped?.spells?.some(eq => eq.name === s.name);
                                        return (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{s.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.level} • {s.school}</p>
                                                </div>
                                                <button onClick={() => toggleSpellPrep(s)} className={`text-[10px] font-black px-4 py-2 rounded-lg transition-colors ${isEq ? 'bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}>
                                                    {isEq ? 'Unprepare' : 'Prepare'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- INVENTORY TAB --- */}
            {activeTab === 'inventory' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full space-y-6">
                    {/* Treasury Row */}
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2"><Coins size={16}/> Treasury</h3>
                        <div className="flex justify-between gap-2">
                            {[
                              { id: 'cp', label: 'CP', color: 'text-amber-800', bg: 'bg-amber-200/50' },
                              { id: 'sp', label: 'SP', color: 'text-slate-600', bg: 'bg-slate-200/50' },
                              { id: 'ep', label: 'EP', color: 'text-indigo-600', bg: 'bg-indigo-200/50' },
                              { id: 'gp', label: 'GP', color: 'text-yellow-600', bg: 'bg-yellow-200/50' },
                              { id: 'pp', label: 'PP', color: 'text-slate-800', bg: 'bg-slate-300/50' }
                            ].map(coin => (
                                <div key={coin.id} className={`flex-1 flex flex-col items-center p-2 rounded-xl border border-white/50 shadow-sm ${coin.bg}`}>
                                    <label className={`text-[10px] font-black ${coin.color}`}>{coin.label}</label>
                                    <input 
                                      type="number" 
                                      value={character.money?.[coin.id] || 0} 
                                      onChange={(e) => setCharacter({...character, money: {...character.money, [coin.id]: parseInt(e.target.value)||0}})}
                                      className="w-full bg-transparent text-center font-serif text-lg outline-none mt-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Actions */}
                    <div>
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Backpack size={16}/> Pack & Goods</h3>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsSearchingLibrary(!isSearchingLibrary); setIsAddingItem(false); }} className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isSearchingLibrary ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <Search size={12}/> Find Item
                                </button>
                                <button onClick={() => { setIsAddingItem(!isAddingItem); setIsSearchingLibrary(false); }} className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isAddingItem ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                                    <Plus size={12}/> Custom
                                </button>
                            </div>
                        </div>

                        {/* Search Library UI */}
                        {isSearchingLibrary && (
                            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 mb-4 shadow-inner animate-in slide-in-from-top-2">
                                <p className="text-[10px] text-slate-400 mb-3 italic">(Note: Preview mode uses a limited fallback library. V1 connects to your unlimited GitHub JSON!)</p>
                                <input value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} placeholder="Search for standard gear (e.g. Backpack, Rope)..." className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-serif mb-3 outline-none focus:border-indigo-400 shadow-sm" />
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scroll">
                                    {FALLBACK_LIBRARY.gear.filter(g => g.name.toLowerCase().includes(inventorySearch.toLowerCase())).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors">
                                            <p className="text-xs font-black text-slate-800">{item.name}</p>
                                            <button onClick={() => handleAddLibraryItem(item)} className="text-[9px] bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white font-bold uppercase tracking-widest transition-colors shadow-sm">Add to Pack</button>
                                        </div>
                                    ))}
                                    {FALLBACK_LIBRARY.gear.filter(g => g.name.toLowerCase().includes(inventorySearch.toLowerCase())).length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">No matching items found in library.</p>}
                                </div>
                            </div>
                        )}

                        {/* Add Custom Item Form */}
                        {isAddingItem && (
                            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 mb-4 shadow-lg animate-in slide-in-from-top-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">Forge Custom Item</p>
                                <input value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} placeholder="Item Name (e.g. Homebrew Ring of Jumping)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold mb-2 outline-none focus:border-indigo-400 shadow-sm" />
                                <textarea value={newItemData.desc} onChange={e => setNewItemData({...newItemData, desc: e.target.value})} placeholder="Item Description / Stats" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-serif mb-3 outline-none focus:border-indigo-400 min-h-[80px] resize-none shadow-sm" />
                                <div className="flex gap-2">
                                    <button onClick={handleAddCustomItem} className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-indigo-500 shadow-md transition-colors">Save Item</button>
                                    <button onClick={() => setIsAddingItem(false)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"><X size={14}/></button>
                                </div>
                            </div>
                        )}

                        {/* Inventory List Display */}
                        <div className="space-y-3">
                            {(character.inventory || []).map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-indigo-300">
                                    <button onClick={() => setExpandedCard(expandedCard === item.name ? null : item.name)} className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-indigo-50 transition-colors text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><Package size={14}/></div>
                                            <p className="text-sm font-black text-slate-800">{item.name}</p>
                                        </div>
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedCard === item.name ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedCard === item.name && (
                                        <div className="p-4 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                                            <p className="text-xs font-serif leading-relaxed text-slate-600 mb-4">{item.desc || item.description || "A mundane item."}</p>
                                            <button onClick={() => setCharacter(p => ({...p, inventory: p.inventory.filter((_, i) => i !== idx)}))} className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors shadow-sm">Discard Item</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(character.inventory || []).length === 0 && (
                                <p className="text-center text-xs text-slate-400 italic py-8 bg-slate-50 rounded-xl border border-slate-200">Your pack is empty.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- EXPORT TAB (Chronicle) --- */}
            {activeTab === 'export' && (
                <div className="text-center py-20 animate-in fade-in duration-300">
                    <Printer size={48} className="mx-auto text-emerald-200 mb-4 drop-shadow-md" />
                    <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest mb-2">Export Ready</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm mb-8 leading-relaxed">Download your data to print for the tabletop, or save your JSON to backup your hero securely to your device.</p>
                    <div className="flex justify-center gap-4 mt-8">
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-colors"><Download size={16}/> JSON File</button>
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-500 transition-colors"><Printer size={16}/> PDF Sheet</button>
                    </div>
                </div>
            )}

         </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}

// Ensure the entire app is wrapped in the Error Boundary
export default function SafeApp() {
    return (
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    )
}
