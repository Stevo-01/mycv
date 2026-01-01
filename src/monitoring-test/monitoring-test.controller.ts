import { Controller, Get, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Monitoring Tests')
@Controller('monitoring-test')
export class MonitoringTestController {
  private readonly logger = new Logger(MonitoringTestController.name);

  @Get('health-simple')
  @ApiOperation({ summary: 'Simple health check test' })
  @ApiResponse({ status: 200, description: 'Returns OK' })
  simpleHealth() {
    this.logger.log('Simple health check called');
    return { status: 'ok', message: 'Monitoring is working!' };
  }

  @Get('log-levels')
  @ApiOperation({ summary: 'Test all log levels' })
  @ApiResponse({ status: 200, description: 'Tests all Winston log levels' })
  testLogLevels() {
    this.logger.debug('This is a DEBUG log - only visible in development');
    this.logger.log('This is an INFO/LOG - normal operation');
    this.logger.warn('This is a WARNING - potential issue');
    this.logger.error('This is an ERROR - something failed');
    
    return {
      message: 'Check your console and logs/combined.log!',
      levels: ['debug', 'info', 'warn', 'error'],
      where: {
        console: 'Colored output in terminal',
        combined: 'logs/combined.log (all levels)',
        error: 'logs/error.log (only errors)'
      }
    };
  }

  @Get('error-400')
  @ApiOperation({ summary: 'Test 400 Bad Request error' })
  @ApiResponse({ status: 400, description: 'Returns 400 error' })
  test400Error() {
    this.logger.warn('Testing 400 error');
    throw new HttpException('Bad Request - Invalid input', HttpStatus.BAD_REQUEST);
  }

  @Get('error-401')
  @ApiOperation({ summary: 'Test 401 Unauthorized error' })
  @ApiResponse({ status: 401, description: 'Returns 401 error' })
  test401Error() {
    this.logger.warn('Testing 401 error');
    throw new HttpException('Unauthorized - Please login', HttpStatus.UNAUTHORIZED);
  }

  @Get('error-404')
  @ApiOperation({ summary: 'Test 404 Not Found error' })
  @ApiResponse({ status: 404, description: 'Returns 404 error' })
  test404Error() {
    this.logger.warn('Testing 404 error');
    throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
  }

  @Get('error-500')
  @ApiOperation({ summary: 'Test 500 Internal Server Error' })
  @ApiResponse({ status: 500, description: 'Returns 500 error' })
  test500Error() {
    this.logger.error('Testing 500 error - this should appear in logs/error.log');
    throw new Error('Internal Server Error - Something went wrong!');
  }

  @Get('error-uncaught')
  @ApiOperation({ summary: 'Test uncaught exception' })
  @ApiResponse({ status: 500, description: 'Tests uncaught exception handling' })
  testUncaughtError() {
    this.logger.error('Testing uncaught exception');
    // Simulate an uncaught error
    const obj: any = null;
    return obj.property; // This will throw TypeError
  }

  @Get('slow-request')
  @ApiOperation({ summary: 'Test slow request (3 seconds)' })
  @ApiResponse({ status: 200, description: 'Returns after 3 seconds' })
  async testSlowRequest() {
    this.logger.log('Starting slow request - should take 3 seconds');
    
    // Simulate slow operation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.logger.log('Slow request completed');
    return {
      message: 'This request took 3 seconds',
      note: 'Check the console - it should show response time ~3000ms'
    };
  }

  @Post('log-with-data')
  @ApiOperation({ summary: 'Test logging with request data' })
  @ApiResponse({ status: 201, description: 'Logs the posted data' })
  testLogWithData(@Body() data: any) {
    this.logger.log('Received POST request with data', JSON.stringify(data));
    
    return {
      message: 'Data logged successfully',
      received: data,
      note: 'Check console and logs/combined.log to see the logged data'
    };
  }

  @Get('stress-test')
  @ApiOperation({ summary: 'Create multiple log entries' })
  @ApiResponse({ status: 200, description: 'Creates 10 log entries' })
  stressTest() {
    this.logger.log('Starting stress test - creating 10 log entries');
    
    for (let i = 1; i <= 10; i++) {
      this.logger.log(`Stress test log entry ${i}/10`);
    }
    
    this.logger.log('Stress test completed');
    
    return {
      message: 'Created 10 log entries',
      note: 'Check logs/combined.log - you should see 12 entries total (start, 10 entries, end)'
    };
  }

  @Get('mixed-responses')
  @ApiOperation({ summary: 'Test multiple HTTP status codes' })
  @ApiResponse({ status: 200, description: 'Returns info about HTTP status testing' })
  getMixedResponsesInfo() {
    return {
      message: 'Use these endpoints to test different HTTP status codes',
      endpoints: [
        'GET /monitoring-test/error-400 - Bad Request',
        'GET /monitoring-test/error-401 - Unauthorized',
        'GET /monitoring-test/error-404 - Not Found',
        'GET /monitoring-test/error-500 - Server Error',
      ],
      note: 'Each will log at different levels based on status code'
    };
  }

  @Get('test-all')
  @ApiOperation({ summary: 'Run all monitoring tests' })
  @ApiResponse({ status: 200, description: 'Runs multiple tests' })
  async testAll() {
    const results: Array<{ test: string; status: string }> = [];

    // Test 1: Log levels
    this.logger.log('TEST 1: Testing log levels');
    this.logger.debug('Debug message');
    this.logger.log('Info message');
    this.logger.warn('Warning message');
    results.push({ test: 'Log Levels', status: 'completed' });

    // Test 2: Slow request simulation
    this.logger.log('TEST 2: Testing slow request');
    await new Promise(resolve => setTimeout(resolve, 1000));
    results.push({ test: 'Slow Request (1s)', status: 'completed' });

    // Test 3: Multiple rapid logs
    this.logger.log('TEST 3: Testing rapid logging');
    for (let i = 1; i <= 5; i++) {
      this.logger.log(`Rapid log ${i}/5`);
    }
    results.push({ test: 'Rapid Logging (5 entries)', status: 'completed' });

    return {
      message: 'All monitoring tests completed',
      results,
      instructions: {
        console: 'Check your terminal for colored log output',
        files: 'Check logs/combined.log for JSON formatted logs',
        errors: 'Check logs/error.log (should be empty for this test)',
        http: 'HTTP logger should show this request with timing'
      }
    };
  }
}
