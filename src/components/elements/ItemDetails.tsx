
import { formatDate } from '@/utils/transformers';
import { CalendarIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import { base64Image } from './base64Image';

type ItemDetailsProps = {
    title: string;
    id: string;
    date: string;
    description?: string;
    image_url?: string;
}

export const ItemDetails = ({ title, description, id, date, image_url }: ItemDetailsProps) => {
    return (
        <div key={description} className="flex gap-6 py-6">
            <div className="shrink-0">
                <Link to={id}>
                    <img
                        className={`${image_url ? 'w-30' : 'w-10'} aspect-square rounded-lg shadow dark:bg-zinc-100`}
                        src={image_url ? image_url : 'http://' + title + '/favicon.ico'}
                        alt={title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = base64Image; // Replace with your fallback image path
                        }}
                    />
                </Link>
            </div>
            <div className="space-y-1.5">
                <div className="text-lg/6 font-semibold">
                    <Link className='hover:underline hover:underline-offset-2 dark:text-zinc-200' to={id}>{title}</Link>
                </div>
                <div className="text-base/6 text-zinc-600 dark:text-zinc-500">{id}</div>
                {description && <div className="text-xs/6 text-violet-700 break-all mr-3">{description}</div>}
                <div className="text-xs/6 text-zinc-500">
                    <CalendarIcon className="size-4 inline-block mr-1 -mt-1" />
                    {formatDate(date)}
                </div>
            </div>
            {/* {editLink && <Button className='self-end' to={editLink}>Edit</Button>} */}
        </div>
    );
};
