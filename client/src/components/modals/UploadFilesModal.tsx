import { AxiosError } from 'axios';
import { CheckCircle2, CircleDashed, Upload, XCircle } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUploader } from '@/components/ui/dropzone';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import documentService from '@/services/documentService';
import { VISIBILITY } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

interface UploadFilesModalProps {
	open: boolean;
	onClose: () => void;
	user: PopulatedUser;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
}

interface FileLoadingStatus {
	loading: boolean;
	done: boolean;
	error: boolean;
}

export default function UploadFilesModal({ open, onClose, user, setUser }: UploadFilesModalProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMap, setLoadingMap] = useState<Map<string, FileLoadingStatus>>(new Map());

	useEffect(() => {
		setFiles([]);
		setLoading(false);
		setLoadingMap(new Map());
	}, [open]);

	const handleUpload = async () => {
		if (!files) {
			toast.error('Could not upload files', {
				description: 'Upload at least one file!'
			});
		}

		setLoading(true);
		setLoadingMap(() => {
			const newMap = new Map<string, FileLoadingStatus>();

			for (const fileIndex in files) {
				const file = files[fileIndex];

				newMap.set(`${file.name}-${fileIndex}`, { loading: false, done: false, error: false });
			}

			return newMap;
		});

		let newUser: PopulatedUser = { ...user };
		let uploadedFiles: number = 0;

		for (const fileIndex in files) {
			setLoadingMap(prev => {
				const newMap = new Map(prev);

				newMap.set(`${file.name}-${fileIndex}`, { loading: true, done: false, error: false });

				return newMap;
			});

			const file = files[fileIndex];

			const res = await documentService.uploadDocument(file.name, VISIBILITY.PRIVATE, file);

			if (res instanceof AxiosError) {
				setLoadingMap(prev => {
					const newMap = new Map(prev);

					newMap.set(`${file.name}-${fileIndex}`, { loading: false, done: true, error: true });

					return newMap;
				});

				toast.error(`Error parsing document ${fileIndex + 1}`, {
					description: res?.response?.data?.message || 'An unexpected error occured while attempting document parsing'
				});
			} else {
				uploadedFiles += 1;
				newUser = { ...res.user };
				setUser(newUser);
			}

			setLoadingMap(prev => {
				const newMap = new Map(prev);

				newMap.set(`${file.name}-${fileIndex}`, { loading: false, done: true, error: false });

				return newMap;
			});
		}

		setTimeout(() => {
			setUser(newUser);
			setLoading(false);

			if (uploadedFiles > 0) {
				toast.success('Documents uploaded succesfully', {
					description: `${uploadedFiles} new documents have been uploaded and processed`
				});
			}

			onClose();
		}, 500);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent className='max-h-[95vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Upload size={16} />
						Upload Files
					</DialogTitle>
				</DialogHeader>
				<Tabs value={loading ? 'loading' : 'upload'}>
					<TabsContent value='upload'>
						<FileUploader
							value={files}
							onValueChange={v => { setFiles(v); }}
							maxFileCount={3}
							accept={{ 'application/pdf': ['.pdf'] }}
						/>
						<DialogFooter className='flex justify-end items-center gap-3 w-full mt-4'>
							<Button
								variant='secondary'
								onClick={onClose}
							>
								Close
							</Button>
							<Button
								disabled={loading}
								onClick={handleUpload}
							>
								Process Files
							</Button>
						</DialogFooter>
					</TabsContent>
					<TabsContent value='loading'>
						<div className="space-y-4 py-4">
							{Array.from(loadingMap.entries()).map(([key, status]) => (
								<div
									key={key}
									className={`flex items-center justify-between gap-4 p-4 border rounded-lg transition-colors ${status.error ? 'border-red-200 bg-red-50' :
										status.done ? 'border-green-200 bg-green-50' :
											status.loading ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}
								>
									<div className="flex items-center gap-3">
										{status.loading ? (
											<CircleDashed size={18} className="text-yellow-600 animate-spin" />
										) : status.error ? (
											<XCircle size={18} className="text-red-600" />
										) : status.done ? (
											<CheckCircle2 size={18} className="text-green-600" />
										) : (
											<CircleDashed size={18} className="text-gray-400" />
										)}
										<span className="text-sm font-medium">{key.split('-')[0]}</span>
									</div>
									<div className={`text-sm font-medium ${status.loading ? 'text-yellow-700' :
										status.error ? 'text-red-700' :
											status.done ? 'text-green-700' : 'text-gray-500'}`}>
										{status.loading ? 'Loading...' :
											status.error ? 'Failed' :
												status.done ? 'Complete' : 'Waiting'}
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog >
	);
}