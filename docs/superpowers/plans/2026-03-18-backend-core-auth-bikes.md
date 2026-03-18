# Backend Core: Bikes + Auth + Service Types — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build bikes CRUD (testable immediately with curl), then auth module (register/login/refresh via Supabase Auth), then lock bikes behind auth. Bikes-first so you can test the app without needing JWT tokens during development.

**Architecture:** NestJS backend exposes RESTful bikes CRUD first (unguarded, userId via query/body for easy testing). Then auth module proxies to Supabase Auth, ensuring our `users` table stays in sync. Finally, auth guards are applied to bikes. All services inject Drizzle ORM via the existing `DRIZZLE` token. TDD with Jest — unit tests mock the DB layer.

**Tech Stack:** NestJS 11, Drizzle ORM, Supabase Auth (`@supabase/supabase-js`), class-validator DTOs, Jest

**Spec reference:** `/Users/hid/personal/docs/superpowers/specs/2026-03-18-kickstand-mobile-design.md` (Sections 4, 5)

---

## File Structure

### New files to create

```
src/
  database/
    database.types.ts              # Shared Drizzle DB type alias
  modules/
    auth/
      auth.module.ts               # AuthModule definition
      auth.controller.ts           # POST /auth/register, /auth/login, /auth/refresh
      auth.service.ts              # Wraps Supabase Auth client
      auth.service.spec.ts         # Unit tests for AuthService
      auth.controller.spec.ts      # Unit tests for AuthController
      dto/
        register.dto.ts            # email, password, name validation
        login.dto.ts               # email, password validation
        refresh.dto.ts             # refresh_token validation
    bikes/
      bikes.module.ts              # BikesModule definition
      bikes.controller.ts          # GET/POST/PATCH/DELETE /bikes
      bikes.service.ts             # Drizzle queries for bikes CRUD
      bikes.service.spec.ts        # Unit tests for BikesService
      bikes.controller.spec.ts     # Unit tests for BikesController
      dto/
        create-bike.dto.ts         # model, year, plateNumber, class, compliance dates
        update-bike.dto.ts         # All fields optional
        update-mileage.dto.ts      # currentMileage only
  seeds/
    seed-service-types.ts          # Seed script for service_types reference table
```

### Files to modify

```
src/app.module.ts                  # Register AuthModule and BikesModule
```

---

## Task 1: Database Type Helper

**Files:**
- Create: `src/database/database.types.ts`

- [ ] **Step 1: Create the type file**

```typescript
// src/database/database.types.ts
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type DrizzleDB = PostgresJsDatabase<typeof schema>;
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/database/database.types.ts
git commit -m "feat: add shared Drizzle DB type alias"
```

---

## Task 2: Bikes DTOs

**Files:**
- Create: `src/modules/bikes/dto/create-bike.dto.ts`
- Create: `src/modules/bikes/dto/update-bike.dto.ts`
- Create: `src/modules/bikes/dto/update-mileage.dto.ts`

- [ ] **Step 1: Create CreateBikeDto**

```typescript
// src/modules/bikes/dto/create-bike.dto.ts
import {
  IsString,
  IsInt,
  IsIn,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateBikeDto {
  @IsString()
  model: string;

  @IsInt()
  @Min(1970)
  year: number;

  @IsString()
  plateNumber: string;

  @IsIn(['2B', '2A', '2'])
  class: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentMileage?: number;

  @IsOptional()
  @IsDateString()
  coeExpiry?: string;

  @IsOptional()
  @IsDateString()
  roadTaxExpiry?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  inspectionDue?: string;
}
```

- [ ] **Step 2: Create UpdateBikeDto**

```typescript
// src/modules/bikes/dto/update-bike.dto.ts
import {
  IsString,
  IsInt,
  IsIn,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateBikeDto {
  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1970)
  year?: number;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsIn(['2B', '2A', '2'])
  class?: string;

  @IsOptional()
  @IsDateString()
  coeExpiry?: string;

  @IsOptional()
  @IsDateString()
  roadTaxExpiry?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  inspectionDue?: string;
}
```

Note: `@nestjs/mapped-types` is not installed, so we use explicit optional fields instead of `PartialType`.

- [ ] **Step 3: Create UpdateMileageDto**

```typescript
// src/modules/bikes/dto/update-mileage.dto.ts
import { IsInt, Min } from 'class-validator';

export class UpdateMileageDto {
  @IsInt()
  @Min(0)
  currentMileage: number;
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/modules/bikes/dto/
git commit -m "feat: add bikes DTOs (create, update, mileage)"
```

---

## Task 3: Bikes Service

**Files:**
- Create: `src/modules/bikes/bikes.service.ts`
- Create: `src/modules/bikes/bikes.service.spec.ts`

- [ ] **Step 1: Write failing tests for BikesService**

```typescript
// src/modules/bikes/bikes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BikesService } from './bikes.service';
import { DRIZZLE } from '../../database/database.module';

describe('BikesService', () => {
  let service: BikesService;

  // Mock Drizzle's fluent query builder — each method returns the builder itself
  // so chains like db.select().from().where() all resolve to the same object.
  const mockDb: any = {};
  mockDb.insert = jest.fn(() => mockDb);
  mockDb.values = jest.fn(() => mockDb);
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.set = jest.fn(() => mockDb);
  mockDb.update = jest.fn(() => mockDb);
  mockDb.delete = jest.fn(() => mockDb);
  mockDb.returning = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BikesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<BikesService>(BikesService);
  });

  describe('create', () => {
    it('should insert a bike and return it', async () => {
      const bike = {
        id: 'bike-1',
        userId: 'user-1',
        model: 'Honda CB400X',
        year: 2023,
        plateNumber: 'FBA1234X',
        class: '2A',
        currentMileage: 0,
      };
      mockDb.returning.mockResolvedValue([bike]);

      const result = await service.create('user-1', {
        model: 'Honda CB400X',
        year: 2023,
        plateNumber: 'FBA1234X',
        class: '2A',
      });

      expect(result).toEqual(bike);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return all bikes for a user', async () => {
      const bikes = [
        { id: 'bike-1', userId: 'user-1', model: 'Honda CB400X' },
      ];
      mockDb.where.mockResolvedValue(bikes);

      const result = await service.findAllByUser('user-1');

      expect(result).toEqual(bikes);
    });
  });

  describe('findOneByUser', () => {
    it('should return a bike if it belongs to user', async () => {
      const bike = { id: 'bike-1', userId: 'user-1', model: 'Honda CB400X' };
      mockDb.where.mockResolvedValue([bike]);

      const result = await service.findOneByUser('bike-1', 'user-1');

      expect(result).toEqual(bike);
    });

    it('should throw NotFoundException if bike not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(
        service.findOneByUser('bike-999', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMileage', () => {
    it('should reject mileage lower than current value', async () => {
      // findOneByUser calls select().from().where() — mock where to return bike
      mockDb.where.mockResolvedValueOnce([
        { id: 'bike-1', userId: 'user-1', currentMileage: 15000 },
      ]);

      await expect(
        service.updateMileage('bike-1', 'user-1', { currentMileage: 10000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/bikes/bikes.service.spec.ts --no-cache`
Expected: FAIL — `Cannot find module './bikes.service'`

- [ ] **Step 3: Implement BikesService**

```typescript
// src/modules/bikes/bikes.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

@Injectable()
export class BikesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(userId: string, dto: CreateBikeDto) {
    const [bike] = await this.db
      .insert(schema.bikes)
      .values({ userId, ...dto })
      .returning();

    return bike;
  }

  async findAllByUser(userId: string) {
    return this.db
      .select()
      .from(schema.bikes)
      .where(eq(schema.bikes.userId, userId));
  }

  async findOneByUser(bikeId: string, userId: string) {
    const [bike] = await this.db
      .select()
      .from(schema.bikes)
      .where(
        and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)),
      );

    if (!bike) {
      throw new NotFoundException('Bike not found');
    }

    return bike;
  }

  async update(bikeId: string, userId: string, dto: UpdateBikeDto) {
    await this.findOneByUser(bikeId, userId);

    const [updated] = await this.db
      .update(schema.bikes)
      .set({ ...dto, updatedAt: new Date() })
      .where(
        and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)),
      )
      .returning();

    return updated;
  }

  async updateMileage(
    bikeId: string,
    userId: string,
    dto: UpdateMileageDto,
  ) {
    const bike = await this.findOneByUser(bikeId, userId);

    if (dto.currentMileage < bike.currentMileage) {
      throw new BadRequestException(
        `Mileage cannot be lower than previous value (${bike.currentMileage})`,
      );
    }

    const [updated] = await this.db
      .update(schema.bikes)
      .set({ currentMileage: dto.currentMileage, updatedAt: new Date() })
      .where(
        and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)),
      )
      .returning();

    return updated;
  }

  async remove(bikeId: string, userId: string) {
    await this.findOneByUser(bikeId, userId);

    const [deleted] = await this.db
      .delete(schema.bikes)
      .where(
        and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)),
      )
      .returning();

    return deleted;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/bikes/bikes.service.spec.ts --no-cache`
Expected: All tests PASS

Note: The mock uses a fluent builder pattern where every method returns the same object. If Drizzle's actual chain differs (e.g., `where()` returns a thenable directly in some cases), adjust the mock accordingly.

- [ ] **Step 5: Commit**

```bash
git add src/modules/bikes/bikes.service.ts src/modules/bikes/bikes.service.spec.ts
git commit -m "feat: implement BikesService with CRUD and mileage validation"
```

---

## Task 4: Bikes Controller (No Auth — Easy Testing)

**Files:**
- Create: `src/modules/bikes/bikes.controller.ts`
- Create: `src/modules/bikes/bikes.controller.spec.ts`

The controller is built WITHOUT auth guards initially. userId is passed via `x-user-id` header for easy curl testing. Task 10 will replace this with `@UseGuards(SupabaseAuthGuard)` + `@CurrentUser()`.

- [ ] **Step 1: Write failing tests for BikesController**

```typescript
// src/modules/bikes/bikes.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';

describe('BikesController', () => {
  let controller: BikesController;
  const mockBikesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    updateMileage: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikesController],
      providers: [{ provide: BikesService, useValue: mockBikesService }],
    }).compile();

    controller = module.get<BikesController>(BikesController);
  });

  describe('GET /bikes', () => {
    it('should return all bikes for the given userId', async () => {
      const bikes = [{ id: 'bike-1', model: 'Honda CB400X' }];
      mockBikesService.findAllByUser.mockResolvedValue(bikes);

      const result = await controller.findAll('user-1');

      expect(result).toEqual(bikes);
      expect(mockBikesService.findAllByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('POST /bikes', () => {
    it('should create a bike for the given userId', async () => {
      const dto = { model: 'Honda CB400X', year: 2023, plateNumber: 'FBA1234X', class: '2A' };
      const bike = { id: 'bike-1', userId: 'user-1', ...dto };
      mockBikesService.create.mockResolvedValue(bike);

      const result = await controller.create('user-1', dto);

      expect(result).toEqual(bike);
      expect(mockBikesService.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('PATCH /bikes/:id', () => {
    it('should update a bike', async () => {
      const dto = { model: 'Honda CB400X Updated' };
      const updated = { id: 'bike-1', ...dto };
      mockBikesService.update.mockResolvedValue(updated);

      const result = await controller.update('bike-1', 'user-1', dto);

      expect(result).toEqual(updated);
      expect(mockBikesService.update).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('PATCH /bikes/:id/mileage', () => {
    it('should update mileage', async () => {
      const dto = { currentMileage: 16000 };
      const updated = { id: 'bike-1', currentMileage: 16000 };
      mockBikesService.updateMileage.mockResolvedValue(updated);

      const result = await controller.updateMileage('bike-1', 'user-1', dto);

      expect(result).toEqual(updated);
      expect(mockBikesService.updateMileage).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('DELETE /bikes/:id', () => {
    it('should delete a bike', async () => {
      const deleted = { id: 'bike-1' };
      mockBikesService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('bike-1', 'user-1');

      expect(result).toEqual(deleted);
      expect(mockBikesService.remove).toHaveBeenCalledWith('bike-1', 'user-1');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/bikes/bikes.controller.spec.ts --no-cache`
Expected: FAIL — `Cannot find module './bikes.controller'`

- [ ] **Step 3: Implement BikesController (no auth guard)**

```typescript
// src/modules/bikes/bikes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

// TODO: Task 10 will replace @Headers('x-user-id') with @UseGuards(SupabaseAuthGuard) + @CurrentUser()
@Controller('bikes')
export class BikesController {
  constructor(private bikesService: BikesService) {}

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.bikesService.findAllByUser(userId);
  }

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateBikeDto,
  ) {
    return this.bikesService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateBikeDto,
  ) {
    return this.bikesService.update(id, userId, dto);
  }

  @Patch(':id/mileage')
  updateMileage(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateMileageDto,
  ) {
    return this.bikesService.updateMileage(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.bikesService.remove(id, userId);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/bikes/bikes.controller.spec.ts --no-cache`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/bikes/bikes.controller.ts src/modules/bikes/bikes.controller.spec.ts
git commit -m "feat: implement BikesController (no auth, x-user-id header for testing)"
```

---

## Task 5: Bikes Module Wiring + Manual Test

**Files:**
- Create: `src/modules/bikes/bikes.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create BikesModule**

```typescript
// src/modules/bikes/bikes.module.ts
import { Module } from '@nestjs/common';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';

@Module({
  controllers: [BikesController],
  providers: [BikesService],
  exports: [BikesService],
})
export class BikesModule {}
```

- [ ] **Step 2: Register BikesModule in AppModule**

In `src/app.module.ts`, add to imports:

```typescript
import { BikesModule } from './modules/bikes/bikes.module';

@Module({
  imports: [
    // ... existing imports ...
    DatabaseModule,
    BikesModule,  // <-- add this
  ],
  controllers: [HealthController],
})
export class AppModule {}
```

- [ ] **Step 3: Verify compilation and run all tests**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx tsc --noEmit && npx jest --no-cache`
Expected: No compilation errors, all tests pass

- [ ] **Step 4: Start server and test with curl**

Start: `cd /Users/hid/Developer/kickstand/apps/api && npm run start:dev`

First, insert a test user directly (needed for FK constraint):

```bash
cd /Users/hid/Developer/kickstand/apps/api && node -e "
const postgres = require('postgres');
require('dotenv/config');
const sql = postgres(process.env.SUPABASE_DATABASE_URL);
sql\`INSERT INTO users (id, email, name) VALUES ('00000000-0000-0000-0000-000000000001', 'test@test.com', 'Test User') ON CONFLICT DO NOTHING\`.then(() => { console.log('Test user created'); return sql.end(); });
"
```

Then test bikes CRUD:

```bash
# Create a bike
curl -X POST http://localhost:3000/bikes \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -d '{"model":"Honda CB400X","year":2023,"plateNumber":"FBA1234X","class":"2A"}'

# List bikes
curl http://localhost:3000/bikes \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001"

# Update mileage (replace BIKE_ID with actual id from create response)
curl -X PATCH http://localhost:3000/bikes/BIKE_ID/mileage \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -d '{"currentMileage":5000}'

# Delete bike
curl -X DELETE http://localhost:3000/bikes/BIKE_ID \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001"
```

Expected: All CRUD operations work. 201/200 responses with bike data.

- [ ] **Step 5: Commit**

```bash
git add src/modules/bikes/bikes.module.ts src/app.module.ts
git commit -m "feat: wire BikesModule into AppModule"
```

---

## Task 6: Seed Service Types

**Files:**
- Create: `src/seeds/seed-service-types.ts`

- [ ] **Step 1: Create seed script**

```typescript
// src/seeds/seed-service-types.ts
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';

const serviceTypes = [
  { key: 'oil_change', label: 'Oil Change' },
  { key: 'chain_adjustment', label: 'Chain Adjustment' },
  { key: 'chain_replacement', label: 'Chain & Sprocket Replacement' },
  { key: 'brake_pads', label: 'Brake Pads Replacement' },
  { key: 'brake_fluid', label: 'Brake Fluid Change' },
  { key: 'coolant', label: 'Coolant Change' },
  { key: 'air_filter', label: 'Air Filter Replacement' },
  { key: 'spark_plugs', label: 'Spark Plugs Replacement' },
  { key: 'tire_front', label: 'Front Tire Replacement' },
  { key: 'tire_rear', label: 'Rear Tire Replacement' },
  { key: 'valve_clearance', label: 'Valve Clearance Adjustment' },
  { key: 'battery', label: 'Battery Replacement' },
  { key: 'general_service', label: 'General Service / Inspection' },
  { key: 'fork_oil', label: 'Fork Oil Change' },
  { key: 'clutch', label: 'Clutch Replacement' },
];

async function seed() {
  const connectionString = process.env.SUPABASE_DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding service_types...');

  await db
    .insert(schema.serviceTypes)
    .values(serviceTypes)
    .onConflictDoNothing();

  console.log(`Seeded ${serviceTypes.length} service types.`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add seed script to package.json**

In `apps/api/package.json` scripts, add:

```json
"seed:service-types": "ts-node src/seeds/seed-service-types.ts"
```

- [ ] **Step 3: Run the seed**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx ts-node src/seeds/seed-service-types.ts`
Expected: `Seeded 15 service types.`

- [ ] **Step 4: Verify seed data**

```bash
cd /Users/hid/Developer/kickstand/apps/api && node -e "
const postgres = require('postgres');
require('dotenv/config');
const sql = postgres(process.env.SUPABASE_DATABASE_URL);
sql\`SELECT * FROM service_types ORDER BY key\`.then(r => { console.log(r.length, 'service types'); return sql.end(); });
"
```

Expected: `15 service types`

- [ ] **Step 5: Commit**

```bash
git add src/seeds/seed-service-types.ts package.json
git commit -m "feat: add service_types seed script with 15 common maintenance types"
```

---

## Task 7: Auth DTOs

**Files:**
- Create: `src/modules/auth/dto/register.dto.ts`
- Create: `src/modules/auth/dto/login.dto.ts`
- Create: `src/modules/auth/dto/refresh.dto.ts`

- [ ] **Step 1: Create RegisterDto**

```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;
}
```

- [ ] **Step 2: Create LoginDto**

```typescript
// src/modules/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

- [ ] **Step 3: Create RefreshDto**

```typescript
// src/modules/auth/dto/refresh.dto.ts
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  refresh_token: string;
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/dto/
git commit -m "feat: add auth DTOs (register, login, refresh)"
```

---

## Task 8: Auth Service

**Files:**
- Create: `src/modules/auth/auth.service.ts`
- Create: `src/modules/auth/auth.service.spec.ts`

The auth service wraps Supabase Auth. On registration, it also inserts a row into our `users` table so the user exists in both Supabase Auth and our schema. If the DB insert fails, it rolls back by deleting the Supabase Auth user.

- [ ] **Step 1: Write failing tests for AuthService**

```typescript
// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DRIZZLE } from '../../database/database.module';

// Mock @supabase/supabase-js
const mockSupabaseAuth = {
  admin: { createUser: jest.fn(), deleteUser: jest.fn() },
  signInWithPassword: jest.fn(),
  refreshSession: jest.fn(),
};
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: mockSupabaseAuth }),
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockDb = { insert: jest.fn(), select: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'test-key',
              };
              return config[key];
            }),
          },
        },
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user in Supabase Auth and our users table', async () => {
      const supabaseUser = { id: 'uuid-123', email: 'test@example.com' };
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: { user: supabaseUser },
        error: null,
      });
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: 'uuid-123', email: 'test@example.com', name: 'Test' },
          ]),
        }),
      });
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'jwt-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com', name: 'Test' },
      });
      expect(mockSupabaseAuth.admin.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        email_confirm: true,
      });
    });

    it('should throw BadRequestException when Supabase returns error', async () => {
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback Supabase Auth user if DB insert fails', async () => {
      const supabaseUser = { id: 'uuid-123', email: 'test@example.com' };
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: { user: supabaseUser },
        error: null,
      });
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });
      mockSupabaseAuth.admin.deleteUser.mockResolvedValue({ error: null });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockSupabaseAuth.admin.deleteUser).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('login', () => {
    it('should return session tokens and user on valid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'jwt-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
          user: { id: 'uuid-123', email: 'test@example.com' },
        },
        error: null,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-jwt',
            refresh_token: 'new-refresh',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const result = await service.refresh({ refresh_token: 'old-refresh' });

      expect(result).toEqual({
        access_token: 'new-jwt',
        refresh_token: 'new-refresh',
        expires_in: 3600,
      });
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' },
      });

      await expect(
        service.refresh({ refresh_token: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/auth/auth.service.spec.ts --no-cache`
Expected: FAIL — `Cannot find module './auth.service'`

- [ ] **Step 3: Implement AuthService**

```typescript
// src/modules/auth/auth.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DRIZZLE } from '../../database/database.module';
import { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async register(dto: RegisterDto) {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      throw new BadRequestException(
        authError?.message ?? 'Failed to create user',
      );
    }

    // 2. Insert into our users table with the same ID
    let user: { id: string; email: string; name: string };
    try {
      [user] = await this.db
        .insert(schema.users)
        .values({
          id: authData.user.id,
          email: dto.email,
          name: dto.name,
        })
        .returning({ id: schema.users.id, email: schema.users.email, name: schema.users.name });
    } catch (dbError) {
      // Rollback: delete the Supabase Auth user to avoid inconsistent state
      await this.supabase.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException('Failed to create user profile');
    }

    // 3. Sign in to get tokens
    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (sessionError || !sessionData.session) {
      throw new BadRequestException('User created but login failed');
    }

    return {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_in: sessionData.session.expires_in,
      user,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid credentials',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email },
    };
  }

  async refresh(dto: RefreshDto) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid refresh token',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/auth/auth.service.spec.ts --no-cache`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/auth.service.ts src/modules/auth/auth.service.spec.ts
git commit -m "feat: implement AuthService with Supabase Auth proxy and rollback"
```

---

## Task 9: Auth Controller + Module Wiring

**Files:**
- Create: `src/modules/auth/auth.controller.ts`
- Create: `src/modules/auth/auth.controller.spec.ts`
- Create: `src/modules/auth/auth.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Write failing tests for AuthController**

```typescript
// src/modules/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test' };
      const expected = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com', name: 'Test' },
      };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/login', () => {
    it('should call authService.login and return tokens + user', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com' },
      };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call authService.refresh and return new tokens', async () => {
      const dto = { refresh_token: 'old-refresh' };
      const expected = { access_token: 'new-jwt', refresh_token: 'new-refresh', expires_in: 3600 };
      mockAuthService.refresh.mockResolvedValue(expected);

      const result = await controller.refresh(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(dto);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest src/modules/auth/auth.controller.spec.ts --no-cache`
Expected: FAIL — `Cannot find module './auth.controller'`

- [ ] **Step 3: Implement AuthController**

```typescript
// src/modules/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }
}
```

- [ ] **Step 4: Create AuthModule**

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 5: Register AuthModule in AppModule**

In `src/app.module.ts`, add AuthModule to imports:

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ... existing imports ...
    DatabaseModule,
    BikesModule,
    AuthModule,  // <-- add this
  ],
  controllers: [HealthController],
})
export class AppModule {}
```

- [ ] **Step 6: Run all tests and verify compilation**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx tsc --noEmit && npx jest --no-cache`
Expected: No errors, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/modules/auth/ src/app.module.ts
git commit -m "feat: implement auth module (register, login, refresh via Supabase Auth)"
```

---

## Task 10: Apply Auth Guards to Bikes Controller

**Files:**
- Modify: `src/modules/bikes/bikes.controller.ts`
- Modify: `src/modules/bikes/bikes.controller.spec.ts`

Now that auth is working, replace the temporary `x-user-id` header with proper JWT auth.

- [ ] **Step 1: Update BikesController to use auth guard**

Replace the entire `src/modules/bikes/bikes.controller.ts`:

```typescript
// src/modules/bikes/bikes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

@Controller('bikes')
@UseGuards(SupabaseAuthGuard)
export class BikesController {
  constructor(private bikesService: BikesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.bikesService.findAllByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBikeDto) {
    return this.bikesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBikeDto,
  ) {
    return this.bikesService.update(id, user.id, dto);
  }

  @Patch(':id/mileage')
  updateMileage(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMileageDto,
  ) {
    return this.bikesService.updateMileage(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bikesService.remove(id, user.id);
  }
}
```

- [ ] **Step 2: Update BikesController tests to use AuthUser mock**

Replace the entire `src/modules/bikes/bikes.controller.spec.ts`:

```typescript
// src/modules/bikes/bikes.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

describe('BikesController', () => {
  let controller: BikesController;
  const mockBikesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    updateMileage: jest.fn(),
    remove: jest.fn(),
  };
  const mockUser: AuthUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikesController],
      providers: [{ provide: BikesService, useValue: mockBikesService }],
    }).compile();

    controller = module.get<BikesController>(BikesController);
  });

  describe('GET /bikes', () => {
    it('should return all bikes for authenticated user', async () => {
      const bikes = [{ id: 'bike-1', model: 'Honda CB400X' }];
      mockBikesService.findAllByUser.mockResolvedValue(bikes);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(bikes);
      expect(mockBikesService.findAllByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('POST /bikes', () => {
    it('should create a bike for authenticated user', async () => {
      const dto = { model: 'Honda CB400X', year: 2023, plateNumber: 'FBA1234X', class: '2A' };
      const bike = { id: 'bike-1', userId: 'user-1', ...dto };
      mockBikesService.create.mockResolvedValue(bike);

      const result = await controller.create(mockUser, dto);

      expect(result).toEqual(bike);
      expect(mockBikesService.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('PATCH /bikes/:id', () => {
    it('should update a bike', async () => {
      const dto = { model: 'Honda CB400X Updated' };
      const updated = { id: 'bike-1', ...dto };
      mockBikesService.update.mockResolvedValue(updated);

      const result = await controller.update('bike-1', mockUser, dto);

      expect(result).toEqual(updated);
      expect(mockBikesService.update).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('PATCH /bikes/:id/mileage', () => {
    it('should update mileage', async () => {
      const dto = { currentMileage: 16000 };
      const updated = { id: 'bike-1', currentMileage: 16000 };
      mockBikesService.updateMileage.mockResolvedValue(updated);

      const result = await controller.updateMileage('bike-1', mockUser, dto);

      expect(result).toEqual(updated);
      expect(mockBikesService.updateMileage).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('DELETE /bikes/:id', () => {
    it('should delete a bike', async () => {
      const deleted = { id: 'bike-1' };
      mockBikesService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('bike-1', mockUser);

      expect(result).toEqual(deleted);
      expect(mockBikesService.remove).toHaveBeenCalledWith('bike-1', 'user-1');
    });
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest --no-cache`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/modules/bikes/bikes.controller.ts src/modules/bikes/bikes.controller.spec.ts
git commit -m "feat: apply SupabaseAuthGuard to BikesController"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx jest --no-cache --verbose`
Expected: All tests pass

- [ ] **Step 2: Start the server and verify routes**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npx nest start`

Verify endpoints respond (in a separate terminal):

```bash
# Health check
curl http://localhost:3000/health
# Expected: {"status":"ok",...}

# Auth endpoints exist (400 for missing body, not 404)
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/auth/register
# Expected: 400

curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/auth/login
# Expected: 400

# Bikes requires auth now (401 without token)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bikes
# Expected: 401
```

- [ ] **Step 3: Run linter**

Run: `cd /Users/hid/Developer/kickstand/apps/api && npm run lint`
Expected: No errors (fix any that appear)

- [ ] **Step 4: Clean up test user from Task 5**

```bash
cd /Users/hid/Developer/kickstand/apps/api && node -e "
const postgres = require('postgres');
require('dotenv/config');
const sql = postgres(process.env.SUPABASE_DATABASE_URL);
sql\`DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001'\`.then(() => { console.log('Test user cleaned up'); return sql.end(); });
"
```

- [ ] **Step 5: Final commit if any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes and cleanup"
```
