import { Injectable } from '@nestjs/common';
import { USER_ROLE, userRole } from './enum/role.enum';

@Injectable()
export class RoleService {

  
  async getRole(): Promise<{ id: USER_ROLE; label: string }[]> {
    return (Object.values(USER_ROLE) as USER_ROLE[]).map((r) => ({
      id: r,
      label: userRole[r],
    }));
  }
}
