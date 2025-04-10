import { PrismaClient } from '@prisma/client';
import { AxiosError } from 'axios';
import * as formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedDocument, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import FlaskClient from '@/services/flaskClient';
import { API_STATUS, APIError, VISIBILITY } from '@/types/general';
import { UploadDocumentResponse } from '@/types/server';

const prisma = new PrismaClient();

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function upload_document(
	req: NextApiRequest,
	res: NextApiResponse<UploadDocumentResponse | APIError>,
) {
	serverErrorHandler('POST', req, res, async() => {
		const token = verifyToken(req.headers.authorization, res);
		const flaskClient = new FlaskClient(process.env.FLASK_SERVER_URL as string, process.env.FLASK_SERVER_API_KEY as string);
                        
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

		const form = new formidable.IncomingForm();
		form.parse(req, async (err: unknown, fields: formidable.Fields, files: formidable.Files) => {
			if (err) {
				res.status(API_STATUS.BAD_REQUEST).json({
					status: API_STATUS.BAD_REQUEST,
					message: 'Error parsing form data'
				});
				return;
			}

			const fileName: string | undefined = fields?.fileName?.[0] || undefined;
			const filePublic: VISIBILITY | undefined = fields?.filePublic?.[0] as VISIBILITY || undefined;
			const file: formidable.File | undefined = files?.file?.[0] as formidable.File | undefined;

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

			console.log(fileData);

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
					public: filePublic === VISIBILITY.PUBLIC ? true : false,
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
	});
}