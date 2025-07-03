import request from 'supertest';
import app from './main';

// Integration Tests
describe('Employee CRUD API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('employeeCount');
    });
  });

  describe('GET /employees', () => {
    it('should return paginated employees', async () => {
      const response = await request(app).get('/employees?page=1&limit=5');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.total).toBe(10000);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app).get('/employees?page=0&limit=0');
      expect(response.status).toBe(400);
    });
  });

  describe('POST /employees', () => {
    it('should create a new employee', async () => {
      const newEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 75000
      };

      const response = await request(app)
        .post('/employees')
        .send(newEmployee);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newEmployee);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('hireDate');
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/employees')
        .send({ firstName: 'John' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /employees/:id', () => {
    it('should return employee by id', async () => {
      // First create an employee
      const newEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        position: 'Product Manager',
        department: 'Product',
        salary: 85000
      };

      const createResponse = await request(app)
        .post('/employees')
        .send(newEmployee);

      const employeeId = createResponse.body.id;

      const response = await request(app).get(`/employees/${employeeId}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(newEmployee);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app).get('/employees/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Employee not found');
    });
  });

  describe('PUT /employees/:id', () => {
    it('should update an employee', async () => {
      // First create an employee
      const newEmployee = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        position: 'Designer',
        department: 'Design',
        salary: 70000
      };

      const createResponse = await request(app)
        .post('/employees')
        .send(newEmployee);

      const employeeId = createResponse.body.id;
      const updateData = { salary: 80000, position: 'Senior Designer' };

      const response = await request(app)
        .put(`/employees/${employeeId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.salary).toBe(80000);
      expect(response.body.position).toBe('Senior Designer');
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .put('/employees/non-existent-id')
        .send({ salary: 90000 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Employee not found');
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete an employee', async () => {
      // First create an employee
      const newEmployee = {
        firstName: 'Alice',
        lastName: 'Wilson',
        email: 'alice.wilson@example.com',
        position: 'Data Scientist',
        department: 'Data',
        salary: 95000
      };

      const createResponse = await request(app)
        .post('/employees')
        .send(newEmployee);

      const employeeId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/employees/${employeeId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Employee deleted successfully');

      // Verify employee is deleted
      const getResponse = await request(app).get(`/employees/${employeeId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app).delete('/employees/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Employee not found');
    });
  });
});
