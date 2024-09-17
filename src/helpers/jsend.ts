/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * JSend response style
 * 
 * This response style is based on JSend specification
 * 
 * https://github.com/omniti-labs/jsend
 * 
 * @class Jsend
 */
interface JSendSuccess<T> {
    status: 'success';
    data: T;
  }
  
  interface JSendFail {
    status: 'fail';
    data: Record<string, any>;
  }
  
  interface JSendError {
    status: 'error';
    message: string;
    code?: number;
    data?: Record<string, any>;
  }

class Jsend {
    static success<T>(data: T): JSendSuccess<T> {
        return { status: 'success', data };
    }

    static fail(data: Record<string, any>): JSendFail {
        return { status: 'fail', data };
    }

    static error({
        message,
        code,
        data
    }: {
        message: string;
        code?: number;
        data?: Record<string, any>;
    }): JSendError {
        return { status: 'error', message, code, data };
    }
}

export default Jsend;