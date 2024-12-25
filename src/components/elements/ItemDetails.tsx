
import { formatDate } from '@/utils/transformers';
import { CalendarIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';

export const ItemDetails = ({ title, description, info, date }) => {
    return (
        <div key={description} className="flex gap-6 py-6">
            <div className="w-24 shrink-0">
                <Link to={info}>
                    <img
                        className="aspect-square rounded-lg shadow"
                        src=""
                        alt={title}
                    />
                </Link>
            </div>
            <div className="space-y-1.5">
                <div className="text-lg/6 font-semibold">
                    <Link to={info}>{title}</Link>
                </div>
                <div className="text-base/6 text-zinc-600">{info}</div>
                <div className="text-xs/6 text-violet-700 break-all mr-3">{description}</div>
                <div className="text-xs/6 text-zinc-500">
                    <CalendarIcon className="size-4 inline-block mr-1" />
                    {formatDate(date)}
                </div>
            </div>
            {/* {editLink && <Button className='self-end' to={editLink}>Edit</Button>} */}
        </div>
    );
};
