import { PrismaClient } from '@prisma/client';
import { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedDocument, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import flaskClient from '@/services/flaskClient';
import { API_STATUS, APIError, VISIBILITY } from '@/types/general';
import { UploadDocumentResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function upload_document(
	req: NextApiRequest,
	res: NextApiResponse<UploadDocumentResponse | APIError>,
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

		const { fileName, filePublic, file } = req.body;

		if (!fileName){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing file name'
			});
			return;
		}

		if (![VISIBILITY.PUBLIC, VISIBILITY.PRIVATE].includes(filePublic as VISIBILITY)){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Invalid file visibility'
			});
			return;
		}

		if (!file){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing file'
			});
			return;
		}

		const fileData = await flaskClient.uploadFile(file);

		if (fileData instanceof AxiosError){
			res.status(API_STATUS.INTERNAL_SERVER_ERROR).json({
				status: API_STATUS.INTERNAL_SERVER_ERROR,
				message: 'Failed to upload file: ' + fileData.response?.data.message
			});
			return;
		}

		if (fileData.status !== API_STATUS.OK){
			res.status(API_STATUS.INTERNAL_SERVER_ERROR).json({
				status: API_STATUS.INTERNAL_SERVER_ERROR,
				message: 'Failed to upload file: ' + fileData.message
			});
			return;
		}

		const { result } = fileData;
        
		const documentData = await prisma.documentData.create({
			data: {
				text: JSON.stringify(result),
				documentId: ''
			}
		});

		const document = await prisma.document.create({
			data: {
				name: fileName,
				public: filePublic,
				userId: user.id,
				dataId: documentData.id
			}
		});

		await prisma.documentData.update({
			where: {
				id: documentData.id
			},
			data: {
				documentId: document.id
			}
		});

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});
		const populatedDocument = await getPopulatedDocument(prisma, {id: document.id});

		res.status(API_STATUS.OK).json({
			user: populatedUser,
			document: populatedDocument
		});
	});
}