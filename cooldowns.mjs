export function craftingCooldown(recipe) {
  const cd = recipe?.cooldown;
  if (!cd || !Number.isFinite(cd.seconds) || cd.seconds < 0) {
    return { active: false, label: '제작 쿨타임: 미확인', note: '제작 대기시간 자료가 아직 없습니다.' };
  }
  if (cd.seconds === 0) return { active: false, label: '제작 쿨타임: 없음', note: '완성품을 사용할 때의 쿨타임과는 별개입니다.' };
  const duration = cd.seconds % 3600 === 0 ? `${cd.seconds / 3600}시간`
    : cd.seconds % 60 === 0 ? `${cd.seconds / 60}분` : `${cd.seconds}초`;
  const sharing = cd.group === 'transmute' ? '변환 공유' : cd.group === 'recipe' ? '독립' : '공유 미확인';
  const note = cd.group === 'transmute'
    ? '아케이나이트·군단석·정수 변환·자연의 불꽃이 같은 쿨타임을 공유합니다. 아케이나이트나 군단석을 만들면 이 그룹 전체가 47시간, 정수 변환을 하면 23시간, 자연의 불꽃을 만들면 10분 동안 잠깁니다.'
    : cd.group === 'recipe' ? '이 제조법만의 쿨타임입니다. 다른 변환의 공유 쿨타임과 별도로 사용할 수 있습니다.'
    : '제작 대기시간은 확인했지만 다른 제조법과의 공유 여부는 미확인입니다.';
  return { active: true, label: `제작 쿨타임: ${duration} · ${sharing}`, note };
}
