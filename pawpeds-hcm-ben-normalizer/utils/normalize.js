import { getValidStatus } from './hcmStatus.js';

export const normalize = async ({ id, name, sex, sire, dam, hcm }) => {
  if (!sex) {
    return null;
  }

  hcm = await getValidStatus({ id, hcm });
  if (!hcm) {
    return null;
  }

  const sireIsEmpty = sire === '';
  const damIsEmpty = dam === '';
  if (sireIsEmpty ^ damIsEmpty) {
    sire = '';
    dam = '';
  }

  return { id, name, sex, sire, dam, hcm };
};
