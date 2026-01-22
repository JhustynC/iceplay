import bcrypt from 'bcryptjs';

export class CheckPassword {
  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
