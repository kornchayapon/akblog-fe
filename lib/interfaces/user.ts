import { UserRole } from '../enums/user-role.enum';
import { Picture } from './picture';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  role: UserRole;
  active: boolean;
  verified: boolean;

  avatar?: Picture | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
