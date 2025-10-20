import { Role } from '@/app/types/enum';

const roleToKorean: Record<Role, string> = {
  [Role.User]: '사용자',
  [Role.Developer]: '개발자',
  [Role.Designer]: '디자이너',
  [Role.Planner]: '기획자',
};

console.log('roleToKorean:', roleToKorean);

export default roleToKorean;
