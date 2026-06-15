import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function register(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function login(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function googleLogin(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateProfile(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=auth.d.ts.map