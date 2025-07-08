import { NotificationChannel } from '@prisma/client';

export interface MessageAdapter {
  sendMessage(to: string, message: string, options?: any): Promise<MessageResponse>;
  verifyWebhook(payload: any, signature?: string): boolean;
  parseResponse(payload: any): MessageEvent;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MessageEvent {
  from: string;
  text: string;
  timestamp: Date;
  messageId: string;
  type: 'text' | 'button' | 'media' | 'location';
  buttonPayload?: string;
}
