// Learning requirements belong to the recipe, separate from potion use levels.
export function learningRequirements(recipe) {
  const req = recipe?.requirements || {};
  const skill = req.skill ? `연금술 숙련 ${req.skill}` : '연금술 숙련 미확인';
  const level = req.characterLevel ? `${req.levelBasis === 'quest' ? '퀘스트 최소' : '숙련 단계 최소'}: 캐릭터 ${req.characterLevel}레벨` : '캐릭터 레벨 미확인';
  const basis = req.levelBasis === 'quest' ? '학습에 필요한 퀘스트 조건 반영' : '숙련 단계 최소 레벨은 해당 연금술 숙련 구간을 올리기 위한 조건입니다. 제조법의 별도 학습 조건은 추가로 충족해야 해요.';
  const note = req.characterLevel ? basis : '정확한 학습 요구 숙련도 자료가 없어 레벨도 확정하지 않았어요.';
  const quest = req.questLevel && req.levelBasis !== 'quest'
    ? `제조법을 퀘스트로 직접 얻으려면 ${req.questLevel}레벨 이상이 필요해요. 거래 가능한 제조법은 경매장 등에서 구할 수 있어요.` : '';
  const reputation = req.reputation === 'supply-friendly' ? '학습 평판: 해당 보급 진영 약간 우호적' : '';
  const use = recipe?.useLevel ? `완성품 사용: 캐릭터 ${recipe.useLevel}레벨 이상` : '';
  return { skill, level, note, quest, reputation, use };
}

export function craftingRequirements(recipe) {
  return (recipe?.craftingRequirements || []).map(req => {
    const label = req.kind === 'tool' ? '필요 도구' : req.kind === 'area' ? '필요 장소' : '필요 시설';
    return `${label}: ${req.name}`;
  }).join(' · ');
}
