import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedDocument } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import { API_STATUS, APIError } from '@/types/general';
import { GetSharedDocumentResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_shared_document(
	req: NextApiRequest,
	res: NextApiResponse<GetSharedDocumentResponse | APIError>,
) {
	serverErrorHandler('GET', req, res, async() => {
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

		if (!document.public){
			res.status(API_STATUS.FORBIDDEN).json({
				status: API_STATUS.FORBIDDEN,
				message: 'This document is not publicly shared'
			});
			return;
		}

		const populatedDocument = await getPopulatedDocument(prisma, {id: document.id});

		res.status(API_STATUS.OK).json({
			document: populatedDocument
		});
	});
}