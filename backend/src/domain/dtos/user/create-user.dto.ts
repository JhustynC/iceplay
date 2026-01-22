export class CreateUserDto {
  private constructor(
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public role: 'super_admin' | 'admin',
    public organizationId?: string,
    public phone?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateUserDto?] {
    const { email, password, firstName, lastName, role, organizationId, phone } = object;

    if (!email) return ['Email is required'];
    if (!password) return ['Password is required'];
    if (!firstName) return ['First name is required'];
    if (!lastName) return ['Last name is required'];
    if (!role) return ['Role is required'];
    if (!['super_admin', 'admin'].includes(role)) return ['Invalid role'];
    if (role === 'admin' && !organizationId) return ['Organization ID is required for admin role'];

    return [
      undefined,
      new CreateUserDto(email.toLowerCase(), password, firstName, lastName, role, organizationId, phone),
    ];
  }
}
