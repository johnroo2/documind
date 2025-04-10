import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedDocument, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { GetDocumentResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_document(
	req: NextApiRequest,
	res: NextApiResponse<GetDocumentResponse | APIError>,
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

		const documentId = req.query.id as string;

		if (!documentId){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing document id'
			});
			return;
		}

		const document = await prisma.document.findUnique({
			where: {
				id: documentId
			}
		});

		if (!document){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Document not found'
			});
			return;
		}

		if (!document.public && document.userId !== user.id){
			res.status(API_STATUS.FORBIDDEN).json({
				status: API_STATUS.FORBIDDEN,
				message: 'Access to document denied'
			});
			return;
		}

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});
		const populatedDocument = await getPopulatedDocument(prisma, {id: document.id});

		res.status(API_STATUS.OK).json({
			user: populatedUser,
			document: populatedDocument
		});
	});
}