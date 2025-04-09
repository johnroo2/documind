import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { deleteDocument, getPopulatedDocument, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { DeleteDocumentResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_document(
	req: NextApiRequest,
	res: NextApiResponse<DeleteDocumentResponse | APIError>,
) {
	serverErrorHandler('POST', req, res, async() => {
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

		const { documentId } = req.body;

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

		const populatedDocument = await getPopulatedDocument(prisma, {id: document.id});

		await deleteDocument(prisma, {id: document.id});

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});

		res.status(API_STATUS.OK).json({
			user: populatedUser,
			document: populatedDocument
		});
	});
}