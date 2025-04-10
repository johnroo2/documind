import { ArrowRight, ChevronDown, Ellipsis, Send } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import PublicDocumentTableEmpty from './PublicDocumentTableEmpty';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PopulatedDocument } from '@/types/populations';

interface PublicDocumentTableProps {
	documents: PopulatedDocument[];
}

export default function PublicDocumentTable({ documents }: PublicDocumentTableProps) {
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

	const filteredDocuments = useMemo(() => {
		return documents.filter((document) =>
			document.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(visibilityFilter === 'all' || (visibilityFilter === 'public' && document.public) || (visibilityFilter === 'private' && !document.public))
		).sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
	}, [documents, searchTerm, sortOrder, visibilityFilter]);

	const handleNavigate = (document: PopulatedDocument) => {
		router.push(`/shared-document/${document.id}`);
	};

	const handleShare = (document: PopulatedDocument) => {
		const shareUrl = `${window.location.origin}/shared-document/${document.id}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success('Link copied to clipboard!');
	};

	const resetFilters = () => {
		setSortOrder('asc');
		setVisibilityFilter('all');
		setSearchTerm('');
	};

	return (
		<>
			<div className='grid grid-rows-[auto_auto_1fr]'>
				<div className="flex gap-4 mb-4">
					<Input
						type="text"
						className='max-w-[250px]'
						placeholder="Search..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-1/5">Creator</TableHead>
							<TableHead className="w-2/5">Document Name</TableHead>
							<TableHead className="w-1/5 text-center">
								<button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center w-full">
									Upload Date
									<ChevronDown
										className={`ml-1 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
										size={16}
									/>
								</button>
							</TableHead>
							<TableHead className="w-1/5 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredDocuments && filteredDocuments.length > 0 && (
							filteredDocuments.map((document) => (
								<TableRow key={document.id}>
									<TableCell className="w-1/5">{document.creator}</TableCell>
									<TableCell className="w-2/5"><a href={`/shared-document/${document.id}`}>{document.name}</a></TableCell>
									<TableCell className="w-1/5 text-center">{new Date(document.createdAt).toLocaleString('en-US')}</TableCell>
									<TableCell className="w-1/5 text-center">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Ellipsis size={20} />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													className='flex items-center gap-2'
													onClick={() => handleNavigate(document)}
												>
													<ArrowRight size={16} />
													View
												</DropdownMenuItem>
												<DropdownMenuItem
													className='flex items-center gap-2'
													onClick={() => handleShare(document)}
												>
													<Send size={16} />
													Share
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				{!filteredDocuments || filteredDocuments.length === 0 && <PublicDocumentTableEmpty reset={resetFilters} />}
			</div>
		</>
	);
}