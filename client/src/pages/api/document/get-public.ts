import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedDocument, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { GetPublicDocumentsResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_public_documents(
	req: NextApiRequest,
	res: NextApiResponse<GetPublicDocumentsResponse | APIError>,
) {
	serverErrorHandler('GET', req, res, async() => {
		const token = verifyToken(req.headers.authorization, res);
                        
		if (!token){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Authentication failed'
			});
			return;
		}

		const user = await getPopulatedUser(prisma, {id: token.id});
        
		if (!user){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Request token is not from a valid user'
			});
			return;
		}

		const publicDocuments = await prisma.document.findMany({
			where: {
				public: true
			},
			orderBy: {
				updatedAt: 'desc'
			}
		});

		if (!publicDocuments || publicDocuments.length === 0) {
			res.status(API_STATUS.OK).json({
				documents: []
			});
			return;
		}

		const populatedDocuments = await Promise.all(
			publicDocuments.map(doc => getPopulatedDocument(prisma, { id: doc.id }))
		);

		const filteredDocuments = populatedDocuments.filter(Boolean);

		res.status(API_STATUS.OK).json({
			documents: filteredDocuments
		});
	});
}