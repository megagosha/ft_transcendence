export interface User {
  id: number;
  username: string;
  avatarImgName: string;
  status: string;
  registerDate: Date
  lastLoginDate: Date;
}

export declare type Users = User[];
