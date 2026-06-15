import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function createOrder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMyOrders(req: AuthRequest, res: Response): Promise<void>;
export declare function updateOrderStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=orders.d.ts.map