import { ArrowRight, ChevronDown, Edit, Ellipsis, Globe, Lock, Trash, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import DocumentTableEmpty from './DocumentTableEmpty';

import DeleteDocumentModal from '@/components/modals/DeleteDocumentModal';
import EditDocumentModal from '@/components/modals/EditDocumentModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PopulatedDocument, PopulatedUser } from '@/types/populations';

interface DocumentTableProps {
	documents: PopulatedDocument[];
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>
}

export default function DocumentTable({ documents, setUser }: DocumentTableProps) {
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

	const [deleteFocus, setDeleteFocus] = useState<PopulatedDocument>();
	const [editFocus, setEditFocus] = useState<PopulatedDocument>();

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
		router.push(`/document/${document.id}`);
	};

	const handleDelete = (document: PopulatedDocument) => {
		setDeleteFocus(document);
	};

	const handleModify = (document: PopulatedDocument) => {
		setEditFocus(document);
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
							<TableHead className="w-2/5">Document Name</TableHead>
							<TableHead className="w-1/5 text-center">
								<button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center w-full">
									Created
									<ChevronDown
										className={`ml-1 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
										size={16}
									/>
								</button>
							</TableHead>
							<TableHead className="w-1/5">
								<div className="flex flex-row items-center justify-center w-full gap-3">
									<span>Visibility</span>
									<div className="flex">
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('all')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'all' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Users size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: All</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('public')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'public' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Globe size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: Public</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('private')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'private' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Lock size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: Private</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</TableHead>
							<TableHead className="w-1/5 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredDocuments && filteredDocuments.length > 0 && (
							filteredDocuments.map((document) => (
								<TableRow key={document.id}>
									<TableCell className="w-2/5"><a href={`/document/${document.id}`}>{document.name}</a></TableCell>
									<TableCell className="w-1/5 text-center">{new Date(document.createdAt).toLocaleString()}</TableCell>
									<TableCell className="w-1/5 text-center">{document.public ? 'Public' : 'Private'}</TableCell>
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
													disabled={deleteFocus ? true : false}
													className='flex items-center gap-2'
													onClick={() => handleModify(document)}
												>
													<Edit size={16} />
													Modify
												</DropdownMenuItem>
												<DropdownMenuItem
													disabled={editFocus ? true : false}
													className='flex items-center gap-2 !text-red-600 hover:!bg-red-50'
													onClick={() => handleDelete(document)}
												>
													<Trash size={16} className='text-red-600' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				{!filteredDocuments || filteredDocuments.length === 0 && <DocumentTableEmpty reset={resetFilters} />}
			</div>
			<DeleteDocumentModal
				open={deleteFocus ? true : false}
				onClose={() => { setDeleteFocus(undefined); }}
				setUser={setUser}
				focus={deleteFocus}
			/>
			<EditDocumentModal
				open={editFocus ? true : false}
				onClose={() => { setEditFocus(undefined); }}
				setUser={setUser}
				focus={editFocus}
			/>
		</>
	);
}