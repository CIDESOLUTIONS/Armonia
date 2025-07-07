# Test info

- Name: Complex Update API Integration >> should update complex name and address successfully
- Location: C:\Users\meciz\Documents\armonia\e2e\api\complex-update.spec.ts:27:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
    at C:\Users\meciz\Documents\armonia\e2e\api\complex-update.spec.ts:18:35
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Complex Update API Integration', () => {
   4 |   let complexId: string;
   5 |   let token: string;
   6 |
   7 |   test.beforeAll(async ({ request }) => {
   8 |     // 1. Register a new complex to get a complexId and token
   9 |     const registerResponse = await request.post('/api/auth/register', {
  10 |       data: {
  11 |         name: 'Playwright Test Complex',
  12 |         address: '123 Test Address',
  13 |         adminEmail: `test-admin-${Date.now()}@example.com`,
  14 |         adminPassword: 'testpassword123',
  15 |       },
  16 |     });
  17 |
> 18 |     expect(registerResponse.ok()).toBeTruthy();
     |                                   ^ Error: expect(received).toBeTruthy()
  19 |     const registerBody = await registerResponse.json();
  20 |     complexId = registerBody.complex.id;
  21 |     token = registerBody.token;
  22 |
  23 |     expect(complexId).toBeDefined();
  24 |     expect(token).toBeDefined();
  25 |   });
  26 |
  27 |   test('should update complex name and address successfully', async ({ request }) => {
  28 |     const newName = 'Updated Playwright Complex';
  29 |     const newAddress = '456 New Test Address';
  30 |
  31 |     const response = await request.post('/api/complex/update', {
  32 |       headers: {
  33 |         'Authorization': `Bearer ${token}`,
  34 |         'Content-Type': 'application/json',
  35 |       },
  36 |       data: {
  37 |         name: newName,
  38 |         address: newAddress,
  39 |       },
  40 |     });
  41 |
  42 |     expect(response.ok()).toBeTruthy();
  43 |     const responseBody = await response.json();
  44 |     expect(responseBody.message).toBe('Conjunto actualizado con éxito');
  45 |     expect(responseBody.complex.name).toBe(newName);
  46 |     expect(responseBody.complex.address).toBe(newAddress);
  47 |     expect(responseBody.complex.id).toBe(complexId);
  48 |   });
  49 |
  50 |   test('should return 401 if no token is provided', async ({ request }) => {
  51 |     const response = await request.post('/api/complex/update', {
  52 |       headers: {
  53 |         'Content-Type': 'application/json',
  54 |       },
  55 |       data: {
  56 |         name: 'Some Name',
  57 |       },
  58 |     });
  59 |
  60 |     expect(response.status()).toBe(401);
  61 |     const responseBody = await response.json();
  62 |     expect(responseBody.message).toBe('No token provided');
  63 |   });
  64 |
  65 |   test('should return 401 if token is invalid', async ({ request }) => {
  66 |     const invalidToken = 'invalid.jwt.token'; // A truly invalid token
  67 |
  68 |     const response = await request.post('/api/complex/update', {
  69 |       headers: {
  70 |         'Authorization': `Bearer ${invalidToken}`,
  71 |         'Content-Type': 'application/json',
  72 |       },
  73 |       data: {
  74 |         name: 'Some Name',
  75 |       },
  76 |     });
  77 |
  78 |     expect(response.status()).toBe(401);
  79 |     const responseBody = await response.json();
  80 |     expect(responseBody.message).toBe('Token inválido');
  81 |   });
  82 |
  83 |   test('should return 400 if no fields are provided for update', async ({ request }) => {
  84 |     const response = await request.post('/api/complex/update', {
  85 |       headers: {
  86 |         'Authorization': `Bearer ${token}`,
  87 |         'Content-Type': 'application/json',
  88 |       },
  89 |       data: {},
  90 |     });
  91 |
  92 |     expect(response.status()).toBe(400);
  93 |     const responseBody = await response.json();
  94 |     expect(responseBody.message).toBe('Se requiere al menos un campo para actualizar');
  95 |   });
  96 |
  97 |   // TODO: Add afterAll to clean up the created complex from the database
  98 | });
```