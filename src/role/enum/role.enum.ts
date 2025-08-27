export enum USER_ROLE {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export const userRole: Record<USER_ROLE, string> = {
  [USER_ROLE.ADMIN]: 'Администратор',
  [USER_ROLE.MANAGER]: 'Менеджер',
  [USER_ROLE.USER]: 'Пользователь',
};
