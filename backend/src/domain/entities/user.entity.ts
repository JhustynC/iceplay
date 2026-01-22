export class UserEntity {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public role: 'super_admin' | 'admin',
    public organizationId?: string,
    public avatar?: string,
    public phone?: string,
    public isActive: boolean = true,
    public lastLoginAt?: Date,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static fromObject(object: { [key: string]: any }): UserEntity {
    const {
      id,
      _id,
      email,
      firstName,
      lastName,
      role,
      organizationId,
      avatar,
      phone,
      isActive,
      lastLoginAt,
      createdAt,
      updatedAt,
    } = object;

    return new UserEntity(
      id || _id,
      email,
      firstName,
      lastName,
      role,
      organizationId,
      avatar,
      phone,
      isActive,
      lastLoginAt,
      createdAt,
      updatedAt
    );
  }
}
