import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function createConversation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getConversations(req: AuthRequest, res: Response): Promise<void>;
export declare function getMessages(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function sendMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=chat.d.ts.map