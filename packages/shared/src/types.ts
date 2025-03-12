import { z } from 'zod';

export const MessageSchema = z.object({
  _id: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const CreateMessageSchema = z.object({
  content: z.string(),
});

export const WebSocketEventSchema = z.object({
  type: z.enum(['NEW_MESSAGE']),
  payload: MessageSchema,
});

export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>; 