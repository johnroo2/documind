import { AxiosError } from 'axios';

import { Service } from '@/lib/serviceRoot';
import { APIError, VISIBILITY } from '@/types/general';
import { DeleteDocumentResponse, EditDocumentResponse, GetDocumentResponse, UploadDocumentResponse } from '@/types/server';

class DocumentService extends Service {
	constructor(url: string) {
		super(url);
	}

	/**
	 * Deletes a document by id
	 * @param {string} documentId The document's id
	 * @returns {Promise<DeleteDocumentResponse | AxiosError<APIError>>} The updated user
	 */
	async deleteDocument(documentId: string): Promise<DeleteDocumentResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<DeleteDocumentResponse>(() =>
			this.instance.post('/api/document/delete-document', {
				documentId
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Edits a document's metadata
	 * @param {string} documentId The document's id
	 * @param {string} fileName New name for the document
	 * @param {VISIBILITY} filePublic New visibility for the document
	 * @returns {Promise<EditDocumentResponse | AxiosError<APIError>>} The updated user and document
	 */
	async editDocument(documentId: string, fileName: string, filePublic: VISIBILITY): Promise<EditDocumentResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<EditDocumentResponse>(() =>
			this.instance.post('/api/document/edit-document', {
				documentId,
				fileName,
				filePublic
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Gets a document by id
	 * @param {string} documentId The document's id
	 * @returns {Promise<GetDocumentResponse | AxiosError<APIError>>} The user and document if found
	 */
	async getDocument(documentId: string): Promise<GetDocumentResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<GetDocumentResponse>(() =>
			this.instance.get(`/api/document/get-document?id=${documentId}`, this.applyHeaders())
		)();
	}

	/**
	 * Uploads a new document
	 * @param {string} fileName Name for the document
	 * @param {VISIBILITY} filePublic Visibility for the document
	 * @param {File} file The file to upload
	 * @returns {Promise<UploadDocumentResponse | AxiosError<APIError>>} The updated user and new document
	 */
	async uploadDocument(fileName: string, filePublic: VISIBILITY, file: File): Promise<UploadDocumentResponse | AxiosError<APIError>> {
		const formData = new FormData();
		formData.append('fileName', fileName);
		formData.append('filePublic', filePublic.toString());
		formData.append('file', file);

		return this.safeAxiosApply<UploadDocumentResponse>(() =>
			this.instance.post('/api/document/upload-document', formData, this.applyHeaders())
		)();
	}
}

const documentService = new DocumentService(process.env.NEXT_PUBLIC_CLIENT_URL as string);

export default documentService;
