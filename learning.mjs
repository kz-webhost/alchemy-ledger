// Learning requirements belong to the recipe, separate from potion use levels.
export function learningRequirements(recipe) {
  const req = recipe?.requirements || {};
  const skill = req.skill ? `연금술 숙련 ${req.skill}` : '연금술 숙련 미확인';
  const level = req.characterLevel ? `캐릭터 ${req.characterLevel}레벨 이상` : '캐릭터 레벨 미확인';
  const basis = req.levelBasis === 'quest' ? '학습에 필요한 퀘스트 조건 반영' : '연금술 숙련 단계에 필요한 최소 레벨';
  const note = req.characterLevel ? basis : '정확한 학습 요구 숙련도 자료가 없어 레벨도 확정하지 않았어요.';
  const quest = req.questLevel && req.levelBasis !== 'quest'
    ? `제조법을 퀘스트로 직접 얻으려면 ${req.questLevel}레벨 이상이 필요해요. 거래 가능한 제조법은 경매장 등에서 구할 수 있어요.` : '';
  return { skill, level, note, quest };
}

export function craftingRequirements(recipe) {
  return (recipe?.craftingRequirements || []).map(req => {
    const label = req.kind === 'tool' ? '필요 도구' : req.kind === 'area' ? '필요 장소' : '필요 시설';
    return `${label}: ${req.name}`;
  }).join(' · ');
}
