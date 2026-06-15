import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function listOffers(req: AuthRequest, res: Response): Promise<void>;
export declare function getOffer(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createOffer(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateOffer(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteOffer(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function myOffers(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=offers.d.ts.map