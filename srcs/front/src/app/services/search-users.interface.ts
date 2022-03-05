export interface User {
  id: number;
  username: string;
  avatarImgName: string;
  status: string;
  registerDate: Date
  lastLoginDate: Date;
  blocked: boolean;
}

export declare type Users = User[];
