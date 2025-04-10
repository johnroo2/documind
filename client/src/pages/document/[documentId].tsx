import { AxiosError } from 'axios';
import { BookText, FileSpreadsheet } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BaseProps } from '@/pages/_app';
import documentService from '@/services/documentService';
import { BreadcrumbType } from '@/types/general';
import { PopulatedDocument } from '@/types/populations';

export default function DocumentView({ user }: BaseProps) {
	const params = useParams();
	const router = useRouter();
	const documentId = params?.documentId as string;

	const [document, setDocument] = useState<PopulatedDocument>();
	const [loading, setLoading] = useState(true);

	const sendHome = useCallback(() => {
		router.push(user ? '/dashboard' : '/');
		toast.warning('Page not found', {
			description: 'Sending you back home...'
		});
	}, [user, router]);

	useEffect(() => {
		if (!documentId) {
			return;
		}

		const fetchData = async () => {
			const res = await documentService.getDocument(documentId);

			if (res instanceof AxiosError) {
				toast.error(`Could not fetch document with id: ${documentId}`, {
					description: res?.response?.data?.message || 'An unexpected error occured while attempting to fetch document'
				});
				sendHome();
			} else {
				setDocument(res.document);
				setTimeout(() => setLoading(false), 3000);
			}
		};

		fetchData();
	}, [sendHome, documentId]);

	return (
		<div className='relative h-full'>
			<div className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white`}>
				<ScaleLoader />
				<div className="flex items-end gap-1.5">
					<p className="text-foreground">Loading document</p>
					<div id="loading-wave">
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
					</div>
				</div>
			</div>

			{document && (
				<div className='flex flex-col gap-4 p-6'>
					<div className='flex flex-row items-center gap-3'>
						<div className='border border-primary bg-primary/5 flex items-center justify-center p-2 rounded-full'>
							<BookText size={20} />
						</div>
						<div className='flex flex-col'>
							<h1 className='font-semibold text-lg'>{document.name}</h1>
							<p className='font-light text-xs'>{new Date(document.createdAt).toLocaleString()}</p>
						</div>
					</div>
					<div className="flex flex-row flex-wrap gap-3">
						{document.data.pages.map((page, index) => (
							<Card key={index} className="w-full md:basis-[calc(33%_-_1.5rem)] !p-2">
								<CardHeader className="flex flex-row items-center gap-2 !py-2">
									<FileSpreadsheet size={18} />
									<h2 className="font-semibold">{page.title}</h2>
								</CardHeader>
								<CardContent className='!pb-2'>
									<div className="space-y-1">
										{page.body.map((text, i) => (
											<p key={i} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

DocumentView.breadcrumb = JSON.stringify([{ name: 'Documents', isLink: false }] as BreadcrumbType[]);