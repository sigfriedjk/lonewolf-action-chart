/* Read the current-book record and optional checkpoints as the existing test assertions expect. */
const S=require('../saves.js');
const C=require('../campaign.js');
module.exports=storage=>{
  const saved=S.validateRecord(JSON.parse(storage.get(S.STORAGE_KEY)));
  return C.validateSave(S.campaign(saved.current,saved.checkpoints));
};
