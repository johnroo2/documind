import { Prisma, PrismaClient } from '@prisma/client';

import { ParsingBlock, PopulatedDocument, PopulatedUser } from '@/types/populations';

//these functions are for population operations, add your own if you want
//unfortunately we use sqlite and have to do this

export async function getPopulatedUser(prisma: PrismaClient, query: Prisma.UserWhereUniqueInput){
	const user = await prisma.user.findFirstOrThrow({
		where: query,
		include: {
			settings: true
		}
	});

	const baseDocuments = await prisma.document.findMany({
		where: { userId: user.id}
	});

	const documents: PopulatedDocument[] = [];

	for (const document of baseDocuments) {
		const documentRes = await getPopulatedDocument(prisma, {
			id: document.id
		});

		if (documentRes){  
			documents.push(documentRes);
		}
	}

	const res: PopulatedUser & {createdAt: Date | string, updatedAt: Date | string} = documents && documents.length > 0 ? {...user, documents} : {...user, documents: []};

	return res;
}

export async function getPopulatedDocument(prisma: PrismaClient, query: Prisma.DocumentWhereUniqueInput){
	const document = await prisma.document.findFirstOrThrow({
		where: query,
	});

	if (!document) {
		return document;
	}

	const data = await prisma.documentData.findFirstOrThrow({
		where: { documentId: document.id }
	});

	const parsedText: ParsingBlock[] = JSON.parse(data.text);

	const res: PopulatedDocument = {...document, data: {...data, text: parsedText}};

	return res;
}

export async function deleteUser(prisma: PrismaClient, query: Prisma.UserWhereUniqueInput){
	const foundUser = await prisma.user.findFirstOrThrow({
		where: query,
	});

	await deleteAllDocuments(prisma, { userId: foundUser.id });

	await prisma.user.delete({
		where: query,
	});
}

export async function deleteAllUsers(prisma: PrismaClient, query: Prisma.UserWhereInput){
	const foundUsers = await prisma.user.findMany({
		where: query,
	});

	for (const user of foundUsers){
		await deleteAllDocuments(prisma, { userId: user.id });
	}

	await prisma.user.deleteMany({
		where: query,
	});
}

export async function deleteDocument(prisma: PrismaClient, query: Prisma.DocumentWhereUniqueInput){
	const foundDocument = await prisma.document.findFirstOrThrow({
		where: query
	});

	await prisma.documentData.deleteMany({
		where: { documentId: foundDocument.id }
	});

	await prisma.document.delete({
		where: query
	});
}

export async function deleteAllDocuments(prisma: PrismaClient, query: Prisma.DocumentWhereInput){
	const foundDocuments = await prisma.document.findMany({
		where: query
	});

	for (const document of foundDocuments){
		await prisma.documentData.deleteMany({
			where: { documentId: document.id }
		});
	}

	await prisma.document.deleteMany({
		where: query
	});
}
