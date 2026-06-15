import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function listCategories(_req: AuthRequest, res: Response): Promise<void>;
export declare function searchCategories(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createCategory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=categories.d.ts.map