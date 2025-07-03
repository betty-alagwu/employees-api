# Employee CRUD API

A fully-typed Node.js REST API built with Express and TypeScript for managing employee data. The application stores data in memory and includes comprehensive integration tests using SuperTest.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete employees
- **In-Memory Storage**: Fast data access with 10,000 pre-generated employees using Faker.js
- **Pagination**: Efficient data retrieval with configurable page size
- **Full TypeScript Support**: Complete type safety throughout the application
- **UUID Identifiers**: Unique employee identification using UUID v4
- **Comprehensive Testing**: Integration tests covering all endpoints
- **Input Validation**: Request validation with proper error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Testing**: Jest + SuperTest
- **Data Generation**: Faker.js
- **Unique IDs**: UUID

## API Endpoints

### Health Check
- `GET /health` - Returns API status and employee count

### Employee Management
- `GET /employees` - Get paginated list of employees
  - Query parameters: `page` (default: 1), `limit` (default: 10, max: 100)
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create new employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

## Employee Schema

```typescript
interface Employee {
  id: string;           // UUID v4
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Run in production mode**:
   ```bash
   npm start
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## Usage Examples

### Get all employees (paginated)
```bash
curl "http://localhost:3000/employees?page=1&limit=5"
```

### Create a new employee
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "salary": 75000
  }'
```

### Get employee by ID
```bash
curl http://localhost:3000/employees/{employee-id}
```

### Update employee
```bash
curl -X PUT http://localhost:3000/employees/{employee-id} \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 85000,
    "position": "Senior Software Engineer"
  }'
```

### Delete employee
```bash
curl -X DELETE http://localhost:3000/employees/{employee-id}
```

## Response Format

### Successful Response
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "salary": 75000,
  "hireDate": "2025-07-03T22:48:25.508Z",
  "isActive": true
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10000,
    "totalPages": 1000,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Testing

The application includes comprehensive integration tests covering:
- Health check endpoint
- Employee CRUD operations
- Pagination functionality
- Error handling
- Input validation

Run tests with:
```bash
npm test
```

## Project Structure

```
├── src/
│   ├── main.ts          # Main application file
│   └── main.test.ts     # Integration tests
├── dist/                # Compiled JavaScript (after build)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest test configuration
└── README.md           # This file
```

## Configuration

- **Port**: 3000 (configurable via PORT environment variable)
- **Default Page Size**: 10 employees
- **Maximum Page Size**: 100 employees
- **Initial Data**: 10,000 generated employees

## Development

The application is designed as a single-file solution for simplicity while maintaining full TypeScript support and comprehensive testing. All code is contained in `src/main.ts` with tests in `src/main.test.ts`.

## License

MIT
