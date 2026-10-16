/* Kai and Magnakai arithmetic; source audits are recorded in the book reviews. */
(function (root) {
  'use strict';
  const weapons = ['Dagger', 'Spear', 'Mace', 'Short Sword', 'Warhammer', 'Sword', 'Axe', 'Sword', 'Quarterstaff', 'Broadsword'];
  const disciplines = [
    ['Camouflage', 'Hide among natural surroundings and pass enemies unnoticed. In settlements, disguise your appearance and speech to fit in with the locals.'],
    ['Hunting', 'Find food in the wild and stalk prey quietly. Usually you do not need a Meal when told to eat; deserts, wastelands, and specific book instructions can prevent hunting.'],
    ['Sixth Sense', 'Notice approaching danger and sense the true intentions of people or the purpose of unfamiliar objects. The book tells you when this insight reveals a choice.'],
    ['Tracking', 'Follow footprints and other trails, navigate wilderness routes, and locate people or objects in towns. Use it when a section offers a Tracking option.'],
    ['Healing', 'Restore 1 Endurance for each numbered section without combat, once you are wounded. Never exceed your maximum; use + on the Endurance card to apply it yourself.'],
    ['Weaponskill', 'Gain 2 Combat Skill while fighting with the weapon type you mastered. Mastery does not give you that weapon; set your mastered type with the Mastery control.'],
    ['Mindshield', 'Prevent Endurance loss caused by an enemy’s Mindblast. This protects against mental attacks; follow the section for other sources of damage.'],
    ['Mindblast', 'Attack an enemy mentally while also using your weapon, gaining 2 Combat Skill. The bonus does not apply to enemies the book identifies as immune; tick their immunity when starting combat.'],
    ['Animal Kinship', 'Communicate with some animals and sense the intentions of others. The book offers choices where this understanding can help.'],
    ['Mind Over Matter', 'Move small objects by concentration.']
  ];
  const magnakai = [
    ['Weaponmastery','Standard Weaponmastery gives 3 Combat Skill with a mastered melee weapon. Choose Standard, Tutelary, or Scion-kai explicitly in Mastery to include the improvement you use. Choose three weapon types initially in Mastery. Bow mastery adds 3 to an appropriate shot roll; select it in Adjusted roll when it applies. Masteries do not give you weapons.'],
    ['Animal Control','Communicate with animals, understand their intentions, and use the advantages the adventure describes when fighting from horseback.'],
    ['Curing','Restore 1 Endurance per numbered section without combat; apply it manually on Stats. Healing and Curing do not stack. The book describes other uses, including identifying herbs and treating disease or injuries.'],
    ['Invisibility','Blend into your surroundings, conceal your heat and scent, and adopt local speech and mannerisms. Follow the choices in the adventure.'],
    ['Huntmastery','Find food even in wasteland and desert. The Meal helper offers to keep your ration. Follow the section for ambushes and other uses; adjust scores yourself.'],
    ['Pathsmanship','Navigate, read languages and symbols, follow tracks, detect traps, and sense north. The adventure describes when these abilities help.'],
    ['Psi-surge','Choose Mindblast (+2 CS, no cost) or Psi-surge (+4 CS, costing 2 EP per used round). They do not stack. Choose your attack in Psychic combat to include its bonus and per-round cost. Do not also enter the bonus in Extra CS or deduct the cost manually. Do not use surge at 6 EP or below. Follow enemy immunity instructions.'],
    ['Psi-screen','Protect against psychic attacks, illusions, and hypnosis as directed by the adventure. The enemy Mindblast helper treats Psi-screen as protection.'],
    ['Nexus','Resist extremes of heat and cold and move objects through concentration. Follow the section and apply any score changes manually.'],
    ['Divination','Sense danger, hidden enemies, intentions, and psychic abilities, and communicate telepathically when the adventure permits.']
  ];
  const loreCircles = [
    {id:'fire',name:'Fire',skills:['Weaponmastery','Huntmastery'],cs:1,ep:2},
    {id:'light',name:'Light',skills:['Animal Control','Curing'],cs:0,ep:3},
    {id:'solaris',name:'Solaris',skills:['Invisibility','Huntmastery','Pathsmanship'],cs:1,ep:3},
    {id:'spirit',name:'Spirit',skills:['Psi-surge','Psi-screen','Nexus','Divination'],cs:3,ep:3}
  ];
  const isMagnakai = s => Number.isInteger(s.book) && s.book>=6 && s.book<=12;
  const primateAbilities = {
    'Animal Control':'Repel hostile animals by disrupting their senses; effectiveness depends on the animal.',
    Curing:'Delay poison or venom while seeking a cure; this does not neutralize it.',
    Huntmastery:'Climb without climbing aids.',
    'Psi-surge':'Use psychic vibrations to damage objects.',
    Nexus:'Greater resistance to harmful gases and fumes.'
  };
  const primateGuidance = (s,name) => s.book===7 && primateAbilities[name] ? `Primate reference (four Magnakai skills): ${primateAbilities[name]} Follow the section and your training record; apply effects manually.` : '';
  const weaponmasteryLevels = {
    standard:{label:'Standard',melee:3,unarmed:-4},
    tutelary:{label:'Tutelary',melee:3,unarmed:-2},
    scion:{label:'Scion-kai',melee:4,unarmed:-1}
  };
  const weaponmasteryEffect = s => isMagnakai(s) && s.magnakai?.includes('Weaponmastery') ? weaponmasteryLevels[s.weaponmasteryLevel] || weaponmasteryLevels.standard : weaponmasteryLevels.standard;
  const trainingGuidance = (s,name) => {
    if(!isMagnakai(s))return '';
    const parts=[];
    if(s.book>=7 && primateAbilities[name])parts.push(`Primate reference (four skills): ${primateAbilities[name]}`);
    const tutelary={Weaponmastery:'Unarmed penalty becomes −2. Select Tutelary in Mastery to include it in calculations.',Invisibility:'Distract an enemy away from your hiding place.',Pathsmanship:'Detect ambushes within 500 yards; wounds or hunger can limit this.', 'Psi-screen':'Defend against magical charms and hostile telepathy.',Divination:'Recognize magical beings or objects unless shielded.'};
    const principalin={'Animal Control':'Call nearby woodland animals to help.',Invisibility:'Mask the sound of your movements.',Huntmastery:'Use telescopic vision.', 'Psi-surge':'Confuse an enemy as directed by the section.',Nexus:'Extinguish fires by concentration.'};
    if(s.book>=8 && tutelary[name])parts.push(`Tutelary reference (five skills): ${tutelary[name]}`);
    if(s.book>=9 && principalin[name])parts.push(`Principalin reference (six skills): ${principalin[name]}`);
    const mentora={Weaponmastery:'Missile rolls gain +2. Select Mentora in Adjusted roll when it applies.',Curing:'Neutralize poison, venom, or toxins as the section directs.',Pathsmanship:'Cross terrain without leaving tracks.', 'Psi-screen':'Protection from psychic attacks by non-corporeal beings.',Divination:'Read psychic residues of past events.'};
    const scion={Weaponmastery:'Mastered melee +4 and unarmed −1. Select Scion-kai in Mastery.',Invisibility:'Alter your appearance to deceive an enemy.',Pathsmanship:'Converse with sentient creatures and evade magical detection.', 'Psi-screen':'Redirect psychic energies as the section directs.',Divination:'Spirit walking leaves your body vulnerable; follow the section.'};
    const archmaster={'Animal Control':'Command animals; hostile creatures are harder to control.',Curing:'At 6 EP or less in combat, restore 20 EP once per 100 days. You decide eligibility; use Restore 20 EP.',Huntmastery:'Heightened hearing, smell, and night vision.', 'Psi-surge':'Choose Archmaster Mindblast +3, or Psi-surge +6 costing 1 EP per round. Surge cannot be used at 4 EP or below. Choose the mode explicitly in Psychic combat.',Nexus:'Limited immunity to heat, cold, fire, gases, and corrosive liquids.'};
    for(const [book,rank,skills] of [[10,'Mentora (seven skills)',mentora],[11,'Scion-kai (eight skills)',scion],[12,'Archmaster (nine skills)',archmaster]])if(s.book>=book && skills[name])parts.push(`${rank}: ${skills[name]}`);
    return parts.length?parts.join(' ')+' Follow your training record and the section; improvements are never selected by book number or skill count.':'';
  };
  const psychicModes = {
    legacy:{label:'Standard Mindblast from selected skills',cs:2,cost:0},
    none:{label:'No psychic attack',cs:0,cost:0},
    mindblast:{label:'Mindblast +2 CS',cs:2,cost:0},
    surge:{label:'Psi-surge +4 CS · 2 EP/round',cs:4,cost:2},
    archMindblast:{label:'Archmaster Mindblast +3 CS',cs:3,cost:0},
    archSurge:{label:'Archmaster Psi-surge +6 CS · 1 EP/round',cs:6,cost:1}
  };
  const psychicEffect = s => {
    if(!isMagnakai(s) || !s.psychicMode || s.psychicMode==='legacy')return {cs:s.disciplines.includes('Mindblast') || s.magnakai?.includes('Psi-surge')?2:0,cost:0};
    return psychicModes[s.psychicMode] || psychicModes.none;
  };
  function adjustedRoll(roll,modifier=0,bow=false,mentora=false) {
    if(!Number.isInteger(roll) || roll<0 || roll>9 || !Number.isInteger(modifier) || modifier< -99 || modifier>99 || typeof bow!=='boolean' || typeof mentora!=='boolean')throw new Error('Enter a roll from 0–9 and a whole-number modifier from −99 to 99.');
    return {roll,modifier,bow,mentora,total:roll+modifier+(bow?3:0)+(mentora?2:0)};
  }
  const cure = s => s.ep>0?Math.min(maxEndurance(s),s.ep+20):0;
  const disciplineList = s => isMagnakai(s) ? magnakai : disciplines;
  const selectedDisciplines = s => isMagnakai(s) ? s.magnakai : s.disciplines;
  const weaponTypes = s => [...new Set(isMagnakai(s) ? [...weapons,'Bow'] : weapons)];
  const loreReady = (s,circle) => circle.skills.every(name=>s.magnakai?.includes(name));
  const loreBonus = s => isMagnakai(s) ? loreCircles.reduce((sum,circle)=>s.loreCircles?.includes(circle.id) ? {cs:sum.cs+circle.cs,ep:sum.ep+circle.ep} : sum,{cs:0,ep:0}) : {cs:0,ep:0};
  // Rows 0–9; columns: ≤−11, −10/−9, …, 0, 1/2, …, ≥11. Enemy loss / hero loss.
  const table = [
    ['6/0','7/0','8/0','9/0','10/0','11/0','12/0','14/0','16/0','18/0','k/0','k/0','k/0'],
    ['0/k','0/k','0/8','0/6','1/6','2/5','3/5','4/5','5/4','6/4','7/4','8/3','9/3'],
    ['0/k','0/8','0/7','1/6','2/5','3/5','4/4','5/4','6/3','7/3','8/3','9/3','10/2'],
    ['0/8','0/7','1/6','2/5','3/5','4/4','5/4','6/3','7/3','8/3','9/2','10/2','11/2'],
    ['0/8','1/7','2/6','3/5','4/4','5/4','6/3','7/3','8/2','9/2','10/2','11/2','12/2'],
    ['1/7','2/6','3/5','4/4','5/4','6/3','7/2','8/2','9/2','10/2','11/2','12/2','14/1'],
    ['2/6','3/6','4/5','5/4','6/3','7/2','8/2','9/2','10/2','11/1','12/1','14/1','16/1'],
    ['3/5','4/5','5/4','6/3','7/2','8/2','9/1','10/1','11/1','12/0','14/0','16/0','18/0'],
    ['4/4','5/4','6/3','7/2','8/1','9/1','10/0','11/0','12/0','14/0','16/0','18/0','k/0'],
    ['5/3','6/3','7/2','8/0','9/0','10/0','11/0','12/0','14/0','16/0','18/0','k/0','k/0']
  ];
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const potionRecovery = name => ['Healing Potion','Potion of Laumspur'].includes(name) ? 4 : 0;
  const canHuntForMeal = s => s.book!==3 && (s.disciplines.includes('Hunting') || Boolean(s.magnakai?.includes('Huntmastery')));
  const psychicProtection = s => s.disciplines.includes('Mindshield') || Boolean(s.magnakai?.includes('Psi-screen'));
  const enemyMindblast = (s,c=s.combat) => psychicProtection(s) ? 0 : c?.mindblastDamage || 0;
  const maxEndurance = s => s.baseEP + s.epBonus + s.special.reduce((sum, item) => sum + item.ep, 0) + loreBonus(s).ep;
  function combatSkill(s, immune = false, modifier = 0) {
    const sunSword = s.equipped === -2 && s.special.some(v => v.name === 'Sommerswerd') ? 8 : 0;
    const weapon = sunSword ? 'Sommerswerd' : s.weapons[s.equipped];
    const melee = weapon && weapon!=='Bow';
    const selectedMastery = weaponmasteryEffect(s);
    const unarmed = melee ? 0 : isMagnakai(s) && s.magnakai?.includes('Weaponmastery') ? selectedMastery.unarmed : -4;
    const matches = type => sunSword ? ['Short Sword','Sword','Broadsword'].includes(type) : weapon===type;
    const kaiMastery = melee && matches(s.mastery) && s.disciplines.includes('Weaponskill') ? 2 : 0;
    const higherMastery = melee && s.magnakai?.includes('Weaponmastery') && s.masteries?.some(matches) ? selectedMastery.melee : 0;
    const mastery = Math.max(kaiMastery,higherMastery);
    const mindblast = immune ? 0 : psychicEffect(s).cs;
    const lore = loreBonus(s).cs;
    const equipment = s.special.reduce((sum,item) => sum + (item.cs || 0), 0);
    return { total: s.baseCS + s.csBonus + unarmed + mastery + mindblast + modifier + equipment + sunSword + lore, unarmed, mastery, mindblast, equipment, sunSword, lore };
  }
  function combatResult(ratio, roll) {
    if (!Number.isInteger(ratio) || !Number.isInteger(roll) || roll < 0 || roll > 9) throw new Error('Invalid combat input');
    const column = ratio <= -11 ? 0 : ratio >= 11 ? 12 : ratio === 0 ? 6 : ratio < 0 ? Math.floor((ratio + 10) / 2) + 1 : Math.ceil(ratio / 2) + 6;
    const [enemy, hero] = table[roll][column].split('/').map(v => v === 'k' ? 'k' : Number(v));
    return { enemy, hero };
  }
  function resolveRound(s, roll, evade = false) {
    const c = s.combat;
    const ratio = combatSkill(s, c.immune, c.modifier).total - c.cs;
    const result = combatResult(ratio, roll);
    const tableLoss = result.hero === 'k' ? s.ep : Math.min(s.ep, result.hero);
    const mindblastLoss = Math.min(s.ep-tableLoss,enemyMindblast(s,c));
    const surgeLoss = Math.min(s.ep-tableLoss-mindblastLoss,psychicEffect(s).cost);
    const heroLoss = tableLoss + mindblastLoss + surgeLoss;
    const multiplier = c.undead && combatSkill(s).sunSword ? 2 : 1;
    const enemyLoss = evade ? 0 : result.enemy === 'k' ? c.ep : Math.min(c.ep, result.enemy * multiplier);
    s.ep -= heroLoss;
    c.ep -= enemyLoss;
    c.rounds.push({ roll, ratio, heroLoss, enemyLoss, mindblastLoss, evade });
    if(surgeLoss)c.rounds.at(-1).surgeLoss=surgeLoss;
    c.status = s.ep === 0 ? 'defeat' : evade ? 'evaded' : c.ep === 0 ? 'victory' : 'active';
    return c.rounds.at(-1);
  }
  const rules = { weapons, disciplines, magnakai, loreCircles, psychicModes, psychicEffect, adjustedRoll, cure, weaponmasteryLevels, weaponmasteryEffect, trainingGuidance, isMagnakai, primateGuidance, disciplineList, selectedDisciplines, weaponTypes, loreReady, loreBonus, psychicProtection, table, clamp, potionRecovery, canHuntForMeal, enemyMindblast, maxEndurance, combatSkill, combatResult, resolveRound };
  if (typeof module !== 'undefined') module.exports = rules;
  else root.LWRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
