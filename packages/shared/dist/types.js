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
