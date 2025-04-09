import { AxiosError } from 'axios';

import { Service } from '@/lib/serviceRoot';
import { APIError } from '@/types/general';
import { UploadFileResponse } from '@/types/server';

class FlaskClient extends Service {
	constructor(url: string) {
		super(url);
	}

	/**
     * Uploads a file to the Flask server
     * @param {File} file The file to upload
     * @returns {Promise<UploadFileResponse | AxiosError<APIError>>} The parsed response from the endpoint
     */
	async uploadFile(file: File): Promise<UploadFileResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<UploadFileResponse>(() => {
			const formData = new FormData();
			formData.append('file', file);
			return this.instance.post('/upload', formData, this.applyHeaders());
		})();
	}
}

const flaskClient = new FlaskClient(process.env.NEXT_PUBLIC_FLASK_CLIENT_URL as string);

export default flaskClient;
