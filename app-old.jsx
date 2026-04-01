import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, collection, query, limit 
} from 'firebase/firestore';
import { 
  Sparkles, Sword, Shield, Book, Scroll, ArrowRight, 
  Download, User, Layers, PenTool, RefreshCw, MessageSquarePlus, 
  ChevronDown, Highlighter, Info as InfoIcon, Star, Heart, 
  X, Printer, Share2, Dices, Sparkle, Landmark, Backpack, Hammer,
  Activity, Eye, UserCircle, Briefcase, Zap, ShieldAlert,
  Dna, Scale, Ruler, Coffee, Coins, History, Wand2, Flame, ScrollText,
  BookOpen, CheckSquare, Square, Target, Boxes, Shirt, Globe, Users,
  CircleDot, ZapOff, Minus, Plus, Skull, ShieldCheck, Crosshair, Award,
  Trash2, Scale as WeighingScale, AlertCircle, Biohazard, Ghost, Database,
  Paintbrush, Dumbbell, Venus, Mars, Smartphone, Monitor, TrendingUp,
  Backpack as PackIcon, Target as SkillIcon, Swords, Crown, BookText, BrainCircuit,
  Smile, Scissors, Anchor
} from 'lucide-react';

/**
 * AETHER SCRIBE: UNIFIED ARCHITECT V10.6.0
 * Version 10.6.0 - The Sync Verified Edition
 * * RESOLUTIONS:
 * - Updated Firebase Configuration: Integrated new appId and measurementId for sync reliability.
 * - Triple-Layer Compositing: Maintained Hair (Z-30) > Armor (Z-20) > Body (Z-10) visual stack.
 * - Data Integrity: Hardened JSON normalization for Lvl 20 technical manifests.
 * - Gnomish Integration: Retained Forest, Rock, and Deep Gnome routing.
 * - Armor Sync: 'Armour and sheilds 2.jpg' remains the fitment master for the doll system.
 */

const firebaseConfig = {
    apiKey: "AIzaSyDTHEYAF6Jgo027bYvr3udmahVE5jnJ_T4",
    authDomain: "aether-scribe.firebaseapp.com",
    projectId: "aether-scribe",
    storageBucket: "aether-scribe.firebasestorage.app",
    messagingSenderId: "82281356863",
    appId: "1:82281356863:web:50a7e4139fa18283bce28a",
    measurementId: "G-66MET3XHVH"
};

const ASSET_REGISTRY = {
  // HAIR / BEARD (Z-30)
  HAIR_MALE: { file: "Male Hair Batch.jpg", cols: 6, rows: 3 },
  HAIR_FEMALE_1: { file: "Female hair batch 1.jpg", cols: 16, rows: 8 },
  HAIR_FEMALE_2: { file: "Female hair batch 2.jpg", cols: 6, rows: 3 },

  // PRIMARY HAIRED BODIES (Z-10)
  HUMAN_HAIRED_FEMALE: { file: "multicultural female.jpg", cols: 4, rows: 2, tones: { 'black': 0, 'light': 1, 'pale': 2, 'tanned': 3 }, builds: { 'toned': 0, 'muscular': 1, 'tattooed': 2, 'rhino': 3 } },
  HUMAN_HAIRED_MALE: { file: "Male Multicultural.jpg", cols: 4, rows: 2, tones: { 'black': 0, 'light': 1, 'pale': 2, 'tanned': 3 }, builds: { 'toned': 0, 'muscular': 1, 'tattooed': 2, 'rhino': 3 } },
  
  // GNOMES
  GNOMES: { file: "image_2b5e69.jpg", cols: 4, rows: 2, map: { 'forest': 0, 'rock': 1, 'deep': 2, 'classic': 3 } },

  // LINEAGES
  TIEFLING: { file: "image_2a7970.jpg", cols: 6, rows: 2, map: { 'asmodeus': 0, 'fierna': 1, 'dispater': 2, 'glasya': 3, 'mephistopheles': 4, 'zariel': 5 } },
  GOLIATH: { file: "image_2a7a21.jpg", cols: 6, rows: 2, map: { 'hill': 0, 'stone': 1, 'frost': 2, 'fire': 3, 'cloud': 4, 'storm': 5 } },
  CORE: { file: "image_2a7ccc.jpg", cols: 6, rows: 2, map: { 'tiefling': 0, 'dwarf': 1, 'halfling': 2, 'goliath': 3, 'aasimar': 4, 'warforged': 5 } },

  // EQUIPMENT (Z-20)
  ARMOR: { file: "Armour and sheilds 2.jpg", cols: 5, rows: 2 }
};

const AETHER_CONFIG = {
    "app": "Aether Scribe",
    "version": "10.6.0",
    "skills": ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
    "skills_map": { "Acrobatics": "dex", "Animal Handling": "wis", "Arcana": "int", "Athletics": "str", "Deception": "cha", "History": "int", "Insight": "wis", "Intimidation": "cha", "Investigation": "int", "Medicine": "wis", "Nature": "int", "Perception": "wis", "Performance": "cha", "Persuasion": "cha", "Religion": "int", "Sleight of Hand": "dex", "Stealth": "dex", "Survival": "wis" }
};

const App = () => {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [edition, setEdition] = useState('2024'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [globalHeroes, setGlobalHeroes] = useState([]);
  const [showScroll, setShowScroll] = useState(false);
  const [activeTab, setActiveTab] = useState('sheet'); 

  // --- STAT CALCULATORS ---
  const getProfBonus = (lvl) => Math.floor((Number(lvl || 1) - 1) / 4) + 2;
  const getMod = (score) => Math.floor(((Number(score) || 10) - 10) / 2);
  const fmtMod = (score) => {
    const mod = getMod(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getEffectiveStat = (statKey) => {
    if (!selectedCharacter) return 10;
    const key = String(statKey).toLowerCase();
    let base = Number(selectedCharacter.stats?.[key] || 10);
    (selectedCharacter.inventory || []).filter(i => i.equipped).forEach(item => {
      if (item.statBonus?.[key]) base += Number(item.statBonus[key]);
      if (item.statOverride?.[key]) base = Math.max(base, Number(item.statOverride[key]));
    });
    return base;
  };

  const calculateAC = () => {
    if (!selectedCharacter) return 10;
    const dexMod = getMod(getEffectiveStat('dex'));
    const inventory = Array.isArray(selectedCharacter.inventory) ? selectedCharacter.inventory : [];
    const armor = inventory.find(i => String(i.type).toLowerCase().includes('armor') && i.equipped);
    const shield = inventory.find(i => (i.name?.toLowerCase().includes('shield') || String(i.type).toLowerCase() === 'shield') && i.equipped);
    
    let baseAC = 10 + dexMod;
    if (armor) {
        const name = String(armor.name).toLowerCase();
        if (name.includes('plate') || name.includes('heavy')) baseAC = 18; 
        else if (name.includes('chain mail')) baseAC = 16; 
        else if (name.includes('half plate') || name.includes('scale')) baseAC = 15 + Math.min(2, dexMod); 
        else if (name.includes('studded')) baseAC = 12 + dexMod; 
        else if (name.includes('leather')) baseAC = 11 + dexMod; 
        else baseAC = 12 + dexMod; 
    }
    if (shield) baseAC += 2;
    inventory.filter(i => i.equipped).forEach(item => { if (item.acBonus) baseAC += Number(item.acBonus); });
    return baseAC;
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const _db = getFirestore(app);
        const _auth = getAuth(app);
        setDb(_db);
        onAuthStateChanged(_auth, (user) => { if (user) setUserId(user.uid); setIsAuthReady(true); });
        if (typeof __initial_auth_token !== 'undefined') { await signInWithCustomToken(_auth, __initial_auth_token); } 
        else { await signInAnonymously(_auth); }
      } catch (e) { setIsAuthReady(true); }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'aether-scribe';
    const q = collection(db, `artifacts/${appId}/public/data/active_heroes`);
    const unsub = onSnapshot(query(q, limit(15)), (snapshot) => {
        setGlobalHeroes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [db, isAuthReady, userId]);

  const invokeAetherOracle = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const levelMatch = prompt.match(/(?:level|lvl)\s*(\d+)/i);
    const targetLevel = levelMatch ? Math.min(20, parseInt(levelMatch[1])) : 1;
    const isMeta = /multiclass|meta|dip/i.test(prompt);

    const systemPrompt = `
      Act as Aether Oracle. Return 3 Level ${targetLevel} builds as JSON. 
      EDITION: PHB ${edition}.
      CLASSES: Return array of { name, subclass, level }. Total sum must equal ${targetLevel}.
      STRUCTURE: Return "hairData" { sheet: "HAIR_MALE"|"HAIR_FEMALE_1"|"HAIR_FEMALE_2", col: int, row: int }.
      CRITICAL: For Level ${targetLevel}, primary stats MUST be 20.
      SPELLS: Strictly return array of { name, level, school, summary (including feet/range), duration }.
      FEATS: Return array of { name, description (passive mechanical benefit) }.
      INVENTORY: MUST include ~12 items (Relic Armor/Weapon, Explorer's Pack, Gear).
      Return JSON: Array of { id, name, classes[], hairData, feats[], selectionSummary, raceKey, gender, level, background, backstory, stats:{str,dex,con,int,wis,cha}, skillProficiencies[], pathFeatures[], inventory[], spells[] }.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const result = JSON.parse(text);
        const processed = result.map(c => {
          const stats = c.stats || {};
          const charLvl = Number(c.level || targetLevel);
          const rawStats = {
            str: Number(stats.str || stats.Str || (charLvl > 15 ? 20 : 10)),
            dex: Number(stats.dex || stats.Dex || (charLvl > 15 ? 16 : 10)),
            con: Number(stats.con || stats.Con || (charLvl > 15 ? 18 : 10)),
            int: Number(stats.int || stats.Int || (charLvl > 15 ? 14 : 10)),
            wis: Number(stats.wis || stats.Wis || (charLvl > 15 ? 14 : 10)),
            cha: Number(stats.cha || stats.Cha || (charLvl > 15 ? 16 : 10))
          };

          return {
            ...
