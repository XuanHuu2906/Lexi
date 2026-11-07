import { ArgumentsHost, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('Private request error logging', () => {
  it('never logs raw error stacks, request queries or URL identifiers', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/tutor/private-id?prompt=private-prompt',
        }),
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    new AllExceptionsFilter().catch(
      new Error('private-password private-prompt'),
      host,
    );
    expect(logger).toHaveBeenCalledWith('POST request failed (500)');
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/tutor/private-id',
        message: 'Internal server error',
      }),
    );
    logger.mockRestore();
  });
});
