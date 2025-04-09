import { BreadcrumbType } from '@/types/general';

export default function Users(){
	return (
		<>Coming soon...</>
	);
}

Users.breadcrumb = JSON.stringify([{name: 'Admin', isLink: false}, {name: 'Users', isLink: true, link: '/users'}] as BreadcrumbType[]);