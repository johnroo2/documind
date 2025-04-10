import { AxiosError } from 'axios';
import { BookText, FileSpreadsheet } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationPrevious,
	PaginationNext,
} from '@/components/ui/pagination';
import { BaseProps } from '@/pages/_app';
import documentService from '@/services/documentService';
import { BreadcrumbType } from '@/types/general';
import { PopulatedDocument } from '@/types/populations';

export default function SharedDocumentView({ user }: BaseProps) {
	const params = useParams();
	const router = useRouter();
	const documentId = params?.documentId as string;

	const [document, setDocument] = useState<PopulatedDocument>();
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);

	const sendHome = useCallback(() => {
		router.push(user ? '/dashboard' : '/');
		toast.warning('Document not found', {
			description: 'Sending you back home...',
		});
	}, [user, router]);

	useEffect(() => {
		if (!documentId) {
			return;
		}

		const fetchData = async () => {
			const res = await documentService.getSharedDocument(documentId);

			if (res instanceof AxiosError) {
				toast.error(`Could not fetch document with id: ${documentId}`, {
					description:
						res?.response?.data?.message ||
						'An unexpected error occured while attempting to fetch document',
				});
				sendHome();
			} else {
				setDocument(res.document);
				setTimeout(() => setLoading(false), 3000);
			}
		};

		fetchData();
	}, [sendHome, documentId]);

	const handlePageChange = (pageIndex: number) => {
		setCurrentPage(pageIndex);
	};

	const renderPaginationItems = () => {
		if (!document) return null;

		const totalPages = document.data.pages.length;

		if (totalPages <= 7) {
			return document.data.pages.map((_, index) => (
				<PaginationItem key={index}>
					<PaginationLink
						isActive={index === currentPage}
						onClick={() => handlePageChange(index)}
					>
						{index + 1}
					</PaginationLink>
				</PaginationItem>
			));
		}

		const items = [];

		let startIdx, endIdx;

		if (currentPage < 3) {
			startIdx = 0;
			endIdx = 6;
		} else if (currentPage > totalPages - 4) {
			startIdx = totalPages - 7;
			endIdx = totalPages - 1;
		} else {
			startIdx = currentPage - 3;
			endIdx = currentPage + 3;
		}

		for (let i = startIdx; i <= endIdx; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink
						isActive={i === currentPage}
						onClick={() => handlePageChange(i)}
					>
						{i + 1}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	return (
		<div className="relative h-full overflow-y-auto">
			<div
				className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white`}
			>
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
				<div className="grid grid-rows-[auto_1fr_auto] h-full gap-2 p-6 overflow-y-auto">
					<div className="flex flex-row items-center gap-3">
						<div className="border border-primary bg-primary/5 flex items-center justify-center p-2 rounded-full">
							<BookText size={20} />
						</div>
						<div className="flex flex-col">
							<h1 className="font-semibold text-lg">{document.name}</h1>
							<p className="font-light text-sm">
								{document.data.pages.length} {document.data.pages.length === 1 ? 'page' : 'pages'}, {new Date(document.createdAt).toLocaleString('en-US')}
							</p>
						</div>
					</div>
					<Card
						key={currentPage}
						className="w-full !p-2 !overflow-y-auto"
					>
						<CardHeader className="flex flex-row items-center gap-2 !py-2">
							<FileSpreadsheet size={18} />
							<h2 className="font-semibold">{document.data.pages[currentPage].title}</h2>
						</CardHeader>
						<CardContent className="!pb-2">
							<div className="space-y-1">
								{document.data.pages[currentPage].body.map((text, i) => (
									<p
										key={i}
										className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
									>
										{text}
									</p>
								))}
							</div>
						</CardContent>
					</Card>
					<Pagination className="mt-4">
						<PaginationContent>
							<PaginationPrevious
								onClick={() =>
									handlePageChange(
										Math.max(0, currentPage - 1)
									)
								}
							/>
							{renderPaginationItems()}
							<PaginationNext
								onClick={() =>
									handlePageChange(
										Math.min(
											document.data.pages.length - 1,
											currentPage + 1
										)
									)
								}
							/>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}

SharedDocumentView.breadcrumb = JSON.stringify([
	{ name: 'Shared Document', isLink: false },
] as BreadcrumbType[]);