/* Kai rules, checked against Books 1 and 2 in the local Project Aon XHTML. */
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
  const maxEndurance = s => s.baseEP + s.epBonus + s.special.reduce((sum, item) => sum + item.ep, 0);
  function combatSkill(s, immune = false, modifier = 0) {
    const sunSword = s.equipped === -2 && s.special.some(v => v.name === 'Sommerswerd') ? 8 : 0;
    const weapon = sunSword ? 'Sommerswerd' : s.weapons[s.equipped];
    const unarmed = weapon ? 0 : -4;
    const mastery = weapon && (sunSword ? ['Short Sword','Sword','Broadsword'].includes(s.mastery) : weapon === s.mastery) && s.disciplines.includes('Weaponskill') ? 2 : 0;
    const mindblast = s.disciplines.includes('Mindblast') && !immune ? 2 : 0;
    const equipment = s.special.reduce((sum,item) => sum + (item.cs || 0), 0);
    return { total: s.baseCS + s.csBonus + unarmed + mastery + mindblast + modifier + equipment + sunSword, unarmed, mastery, mindblast, equipment, sunSword };
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
    const heroLoss = result.hero === 'k' ? s.ep : Math.min(s.ep, result.hero);
    const multiplier = c.undead && combatSkill(s).sunSword ? 2 : 1;
    const enemyLoss = evade ? 0 : result.enemy === 'k' ? c.ep : Math.min(c.ep, result.enemy * multiplier);
    s.ep -= heroLoss;
    c.ep -= enemyLoss;
    c.rounds.push({ roll, ratio, heroLoss, enemyLoss, evade });
    c.status = s.ep === 0 ? 'defeat' : evade ? 'evaded' : c.ep === 0 ? 'victory' : 'active';
    return c.rounds.at(-1);
  }
  const rules = { weapons, disciplines, table, clamp, maxEndurance, combatSkill, combatResult, resolveRound };
  if (typeof module !== 'undefined') module.exports = rules;
  else root.LWRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
