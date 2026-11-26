// Learning requirements belong to the recipe, separate from potion use levels.
export function learningRequirements(recipe) {
  const req = recipe?.requirements || {};
  const skill = req.skill ? `연금술 숙련 ${req.skill}` : '연금술 숙련 미확인';
  const level = req.characterLevel && req.levelBasis !== 'profession-rank' ? `${req.levelBasis === 'quest' ? '학습 퀘스트' : '제조법 학습'}: 캐릭터 ${req.characterLevel}레벨 이상`
    : req.recipeLevel != null ? (req.recipeLevel > 0 ? `제조법 아이템: 캐릭터 ${req.recipeLevel}레벨 이상` : '제조법 아이템에 별도 캐릭터 레벨 표기 없음')
    : req.sourceType === 'profession' ? '연금술 기본 제조법' : '개별 캐릭터 레벨 조건 미확인';
  const note = req.sourceType === 'unconfirmed' ? '포에버 학습 조건을 확인하지 못했습니다. 숙련 색상 변화 수치로 요구 숙련도를 추정하지 않았어요.'
    : '제조법의 학습 조건과 완성품 사용 조건을 구분해 표시합니다. 교관·전문기술 숙련 단계에서 요구하는 캐릭터 레벨 조건은 별도로 적용됩니다.';
  const quest = req.questLevel && req.levelBasis !== 'quest'
    ? `퀘스트로 직접 획득 시: 캐릭터 ${req.questLevel}레벨 이상 · 선행 조건 별도${req.binding === 'tradable' ? '. 거래 가능한 제조법은 경매장 등에서도 구할 수 있어요.' : ''}` : '';
  const reputation = req.reputation ? `학습 평판: ${req.reputation}` : '';
  const use = recipe?.useLevel ? `완성품 사용: 캐릭터 ${recipe.useLevel}레벨 이상` : '';
  const routes = {'recipe-item':'제조법 아이템',trainer:'교관',profession:'연금술 습득',quest:'퀘스트','special-trainer':'특수 교관',unconfirmed:'미확인'};
  const route = req.sourceType ? `학습 경로: ${routes[req.sourceType] || '미확인'}` : '';
  const binding = req.binding ? (req.binding === 'pickup' ? '제조법 획득 시 귀속' : '제조법 거래 가능') : '';
  const acquisition = [route,req.acquisition,binding].filter(Boolean).join(' · ');
  return { skill, level, note, quest, reputation, use, acquisition };
}

export function craftingRequirements(recipe) {
  return (recipe?.craftingRequirements || []).map(req => {
    const label = req.kind === 'tool' ? '필요 도구' : req.kind === 'area' ? '필요 장소' : '필요 시설';
    return `${label}: ${req.name}`;
  }).join(' · ');
}
