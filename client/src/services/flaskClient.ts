import { AxiosError } from 'axios';
import * as formidable from 'formidable';
import * as fs from 'fs';

import { Service } from '@/lib/serviceRoot';
import { APIError } from '@/types/general';
import { UploadFileResponse } from '@/types/server';

class FlaskClient extends Service {
	constructor(url: string) {
		super(url);
	}

	/**
     * Uploads a file to the Flask server
     * @param {formidable.File} file The file to upload
     * @returns {Promise<UploadFileResponse | AxiosError<APIError>>} The parsed response from the endpoint
     */
	async uploadFile(file: formidable.File): Promise<UploadFileResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<UploadFileResponse>(async () => {
			const formData = new FormData();
			const fileData = await fs.promises.readFile(file.filepath);
			const fileBlob = new Blob([fileData], { type: file.mimetype || 'application/octet-stream' });
			formData.append('file', fileBlob, file.originalFilename || 'file');
			return this.instance.post('/upload', formData);
		})();
	}
}

const flaskClient = new FlaskClient(process.env.NEXT_PUBLIC_FLASK_CLIENT_URL as string);

export default flaskClient;
