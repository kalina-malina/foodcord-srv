import 'express';
export interface IUser {
  idUser: string;
  userName?: string;
  idRole?: string;
  userEmail?: string;
  isAdmin?: boolean;
  isAdminProduct?: boolean;
  idStore?: string;
  isGrillProject?: boolean;
}

declare module 'express' {
  interface Request {
    user?: IUser;
  }
}
