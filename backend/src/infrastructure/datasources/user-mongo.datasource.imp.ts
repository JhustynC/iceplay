import { UserDatasource } from '../../domain/datasources/user.datasource';
import { CreateUserDto } from '../../domain/dtos/user/create-user.dto';
import { LoginDto } from '../../domain/dtos/user/login.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserModel } from '../../config/data/mongo/models/user.model';
import { HashPassword } from '../../shared/helpers/hashPassword.helper';
import { CheckPassword } from '../../shared/helpers/checkPassword.helper';

export class UserMongoDatasource implements UserDatasource {
  async login(loginDto: LoginDto): Promise<UserEntity> {
    const { email, password } = loginDto;

    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await CheckPassword.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    if (!user.isActive) throw new Error('User account is inactive');

    return UserEntity.fromObject({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId?.toString(),
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, password, firstName, lastName, role, organizationId, phone } = createUserDto;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new Error('Email already registered');

    const hashedPassword = await HashPassword.hash(password);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId,
      phone,
      isActive: true,
    });

    return UserEntity.fromObject({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId?.toString(),
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    return UserEntity.fromObject({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId?.toString(),
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return UserEntity.fromObject({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId?.toString(),
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }
}
