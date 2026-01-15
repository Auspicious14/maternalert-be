import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma Service
 *
 * Provides database access throughout the application
 * Handles connection lifecycle and health checks
 *
 * CLINICAL SAFETY CONSIDERATIONS:
 * - All queries are type-safe
 * - Automatic connection pooling
 * - Transaction support for data integrity
 * - Query logging in development
 */

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maintain up to 10 connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false, // Required for Neon in some environments
      },
    });
    
    // Log pool errors
    pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });

    super({
      adapter: new PrismaPg(pool),
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }

  /**
   * Connect to database on module initialization
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Database connection successful");

      // Test the connection
      await this.$queryRaw`SELECT 1`;
      this.logger.log("📊 Database health check passed");
    } catch (error) {
      this.logger.error("❌ Database connection failed", error);
      throw error;
    }
  }

  /**
   * Disconnect from database on module destruction
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("🔌 Database disconnected");
  }

  /**
   * Get database health status
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database info (safe, no credentials)
   */
  getDatabaseInfo() {
    return {
      provider: "postgresql",
      isConnected: true, // If we can call this, we're connected
    };
  }
}
