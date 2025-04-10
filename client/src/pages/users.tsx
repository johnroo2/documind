import { User } from '@prisma/client';
import { AxiosError } from 'axios';
import { Users as UsersIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { toast } from 'sonner';

import { BaseProps } from './_app';

import { Card } from '@/components/ui/card';
import UserTable from '@/components/users/UserTable';
import userService from '@/services/userService';
import { BreadcrumbType } from '@/types/general';

export default function Users({ user, setUser }: BaseProps) {

	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	// const [createUserModalOpen, setCreateUserModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const fetchUsers = async () => {
			const res = await userService.getAllUsers();

			if (res instanceof AxiosError) {
				toast.error('Could not fetch users', {
					description: res?.response?.data?.message || 'An unexpected error occured while attempting to fetch users.'
				});
				router.push(user ? '/dashboard' : '/');
			} else {
				setUsers(res.users);
			}

			setTimeout(() => {
				setLoading(false);
			}, 1500);
		};

		fetchUsers();
	}, [router, user]);

	if (!user) return <></>;

	return (
		<div className="relative h-full overflow-y-auto">
			<div
				className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white z-[500]`}
			>
				<ScaleLoader />
				<div className="flex items-end gap-1.5">
					<p className="text-foreground">Loading users</p>
					<div id="loading-wave">
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
					</div>
				</div>
			</div>
			<Card className='w-full h-full p-4 bg-white grid grid-rows-[auto_1fr] overflow-y-auto gap-4'>
				<div className='flex justify-between items-center gap-4'>
					<div className='flex items-center gap-3'>
						<div className="border border-purple-600 bg-purple-600/5 text-purple-600 flex items-center justify-center p-2 rounded-full">
							<UsersIcon size={20} />
						</div>
						<h1 className='font-medium text-base'>Users</h1>
					</div>
					{/* <Button
						className='flex items-center gap-2'
						variant='ghost'
						disabled={createUserModalOpen}
						onClick={() => { setCreateUserModalOpen(true); }}
					>
						<UserPlus />
						Create User
					</Button> */}
				</div>
				<UserTable
					user={user}
					users={users}
					setUser={setUser}
					setUsers={setUsers}
				/>
			</Card>
		</div>
	);
}

Users.breadcrumb = JSON.stringify([{ name: 'Admin', isLink: false }, { name: 'Users', isLink: true, link: '/users' }] as BreadcrumbType[]);