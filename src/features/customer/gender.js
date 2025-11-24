export const GENDER_LABEL = {
  male: 'male',
  female: 'female',
  prefer_not_to_say: 'secret',
};

export function genderColor(label) {
  return { male: 'blue', female: 'red', secret: 'gold' }[label] || 'default';
}

/** 输入原始 gender，输出 { label, color } */
export function getGenderMeta(raw) {
  const key = raw?.toLowerCase?.() || '';
  const label = GENDER_LABEL[key] ?? (raw || '-');
  const color = genderColor(label);
  return { label, color };
}
