export class Profile {
  id: number;
  username: string;
  avatarImgName: string;
  email: string;
  registerDate: string
  lastLoginDate: string;
  status: string;

  constructor() {
    this.id = 0;
    this.username = "";
    this.avatarImgName = "";
    this.email = "";
    this.registerDate = "";
    this.lastLoginDate = "";
    this.status = "";
  }
}
