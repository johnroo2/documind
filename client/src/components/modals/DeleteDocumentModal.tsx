import { AxiosError } from 'axios';
import { Trash } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import documentService from '@/services/documentService';
import { PopulatedDocument, PopulatedUser } from '@/types/populations';

interface DeleteDocumentModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>,
	focus?: PopulatedDocument;
}

export default function DeleteDocumentModal({
	open,
	onClose,
	setUser,
	focus
}: DeleteDocumentModalProps) {

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
	}, [open]);

	const handleDeleteDocument = async () => {
		if (!focus) {
			toast.error('Could not delete document', {
				description: 'Document ID does not exist'
			});
			return;
		}

		setLoading(true);

		const res = await documentService.deleteDocument(focus.id);

		if (res instanceof AxiosError) {
			toast.error('Error while deleting document', {
				description: res?.response?.data?.message || 'An unexpected error occured while handling document deletion'
			});
		} else {
			toast.success('Document deleted successfully', {
				description: `Document ${res.document.name} has been deleted`
			});
			setUser(res.user);
		}

		setLoading(false);
		onClose();
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Trash size={16} />
						Delete Document
					</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-left">
					Are you sure you want to delete the document <b>{focus?.name}</b>?
					Warning: this action cannot be undone.
				</p>
				<DialogFooter className='flex justify-end items-center gap-3'>
					<Button
						variant='secondary'
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant='destructive'
						disabled={loading}
						onClick={handleDeleteDocument}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}