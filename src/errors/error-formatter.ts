import { GraphQLError } from 'graphql';

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = details;
  }
}

export function formatError(error: GraphQLError) {
  if (error.originalError instanceof CustomError) {
    return {
      message: error.message,
      code: error.originalError.code,
      details: error.originalError.additionalInfo,
    };
  } else {
    return {
      message: 'Internal Server Error. Something went wrong. Please, try again.',
      code: 500,
      details: error.message,
    };
  }
}
