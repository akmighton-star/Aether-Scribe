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
// === 3. SIMPLE DICE ROLLER ===
// ========================================================================= //
const SimpleDiceRoller = ({ isActive, formula, onClose }) => {
  if (!isActive) return null;
  const match = formula.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
  const count = match && match[1] ? parseInt(match[1]) : 1;
  const faces = match && match[2] ? parseInt(match[2]) : 20;
  const sign = match && match[3] ? match[3] : '+';
  const mod = match && match[4] ? parseInt(match[4]) : 0;
  
  let rollSum = 0;
  for(let i=0; i<count; i++) { rollSum += Math.floor(Math.random() * faces) + 1; }
  const total = sign === '+' ? rollSum + mod : rollSum - mod;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white p-3"><X size={32} /></button>
      <div className="bg-slate-800 p-8 rounded-3xl text-center shadow-2xl border border-slate-700 w-80 animate-in zoom-in-95">
        <p className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Rolling {formula}</p>
        <div className="text-6xl font-black text-white mb-2">{rollSum}</div>
        {mod > 0 && <p className="text-lg text-slate-400">Modifier: {sign}{mod}</p>}
        {count > 1 && <p className="text-xs text-slate-500">({count} dice rolled)</p>}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm uppercase text-indigo-400 font-bold tracking-widest">Total Result</p>
          <p className="text-4xl font-black text-indigo-500">{total}</p>
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

          {
