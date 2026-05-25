export interface LogRequest {
  session: string;
  id: string;
  minutes: number;
  timestamp: Date;
}

export interface RawLogRequest {
  session: string;
  id: string;
  minutes: number;
  timestamp: string;
}

export interface VerifyLogRequest {
  id: string;
  session: string;
  type: string;
}

export interface VerifyLogResponse {
  id: string;
  session: string;
  minutes: number;
}

export interface ProcessedAddRequest {
  response?: Response;
  log?: LogRequest;
}
