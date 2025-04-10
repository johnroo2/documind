import { ParsingBlock, ParsingPage } from '@/types/populations';

export default function parseBlocks(raw_text: string): ParsingPage[] {
	const blocks = JSON.parse(raw_text);

	if (!Array.isArray(blocks) || !blocks.every((block): block is ParsingBlock => 
		typeof block === 'object' && 
		block !== null &&
		'block_type' in block &&
		'block_text' in block &&
		(block.block_type === 'page' || block.block_type === 'paragraph') &&
		typeof block.block_text === 'string'
	)) {
		throw new Error('Invalid block format');
	}

	const pages: ParsingPage[] = [];

	blocks.forEach((block) => {
		if (block.block_type === 'page') {
			pages.push({ title: block.block_text, body: [] });
		} else {
			pages[pages.length - 1].body.push(block.block_text);
		}
	});

	return pages;
}