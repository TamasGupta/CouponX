import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function createReview(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUserReviews(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=reviews.d.ts.map