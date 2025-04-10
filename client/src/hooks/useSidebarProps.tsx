import { File, Fingerprint, Info, Logs, Settings } from 'lucide-react';
import { useMemo } from 'react';

import { PROJECT_NAME } from '@/lib/constants';
import { SidebarNode, SidebarNodeType } from '@/types/general';
import { PopulatedDocument, PopulatedUser } from '@/types/populations';

export default function useSidebarProps(user: PopulatedUser | undefined, disclaimerCallback: () => void) {
	const mainProps = useMemo<SidebarNode[]>(() => [
		{
			name: 'Dashboard',
			props: {
				type: SidebarNodeType.Link,
				icon: <Logs size={16} />,
				link: '/dashboard',
			}
		},
		{
			name: 'Settings',
			props: {
				type: SidebarNodeType.Link,
				icon: <Settings size={16} />,
				link: '/settings',
			}
		}
	], []);

	const adminProps = useMemo<SidebarNode>(() => ({
		name: 'Admin',
		props: {
			type: SidebarNodeType.Parent,
			icon: <Fingerprint size={16} />,
			children: [
				{
					name: 'Users',
					props: {
						type: SidebarNodeType.Link,
						link: '/users',
					}
				}
			]
		}
	}), []);

	const infoProps = useMemo<SidebarNode>(() => ({
		name: 'Info',
		props: {
			type: SidebarNodeType.Parent,
			icon: <Info size={16} />,
			children: [
				{
					name: `About ${PROJECT_NAME}`,
					props: {
						type: SidebarNodeType.Link,
						link: '/about'
					}
				},
				{
					name: 'Changelog',
					props: {
						type: SidebarNodeType.Link,
						link: '/changelog'
					}
				},
				{
					name: 'Disclaimer',
					props: {
						type: SidebarNodeType.Button,
						onClick: disclaimerCallback
					}
				},
			]
		},
	}), [disclaimerCallback]);

	const sortedDocuments: PopulatedDocument[] = useMemo(() => (user?.documents || []).sort((a, b) => Date.parse(a.createdAt as string) - Date.parse(b.createdAt as string)), [user]);

	const userProps = useMemo<SidebarNode>(() => ({
		name: 'Documents',
		props: sortedDocuments.length > 0 ? {
			type: SidebarNodeType.Parent,
			icon: <File size={16} />,
			children: sortedDocuments.map(document => ({
				name: document.name,
				props: {
					type: SidebarNodeType.Link,
					link: `/document/${document.id}`
				}
			}))
		} : {
			type: SidebarNodeType.Button,
			icon: <File size={16} />,
			onClick: () => { }
		}
	}), [sortedDocuments]);

	return { mainProps, adminProps, infoProps, userProps };
}