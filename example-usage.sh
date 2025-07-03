#!/bin/bash

# Employee CRUD API Usage Examples
# Make sure the server is running on localhost:3000

echo "=== Employee CRUD API Demo ==="
echo

# Health check
echo "1. Health Check:"
curl -s http://localhost:3000/health | jq
echo

# Get employees with pagination
echo "2. Get first 3 employees:"
curl -s "http://localhost:3000/employees?page=1&limit=3" | jq
echo

# Create a new employee
echo "3. Create a new employee:"
NEW_EMPLOYEE=$(curl -s -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "position": "Product Manager",
    "department": "Product",
    "salary": 90000
  }')

echo "$NEW_EMPLOYEE" | jq
EMPLOYEE_ID=$(echo "$NEW_EMPLOYEE" | jq -r '.id')
echo

# Get the created employee by ID
echo "4. Get employee by ID ($EMPLOYEE_ID):"
curl -s "http://localhost:3000/employees/$EMPLOYEE_ID" | jq
echo

# Update the employee
echo "5. Update employee salary and position:"
curl -s -X PUT "http://localhost:3000/employees/$EMPLOYEE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 95000,
    "position": "Senior Product Manager"
  }' | jq
echo

# Get updated employee
echo "6. Get updated employee:"
curl -s "http://localhost:3000/employees/$EMPLOYEE_ID" | jq
echo

# Delete the employee
echo "7. Delete employee:"
curl -s -X DELETE "http://localhost:3000/employees/$EMPLOYEE_ID" | jq
echo

# Try to get deleted employee (should return 404)
echo "8. Try to get deleted employee (should return 404):"
curl -s "http://localhost:3000/employees/$EMPLOYEE_ID" | jq
echo

# Test error handling - invalid pagination
echo "9. Test error handling - invalid pagination:"
curl -s "http://localhost:3000/employees?page=0&limit=0" | jq
echo

# Test error handling - missing required fields
echo "10. Test error handling - missing required fields:"
curl -s -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John"
  }' | jq
echo

echo "=== Demo Complete ==="
