import { AxiosError } from 'axios';
import { Edit } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import documentService from '@/services/documentService';
import { VISIBILITY } from '@/types/general';
import { PopulatedDocument, PopulatedUser } from '@/types/populations';

interface EditDocumentModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>,
	focus?: PopulatedDocument;
}

export default function EditDocumentModal({
	open,
	onClose,
	setUser,
	focus
}: EditDocumentModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [name, setName] = useState<string>('');
	const [isPublic, setIsPublic] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
		if (focus) {
			setName(focus.name);
			setIsPublic(focus.public);
		}
	}, [open, focus]);

	const handleEditDocument = async () => {
		if (!focus) {
			toast.error('Could not edit document', {
				description: 'Document ID does not exist'
			});
			return;
		}

		if (!name.trim()) {
			toast.error('Could not edit document', {
				description: 'Document name cannot be empty'
			});
			return;
		}

		setLoading(true);

		const res = await documentService.editDocument(focus.id, name, isPublic ? VISIBILITY.PUBLIC : VISIBILITY.PRIVATE);

		if (res instanceof AxiosError) {
			toast.error('Error while editing document', {
				description: res?.response?.data?.message || 'An unexpected error occurred while handling document edit'
			});
		} else {
			toast.success('Document edited successfully', {
				description: `Document ${res.document.name} has been updated`
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
						<Edit size={16} />
						Edit Document
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={(e) => {
					e.preventDefault();
					handleEditDocument();
				}}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Document Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Document Name"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="public">Make document public</Label>
							<Switch
								id="public"
								checked={isPublic}
								onCheckedChange={setIsPublic}
							/>
						</div>
					</div>
				</form>
				<DialogFooter className='flex justify-end items-center gap-3'>
					<Button
						variant='secondary'
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						disabled={loading}
						onClick={handleEditDocument}
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
