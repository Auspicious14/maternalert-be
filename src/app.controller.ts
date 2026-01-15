import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Maternal Health Support API',
      clinical_safety_notice: 'CARE-SUPPORT TOOL - NOT A DIAGNOSTIC SYSTEM',
    };
  }

  @Get()
  @ApiOperation({ summary: 'API Root' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello() {
    return {
      message: 'Welcome to Maternal Health Support API',
      version: '1.0.0',
      docs: '/api/v1/docs',
      health: '/api/v1/health',
    };
  }
}
