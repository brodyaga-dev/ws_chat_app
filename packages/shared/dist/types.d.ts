import { z } from 'zod';
export declare const MessageSchema: z.ZodObject<{
    _id: z.ZodString;
    content: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    content: string;
    createdAt: string;
}, {
    _id: string;
    content: string;
    createdAt: string;
}>;
export declare const CreateMessageSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const WebSocketEventSchema: z.ZodObject<{
    type: z.ZodEnum<["NEW_MESSAGE"]>;
    payload: z.ZodObject<{
        _id: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        _id: string;
        content: string;
        createdAt: string;
    }, {
        _id: string;
        content: string;
        createdAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "NEW_MESSAGE";
    payload: {
        _id: string;
        content: string;
        createdAt: string;
    };
}, {
    type: "NEW_MESSAGE";
    payload: {
        _id: string;
        content: string;
        createdAt: string;
    };
}>;
export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>;
