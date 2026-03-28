import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Sword, 
  Scroll, 
  User, 
  Sparkles, 
  Dices, 
  AlertCircle,
  Loader2,
  Backpack,
  Zap,
  BookOpen,
  Trophy,
  Target,
  Heart,
  ShieldAlert,
  Flame,
  SwordIcon,
  Shirt
} from 'lucide-react';

// --- Asset Registry ---
const ASSET_REGISTRY = [
  { id: 'human_base', name: 'Human Base', src: 'https://placehold.co/400x400/1e293b/4f46e5?text=Human+Base', category: 'body' },
  { id: 'elf_base', name: 'Elf Base', src: 'https://placehold.co/400x400/1e293b/4f46e5?text=Elf+Base', category: 'body' },
  { id: 'dwarf_base', name: 'Dwarf Base', src: 'https://placehold.co/400x400/1e293b/4f46e5?text=Dwarf+Base', category: 'body' },
  { id: 'tiefling_base', name: 'Tiefling Base', src: 'https://placehold.co/400x400/1e293b/4f46e5?text=Tiefling+Base', category: 'body' },
  { id: 'dragonborn_base', name: 'Dragonborn Base', src: 'https://placehold.co/400x400/1e293b/4f46e5?text=Dragonborn+Base', category: 'body' },
  
  { id: 'knight_armor', name: 'Knight Armor', src: 'https://placehold.co/400x400/transparent/ffffff?text=Plate+Armor', category: 'apparel' },
  { id: 'mage_robes', name: 'Mage Robes', src: 'https://placehold.co/400x400/transparent/ffffff?text=Arcane+Robes', category: 'apparel' },
  { id: 'leather_armor', name: 'Leather Armor', src: 'https://placehold.co/400x400/transparent/ffffff?text=Leather+Vest', category: 'apparel' },
  { id: 'barbarian_furs', name: 'Barbarian Furs', src: 'https://placehold.co/400x400/transparent/ffffff?text=Tribal+Furs', category: 'apparel' },
  { id: 'divine_vestments', name: 'Divine Vestments', src: 'https://placehold.co/400x400/transparent/ffffff?text=Holy+Garb', category: 'apparel' }
];

// --- Constants & Helpers ---
const SKILL_MAP = {
  Athletics: 'str',
  Acrobatics: 'dex', 'Sleight of Hand': 'dex', Stealth: 'dex',
  Arcana: 'int', History: 'int', Investigation: 'int', Nature: 'int', Religion: 'int',
  'Animal Handling': 'wis', Insight: 'wis', Medicine: 'wis', Perception: 'wis', Survival: 'wis',
  Deception: 'cha', Intimidation: 'cha', Performance: 'cha', Persuasion: 'cha'
};

const ALL_SKILLS = Object.keys(SKILL_MAP);
const ALL_SAVES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      return response;
    } catch (error) {
      if (retries === maxRetries - 1) throw error;
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
};

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);

  const getMod = (score) => Math.floor(((score || 10) - 10) / 2);
  const getProfBonus = (lvl) => Math.ceil((lvl || 1) / 4) + 1;

  const invokeAetherOracle = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    const availableAssetIds = ASSET_REGISTRY.map(a => a.id).join(', ');

    const responseSchema = {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        raceKey: { type: "STRING" },
        level: { type: "NUMBER" },
        hitDie: { type: "STRING" },
        background: { type: "STRING" },
        backstory: { type: "STRING" },
        hp: { type: "NUMBER" },
        stats: {
          type: "OBJECT",
          properties: {
            str: { type: "NUMBER" }, dex: { type: "NUMBER" }, con: { type: "NUMBER" },
            int: { type: "NUMBER" }, wis: { type: "NUMBER" }, cha: { type: "NUMBER" }
          }
        },
        visuals: {
          type: "OBJECT",
          properties: {
            bodyAssetId: { type: "STRING" },
            apparelAssetId: { type: "STRING" }
          }
        },
        proficiencies: {
          type: "OBJECT",
          properties: {
            skills: { type: "ARRAY", items: { type: "STRING" } },
            savingThrows: { type: "ARRAY", items: { type: "STRING" } },
            languages: { type: "ARRAY", items: { type: "STRING" } }
          }
        },
        features: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              source: { type: "STRING" }, 
              description: { type: "STRING" }
            }
          }
        },
        spells: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              level: { type: "NUMBER" },
              damage: { type: "STRING" },
              description: { type: "STRING" }
            }
          }
        },
        inventory: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              type: { type: "STRING" },
              equipped: { type: "BOOLEAN" },
              damageDice: { type: "STRING" },
              damageType: { type: "STRING" },
              abilityUsed: { type: "STRING" }
            }
          }
        },
        classes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: { name: { type: "STRING" }, level: { type: "NUMBER" }, subclass: { type: "STRING" } }
          }
        },
        totalAc: { type: "NUMBER" }
      },
      required: ["name", "level", "stats", "classes", "proficiencies", "features", "inventory", "visuals"]
    };

    const systemPrompt = `Act as Aether Oracle.
      EDITION: D&D 5e (including Tasha's, Xanathar's, Bigby's).
      Choose assets from [${availableAssetIds}].
      Calculate mechanics accurately for the level requested.`;

    try {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const response = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const char = JSON.parse(text);
        setCharacter({ ...char, id: crypto.randomUUID() });
        setPrompt('');
      }
    } catch (e) {
      console.error(e);
      setError("The Oracle is currently blinded by the Aether.");
    } finally {
      setIsGenerating(false);
    }
  };

  const profBonus = character ? getProfBonus(character.level) : 2;
  const bodyAsset = character ? ASSET_REGISTRY.find(a => a.id === character.visuals?.bodyAssetId) : null;
  const apparelAsset = character ? ASSET_REGISTRY.find(a => a.id === character.visuals?.apparelAssetId) : null;

  return (
    <div className="min-h-screen bg-[#030308] text-slate-300 font-sans p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-8 flex-1 w-full">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4 transform rotate-3 border border-white/10">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Aether Oracle
          </h1>
          <p className="text-[10px] text-indigo-400 font-black tracking-[0.4em] uppercase opacity-80 mt-2 text-center">Arcane Asset Synthesis • v2.1</p>
        </header>

        {/* Input */}
        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 backdrop-blur-3xl">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && invokeAetherOracle()}
              placeholder="e.g. A Level 12 Dragonborn Paladin with a heart of gold..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-white text-lg placeholder:text-slate-700 font-medium"
              disabled={isGenerating}
            />
            <button 
              onClick={invokeAetherOracle}
              disabled={isGenerating || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/40 active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Dices className="w-5 h-5" />}
              {isGenerating ? "Synthesizing" : "Manifest"}
            </button>
          </div>
        </div>

        {error && <div className="text-red-400 text-center text-sm font-bold bg-red-950/20 p-4 rounded-2xl border border-red-500/20 max-w-md mx-auto">{error}</div>}

        {character && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Identity & Portrait Banner */}
            <div className="lg:col-span-12 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-48 h-48 bg-slate-950 rounded-[2rem] border-2 border-indigo-500/20 overflow-hidden shadow-2xl shrink-0 group">
                {bodyAsset ? <img src={bodyAsset.src} alt="Body" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><User className="w-20 h-20" /></div>}
                {apparelAsset && <img src={apparelAsset.src} alt="Apparel" className="absolute inset-0 w-full h-full object-cover mix-blend-screen" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded-full border border-indigo-500/30">{character.raceKey}</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{character.name}</h2>
                  <div className="bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg border border-white/10">LEVEL {character.level}</div>
                </div>
                <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">{character.classes.map(c => `${c.subclass || ''} ${c.name}`).join(' / ')}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                   <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                      <Heart className="w-4 h-4 text-emerald-500" />
                      <span className="text-2xl font-black text-emerald-400 leading-none">{character.hp}</span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">HP</span>
                   </div>
                   <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
                      <ShieldAlert className="w-4 h-4 text-blue-500" />
                      <span className="text-2xl font-black text-blue-400 leading-none">{character.totalAc}</span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase">AC</span>
                   </div>
                   <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
                      <Trophy className="w-4 h-4 text-indigo-500" />
                      <span className="text-2xl font-black text-indigo-400 leading-none">+{profBonus}</span>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">Prof</span>
                   </div>
                </div>
              </div>
              <div className="hidden lg:block w-72 bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50">
                <Scroll className="w-5 h-5 text-indigo-500 mb-3" />
                <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-5">"{character.backstory}"</p>
              </div>
            </div>

            {/* Layout Columns */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(character.stats).map(([key, val]) => (
                  <div key={key} className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-3xl text-center hover:border-indigo-500/40 transition-all group relative overflow-hidden">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{key}</div>
                    <div className="text-3xl font-black text-white">{val}</div>
                    <div className="text-xs font-bold text-indigo-400 bg-indigo-500/10 inline-block px-2 py-0.5 rounded-lg mt-1">{getMod(val) >= 0 ? '+' : ''}{getMod(val)}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 sticky top-0 bg-slate-900/40 py-1 backdrop-blur-sm z-10"><Target className="w-3 h-3 text-indigo-500" /> Skill Checks</h3>
                <div className="space-y-1">
                  {ALL_SKILLS.map(skill => {
                    const isProf = character.proficiencies.skills.includes(skill);
                    const baseStat = SKILL_MAP[skill];
                    const mod = getMod(character.stats[baseStat]) + (isProf ? profBonus : 0);
                    return (
                      <div key={skill} className={`flex items-center gap-2 p-2 rounded-xl text-[10px] transition-colors ${isProf ? 'bg-indigo-600/10 text-white' : 'text-slate-600 hover:text-slate-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isProf ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`}></div>
                        <span className="flex-1 font-bold">{skill}</span>
                        <span className={`font-black w-8 text-right text-xs ${isProf ? 'text-indigo-400' : ''}`}>{mod >= 0 ? '+' : ''}{mod}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2"><SwordIcon className="w-4 h-4" /> Combat Manifestations</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.inventory.filter(i => i.damageDice).map((item, idx) => {
                      const mod = getMod(character.stats[item.abilityUsed]) + profBonus;
                      const dmgMod = getMod(character.stats[item.abilityUsed]);
                      return (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex items-center gap-5 group hover:border-red-500/20 transition-all shadow-xl">
                          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0 shadow-inner"><Sword className="w-6 h-6" /></div>
                          <div className="flex-1">
                            <div className="text-xs font-black text-white uppercase tracking-tight">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-bold">Bonus: <span className="text-slate-300">+{mod}</span></div>
                            <div className="mt-2 text-lg font-black text-red-400 leading-none">{item.damageDice}{dmgMod !== 0 ? (dmgMod > 0 ? `+${dmgMod}` : dmgMod) : ''}<span className="text-[10px] text-slate-600 ml-1 font-bold">{item.damageType}</span></div>
                          </div>
                        </div>
                      );
                    })}
                    {character.spells?.map((spell, idx) => (
                      <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex items-center gap-5 group hover:border-purple-500/20 transition-all shadow-xl">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0 shadow-inner"><Flame className="w-6 h-6" /></div>
                        <div className="flex-1">
                          <div className="text-xs font-black text-white uppercase tracking-tight">{spell.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}</div>
                          <div className="mt-2 text-lg font-black text-purple-400 leading-none">{spell.damage || 'UTILITY'}</div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2"><Zap className="w-4 h-4" /> Traits & Mechanics</h3>
                <div className="space-y-4">
                   {character.features.map((f, i) => (
                     <div key={i} className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl relative group hover:bg-slate-900/50 transition-colors">
                        <div className="absolute top-6 right-6 text-[8px] font-black bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">{f.source}</div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">{f.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{f.description}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] p-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Saving Throws</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SAVES.map(save => {
                    const isProf = character.proficiencies.savingThrows.some(s => s.toLowerCase().includes(save.toLowerCase()));
                    const mod = getMod(character.stats[save]) + (isProf ? profBonus : 0);
                    return (
                      <div key={save} className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${isProf ? 'bg-indigo-600/10 border-indigo-500/30 text-white' : 'border-slate-800 text-slate-600'}`}>
                        <span className="text-[9px] font-black uppercase mb-1">{save}</span>
                        <span className="text-xl font-black">{mod >= 0 ? '+' : ''}{mod}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] p-6">
                 <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Backpack className="w-3 h-3" /> Equipment</h3>
                 <div className="space-y-3">
                   {character.inventory.map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/20 rounded-2xl border border-slate-700/30 group hover:bg-slate-800/40 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-indigo-500 transition-colors">
                           {item.damageDice ? <SwordIcon className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </div>
                        <div>
                           <div className="text-[11px] font-black text-white uppercase leading-none">{item.name}</div>
                           <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase">{item.type}</div>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="bg-indigo-950/20 border border-indigo-500/10 p-6 rounded-[2rem] space-y-4">
                 <div><h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Heritage</h4><p className="text-xs font-bold text-slate-400">{character.background}</p></div>
                 <div><h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tongues</h4><div className="flex flex-wrap gap-2">{character.proficiencies.languages.map(l => <span key={l} className="text-[9px] font-black text-slate-500 uppercase px-2 py-1 bg-slate-900 rounded-lg">{l}</span>)}</div></div>
              </div>
            </div>
          </div>
        )}

        {!character && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-48 opacity-10">
            <Dices className="w-24 h-24 mb-6 animate-pulse" />
            <p className="text-sm font-black uppercase tracking-[0.5em]">Whisper the Prompt</p>
          </div>
        )}

        {/* Support Section */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '40px' }}>
          <a 
            href="https://ko-fi.com/aetherscribe" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: '#FF5E5B', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            🧪 Buy me a Health Potion
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;