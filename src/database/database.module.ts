import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Database Module (Prisma)
 *
 * ORM CHOICE: Prisma
 *
 * JUSTIFICATION:
 * - Type-safe database client with excellent TypeScript support
 * - Intuitive schema definition language
 * - Automatic migration generation
 * - Built-in connection pooling
 * - Great developer experience with Prisma Studio
 * - Strong PostgreSQL support
 *
 * CLINICAL SAFETY CONSIDERATIONS:
 * - All entities will enforce strict validation at schema level
 * - Type safety prevents invalid data operations
 * - Audit logging capabilities via middleware
 * - Transaction support for data integrity
 * - No raw SQL for sensitive operations (use Prisma queries)
 *
 * This module is marked as @Global so PrismaService is available
 * throughout the application without repeated imports
 */

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
