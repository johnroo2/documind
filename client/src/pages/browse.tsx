import { useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';

import PublicDocumentTable from '@/components/browse/PublicDocumentTable';
import { Card } from '@/components/ui/card';
import documentService from '@/services/documentService';
import { BreadcrumbType } from '@/types/general';
import { PopulatedDocument } from '@/types/populations';

export default function Browse() {
	const [publicDocuments, setPublicDocuments] = useState<PopulatedDocument[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchPublicDocuments = async () => {
			setLoading(true);
			const response = await documentService.getPublicDocuments();
			if ('documents' in response) {
				setPublicDocuments(response.documents);
			}

			setTimeout(() => {
				setLoading(false);
			}, 3000);
		};

		fetchPublicDocuments();
	}, []);

	return (
		<div className='w-full h-full pb-4 relative'>
			<div
				className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white z-[500]`}
			>
				<ScaleLoader />
				<div className="flex items-end gap-1.5">
					<p className="text-foreground">Loading public documents</p>
					<div id="loading-wave">
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
					</div>
				</div>
			</div>
			<Card className='w-full h-full p-4 bg-white grid grid-rows-[auto_1fr] overflow-y-auto gap-4'>
				<div>
					<h1 className='font-medium text-base'>Public Documents</h1>
					<p className='text-muted-foreground text-sm'>
						Browse all publicly available documents
					</p>
				</div>
				<PublicDocumentTable documents={publicDocuments} />
			</Card>
		</div>
	);
}

Browse.breadcrumb = JSON.stringify([{ name: 'Browse', isLink: true, link: '/browse' }] as BreadcrumbType[]);
