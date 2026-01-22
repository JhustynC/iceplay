import { CreateUserDto } from '../dtos/user/create-user.dto';
import { LoginDto } from '../dtos/user/login.dto';
import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository {
  abstract login(loginDto: LoginDto): Promise<UserEntity>;
  abstract register(createUserDto: CreateUserDto): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract updateLastLogin(id: string): Promise<void>;
}
