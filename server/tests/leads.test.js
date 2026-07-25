const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');

// Load test setup
require('./setup');

describe('Lead Management', () => {
  let adminToken, memberToken, adminUser, memberUser;

  beforeEach(async () => {
    // Create users
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'admin',
    });

    memberUser = await User.create({
      name: 'Test Member',
      email: 'member@test.com',
      password: 'Member@123',
      role: 'member',
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123' });
    adminToken = adminLogin.body.data.token;

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@test.com', password: 'Member@123' });
    memberToken = memberLogin.body.data.token;
  });

  // ============================================================
  // FLOW 1: Complete Lead Lifecycle
  // Create → Assign → Update Status → Add Note → Verify Activity
  // ============================================================
  describe('Flow 1: Lead Lifecycle', () => {
    it('should handle the complete lead lifecycle', async () => {
      // Step 1: Admin creates a lead
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          source: 'website',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.status).toBe('new');
      expect(createRes.body.data.activityTrail).toHaveLength(1);
      expect(createRes.body.data.activityTrail[0].action).toBe('lead_created');

      const leadId = createRes.body.data._id;

      // Step 2: Admin assigns lead to member
      const assignRes = await request(app)
        .patch(`/api/leads/${leadId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: memberUser._id.toString() });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.data.assignedTo._id).toBe(memberUser._id.toString());
      expect(assignRes.body.data.activityTrail).toHaveLength(2);
      expect(assignRes.body.data.activityTrail[1].action).toBe('assigned');

      // Step 3: Member updates status to "contacted"
      const statusRes = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'contacted' });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('contacted');
      expect(statusRes.body.data.activityTrail).toHaveLength(3);
      expect(statusRes.body.data.activityTrail[2].action).toBe('status_changed');
      expect(statusRes.body.data.activityTrail[2].metadata.from).toBe('new');
      expect(statusRes.body.data.activityTrail[2].metadata.to).toBe('contacted');

      // Step 4: Member adds a note
      const noteRes = await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Spoke with client, very interested in our services.' });

      expect(noteRes.status).toBe(200);
      expect(noteRes.body.data.notes).toHaveLength(1);
      expect(noteRes.body.data.notes[0].content).toBe(
        'Spoke with client, very interested in our services.'
      );
      expect(noteRes.body.data.activityTrail).toHaveLength(4);
      expect(noteRes.body.data.activityTrail[3].action).toBe('note_added');

      // Step 5: Verify complete activity trail
      const detailRes = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(detailRes.status).toBe(200);
      const trail = detailRes.body.data.activityTrail;
      expect(trail).toHaveLength(4);
      expect(trail.map((a) => a.action)).toEqual([
        'lead_created',
        'assigned',
        'status_changed',
        'note_added',
      ]);
    });
  });

  // ============================================================
  // FLOW 2: Public Lead Capture → Admin Dashboard
  // ============================================================
  describe('Flow 2: Public Capture', () => {
    it('should submit a lead via public form and appear in admin dashboard', async () => {
      // Step 1: Submit via public form (no auth)
      const submitRes = await request(app)
        .post('/api/public/leads')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+9876543210',
          company: 'Tech Startup',
          source: 'referral',
        });

      expect(submitRes.status).toBe(201);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.message).toContain('submitted successfully');

      // Step 2: Admin sees the lead in dashboard
      const leadsRes = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(leadsRes.status).toBe(200);
      expect(leadsRes.body.data).toHaveLength(1);
      expect(leadsRes.body.data[0].name).toBe('Jane Smith');
      expect(leadsRes.body.data[0].status).toBe('new');
      expect(leadsRes.body.data[0].source).toBe('referral');
    });

    it('should reject public submission with missing required fields', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .send({ phone: '+1234567890' }); // Missing name and email

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================
  // Pagination & Filtering
  // ============================================================
  describe('Pagination and Filtering', () => {
    beforeEach(async () => {
      // Create 15 leads with different statuses
      const statuses = ['new', 'contacted', 'qualified', 'proposal', 'won'];
      for (let i = 1; i <= 15; i++) {
        await Lead.create({
          name: `Lead ${i}`,
          email: `lead${i}@test.com`,
          company: `Company ${i}`,
          status: statuses[i % statuses.length],
          source: 'website',
          assignedTo: i <= 5 ? memberUser._id : null,
        });
      }
    });

    it('should return paginated results with correct metadata', async () => {
      const res = await request(app)
        .get('/api/leads?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.total).toBe(15);
      expect(res.body.pagination.pages).toBe(3);
    });

    it('should filter leads by status', async () => {
      const res = await request(app)
        .get('/api/leads?status=new&limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((lead) => {
        expect(lead.status).toBe('new');
      });
    });

    it('should only return assigned leads for member role', async () => {
      const res = await request(app)
        .get('/api/leads?limit=50')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(5); // Only 5 assigned to member
      res.body.data.forEach((lead) => {
        expect(lead.assignedTo._id).toBe(memberUser._id.toString());
      });
    });
  });

  // ============================================================
  // Permission Enforcement
  // ============================================================
  describe('Permission Enforcement', () => {
    it('should prevent member from creating leads', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Test Lead',
          email: 'test@test.com',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent member from deleting leads', async () => {
      // Admin creates a lead
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'To Delete', email: 'delete@test.com' });

      const leadId = createRes.body.data._id;

      // Member tries to delete
      const res = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent member from accessing unassigned leads', async () => {
      // Admin creates a lead (not assigned to member)
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unassigned Lead', email: 'unassigned@test.com' });

      const leadId = createRes.body.data._id;

      // Member tries to view it
      const res = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent member from assigning leads', async () => {
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test', email: 'test@test.com' });

      const leadId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/leads/${leadId}/assign`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ userId: memberUser._id.toString() });

      expect(res.status).toBe(403);
    });
  });
});
