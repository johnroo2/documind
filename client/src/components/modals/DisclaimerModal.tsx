import { BadgeAlert } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({
	open,
	onClose,
}: DisclaimerModalProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open){
					onClose();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<BadgeAlert />
                    Disclaimer
					</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-left">
                This is a demo of a research project owned by <b>AA&amp;AI</b>, not a product. It
                might produce inappropriate, inaccurate, offensive, or harmful content.
                Use at your own risk. <b>This is confidential and proprietary information,
                please do not share.</b>
				</p>
			</DialogContent>
		</Dialog>
	);
}