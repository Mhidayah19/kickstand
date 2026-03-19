import { loginSchema, registerSchema } from '../validation/auth-schema';

describe('loginSchema', () => {
  it('passes with valid input', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a valid email');
  });

  it('fails with short password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Password must be at least 8 characters');
  });
});

describe('registerSchema', () => {
  it('passes with valid input', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Passwords do not match');
  });

  it('fails with short name', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });
});
