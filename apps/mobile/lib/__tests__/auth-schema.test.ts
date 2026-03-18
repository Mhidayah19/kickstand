import { loginSchema, registerSchema } from '../validation/auth-schema';

describe('loginSchema', () => {
  it('accepts valid login input', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: 'password123' }).success).toBe(true);
  });
  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe('Enter a valid email');
  });
  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    expect(registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }).success).toBe(true);
  });
  it('rejects non-matching passwords', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe('Passwords do not match');
  });
});
