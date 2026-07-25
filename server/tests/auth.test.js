const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

// Load test setup
require('./setup');

describe('Authentication', () => {
  let adminUser;

  beforeEach(async () => {
    // Create a test admin user
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'admin',
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@test.com');
      expect(res.body.data.user.role).toBe('admin');
      // Password should NOT be in response
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'Admin@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Admin@123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      // Login first
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Admin@123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@test.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-based access control', () => {
    it('should deny member access to admin-only routes (GET /api/users)', async () => {
      // Create member user
      await User.create({
        name: 'Test Member',
        email: 'member@test.com',
        password: 'Member@123',
        role: 'member',
      });

      // Login as member
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'member@test.com', password: 'Member@123' });

      const token = loginRes.body.data.token;

      // Try accessing admin-only route
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not authorized');
    });

    it('should allow admin access to admin routes (GET /api/users)', async () => {
      // Login as admin
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Admin@123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
