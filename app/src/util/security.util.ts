import * as bcrypt from "bcrypt";

export class SecurityUtil {
  public static hashPassword(pass: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  }

  public static checkPassword(pass: string, hashPass): boolean {
    return bcrypt.compareSync(pass, hashPass);
  }
}
