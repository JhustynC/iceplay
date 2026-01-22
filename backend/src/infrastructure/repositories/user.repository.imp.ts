import { UserDatasource } from '../../domain/datasources/user.datasource';
import { CreateUserDto } from '../../domain/dtos/user/create-user.dto';
import { LoginDto } from '../../domain/dtos/user/login.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly datasource: UserDatasource) {}

  login(loginDto: LoginDto): Promise<UserEntity> {
    return this.datasource.login(loginDto);
  }

  register(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.datasource.register(createUserDto);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.datasource.findByEmail(email);
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.datasource.findById(id);
  }

  updateLastLogin(id: string): Promise<void> {
    return this.datasource.updateLastLogin(id);
  }
}
