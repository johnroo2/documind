import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/dropzone';
import { getAvatar } from '@/lib/utils';
import { BaseProps } from '@/pages/_app';
import { BreadcrumbType } from '@/types/general';

export default function Dashboard({user}: BaseProps){
	if (!user) return <></>;
      
	return (
		<>
			<div className='w-full h-full pb-4'>
				<Card className='w-full h-full p-4 bg-zinc-50 grid grid-rows-[auto_auto_1fr] overflow-y-auto gap-4'>
					<div className='flex items-center gap-3'>
						<Avatar className={'size-8 m-0.5 rounded-full'} style={getAvatar(user.username)}/>
						<div>
							<h1 className='font-medium text-base'>Welcome, {user.username}!</h1>
							{/* <p className='text-muted-foreground text-sm'>
								{user.chats.length > 0 ? 'Start a new chat or continue an existing one!' : 'Start your first chat here!'}
							</p> */}
						</div>
					</div>
					{/* <ChatTable
						user={user}
						setUser={setUser}
					/> */}
					<FileUploader
						maxSize={1024 * 1024 * 10}
						accept={{
							'image/*': ['.png', '.jpg', '.jpeg'],
						}}
					/>
				</Card>
			</div>
		</>
	);
}

Dashboard.breadcrumb = JSON.stringify([{name: 'Dashboard', isLink: true, link: '/dashboard'}] as BreadcrumbType[]);