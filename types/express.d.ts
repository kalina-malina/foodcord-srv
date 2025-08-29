import 'express';
export interface IUser {
  idUser: string;
}

declare module 'express' {
  interface Request {
    user?: IUser;
  }
}
