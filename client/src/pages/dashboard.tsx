import { Upload } from 'lucide-react';
import { useState } from 'react';

import DocumentTable from '@/components/dashboard/DocumentTable';
import UploadFilesModal from '@/components/modals/UploadFilesModal';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAvatar } from '@/lib/utils';
import { BaseProps } from '@/pages/_app';
import { BreadcrumbType } from '@/types/general';

export default function Dashboard({ user, setUser }: BaseProps) {
	const [uploadFilesModalOpen, setUploadFilesModalOpen] = useState<boolean>(false);

	if (!user) return <></>;

	return (
		<>
			<div className='w-full h-full pb-4'>
				<Card className='w-full h-full p-4 bg-white grid grid-rows-[auto_1fr] overflow-y-auto gap-4'>
					<div className='flex justify-between items-center gap-4'>
						<div className='flex items-center gap-3'>
							<Avatar className={'size-8 m-0.5 rounded-full'} style={getAvatar(user.username)} />
							<div>
								<h1 className='font-medium text-base'>Welcome, {user.username}!</h1>
								<p className='text-muted-foreground text-sm'>
									{user.documents.length > 0 ? 'Process a new document or view an existing one!' : 'Process your first document here!'}
								</p>
							</div>
						</div>
						<Button
							className='flex items-center gap-2'
							variant='ghost'
							disabled={uploadFilesModalOpen}
							onClick={() => { setUploadFilesModalOpen(true); }}
						>
							<Upload />
							Upload Files
						</Button>
					</div>
					<DocumentTable
						documents={user.documents}
						setUser={setUser}
					/>
				</Card>
			</div>
			<UploadFilesModal
				open={uploadFilesModalOpen}
				onClose={() => { setUploadFilesModalOpen(false); }}
				user={user}
				setUser={setUser}
			/>
		</>
	);
}

Dashboard.breadcrumb = JSON.stringify([{ name: 'Dashboard', isLink: true, link: '/dashboard' }] as BreadcrumbType[]);