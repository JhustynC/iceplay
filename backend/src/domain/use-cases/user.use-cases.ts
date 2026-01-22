import { JwtHelper } from '../../shared/helpers/jwt.helper';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { LoginDto } from '../dtos/user/login.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

interface AuthResponse {
  user: UserEntity;
  token: string;
}

export class UserUseCases {
  constructor(private readonly userRepository: UserRepository) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.login(loginDto);
    await this.userRepository.updateLastLogin(user.id);

    const token = JwtHelper.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return { user, token };
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.userRepository.register(createUserDto);

    const token = JwtHelper.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return { user, token };
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}
