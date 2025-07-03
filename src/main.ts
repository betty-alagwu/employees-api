import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
}

interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  isActive?: boolean;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// In-memory storage
class EmployeeStore {
  private employees: Map<string, Employee> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    console.log('Generating 10,000 employees...');
    for (let i = 0; i < 10000; i++) {
      const employee: Employee = {
        id: uuidv4(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        position: faker.person.jobTitle(),
        department: faker.commerce.department(),
        salary: faker.number.int({ min: 30000, max: 150000 }),
        hireDate: faker.date.past({ years: 10 }),
        isActive: faker.datatype.boolean({ probability: 0.9 })
      };
      this.employees.set(employee.id, employee);
    }
    console.log(`Generated ${this.employees.size} employees`);
  }

  create(employeeData: CreateEmployeeRequest): Employee {
    const employee: Employee = {
      id: uuidv4(),
      ...employeeData,
      hireDate: new Date(),
      isActive: true
    };
    this.employees.set(employee.id, employee);
    return employee;
  }

  findById(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  findAll(page: number = 1, limit: number = 10): PaginatedResponse<Employee> {
    const allEmployees = Array.from(this.employees.values());
    const total = allEmployees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allEmployees.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  update(id: string, updateData: UpdateEmployeeRequest): Employee | null {
    const employee = this.employees.get(id);
    if (!employee) {
      return null;
    }

    const updatedEmployee: Employee = {
      ...employee,
      ...updateData
    };

    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  delete(id: string): boolean {
    return this.employees.delete(id);
  }

  count(): number {
    return this.employees.size;
  }
}

// Express app setup
const app = express();
const employeeStore = new EmployeeStore();

app.use(express.json());

// Validation middleware
const validateCreateEmployee = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, position, department, salary } = req.body;
  
  if (!firstName || !lastName || !email || !position || !department || typeof salary !== 'number') {
    res.status(400).json({ 
      error: 'Missing required fields: firstName, lastName, email, position, department, salary' 
    });
    return;
  }
  
  if (salary < 0) {
    res.status(400).json({ error: 'Salary must be a positive number' });
    return;
  }
  
  next();
};

// Routes
// GET /employees - Get all employees with pagination
app.get('/employees', (req: Request<{}, PaginatedResponse<Employee>, {}, PaginationQuery>, res: Response<PaginatedResponse<Employee>>) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  
  if (page < 1 || limit < 1 || limit > 100) {
    res.status(400).json({
      data: [],
      pagination: { page: 0, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
    } as any);
    return;
  }
  
  const result = employeeStore.findAll(page, limit);
  res.json(result);
});

// GET /employees/:id - Get employee by ID
app.get('/employees/:id', (req: Request<{ id: string }>, res: Response<Employee | { error: string }>) => {
  const employee = employeeStore.findById(req.params.id);
  
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  
  res.json(employee);
});

// POST /employees - Create new employee
app.post('/employees', validateCreateEmployee, (req: Request<{}, Employee | { error: string }, CreateEmployeeRequest>, res: Response<Employee | { error: string }>) => {
  try {
    const employee = employeeStore.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT /employees/:id - Update employee
app.put('/employees/:id', (req: Request<{ id: string }, Employee | { error: string }, UpdateEmployeeRequest>, res: Response<Employee | { error: string }>) => {
  const updatedEmployee = employeeStore.update(req.params.id, req.body);
  
  if (!updatedEmployee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  
  res.json(updatedEmployee);
});

// DELETE /employees/:id - Delete employee
app.delete('/employees/:id', (req: Request<{ id: string }>, res: Response<{ message: string } | { error: string }>) => {
  const deleted = employeeStore.delete(req.params.id);
  
  if (!deleted) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  
  res.json({ message: 'Employee deleted successfully' });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response<{ status: string; employeeCount: number }>) => {
  res.json({ 
    status: 'OK', 
    employeeCount: employeeStore.count() 
  });
});

const PORT = process.env.PORT || 3000;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}



export default app;
