import { Document, DocumentData, User } from '@prisma/client';

export interface Prisma_DS {
    createdAt: Date | string,
    updatedAt: Date | string
}

export interface ParsingBlock {
    block_type: 'page' | 'paragraph',
    block_text: string
}

export type PopulatedDocumentData = Omit<DocumentData, 'text'> & {
    text: ParsingBlock[];
}

export type PopulatedDocument = Document & {
    data: PopulatedDocumentData;
} & Prisma_DS

export type PopulatedUser = User & {
    documents: PopulatedDocument[];
} & Prisma_DS