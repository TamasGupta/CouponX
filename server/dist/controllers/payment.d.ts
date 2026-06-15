import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function createRazorpayOrder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function verifyPayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.d.ts.map