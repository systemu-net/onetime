import { Subheading } from '@/components/elements/heading';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/elements/table';
import MainLayout from '@/components/layouts/MainLayout';
import { LINKS_ROUTE } from '@/routes';

import { createQrCode } from '@/apis/qr_codes';
import { getLink } from '@/apis/shorten';
import { Button } from '@/components/elements/button';
import { ItemDetails } from '@/components/elements/ItemDetails';
import { useNotification } from '@/Notifications';
import { Link } from '@/types';
import { extractDomain } from '@/utils/transformers';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';

const LinkPage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { addNotification } = useNotification();

  const [link, setLink] = useState<Link | null>(null);

  const fetchLink = async () => {
    try {
      const link: Link = await getLink(cookies.token, lookup_code);
      setLink(link);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching links.');
    }
  };

  useEffect(() => {
    if (cookies.token) {
      fetchLink();
    }
  }, [cookies.token]); // Runs when the token is available

  const CreateQRCodeFromLink = async () => {
    if (link?.original_url) {
      try {
        setErrorMessage('');
        const code = await createQrCode(cookies.token, {
          qr_code: {
            lookup_code: lookup_code,
            title: extractDomain(link.original_url),
          },
        });
        console.log(code);
        addNotification('QrCode created', 'success');
      } catch (error: unknown) {
        console.error(error);
        setErrorMessage('An error occurred while creating qr code.');
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink
          to={LINKS_ROUTE}
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Links
        </RouterLink>
      </div>
      <div className="mb-4 px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {link && (
          <ItemDetails
            title={extractDomain(link.original_url)}
            description={link.original_url}
            id={link.lookup_code}
            date={link.created_at}
          />
        )}
        {/* <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Stat title="Total revenue" value={link.totalRevenue} change={link.totalRevenueChange} />
        <Stat
        title="Tickets sold"
        value={`${link.ticketsSold}/${link.ticketsAvailable}`}
        change={link.ticketsSoldChange}
        />
        <Stat title="Pageviews" value={link.pageViews} change={link.pageViewsChange} />
        </div> */}
        <Subheading className="mt-4">Statistics</Subheading>
        <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
          <TableHead>
            <TableRow>
              <TableHeader>QR codes</TableHeader>
              <TableHeader>Clicks</TableHeader>
              <TableHeader className="text-right">Amount</TableHeader>
            </TableRow>
          </TableHead>
          {/* <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={order.url} title={`Order #${order.id}`}>
            <TableCell>{order.id}</TableCell>
            <TableCell className="text-zinc-500">{order.date}</TableCell>
            <TableCell>{order.customer.name}</TableCell>
            <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
            ))}
            </TableBody> */}
        </Table>
      </div>
      <div className="py-5 lg:p-8 mt-4 px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white">
        <Subheading className="mt-4">QR Code</Subheading>
        <Button outline onClick={CreateQRCodeFromLink}>
          Create QR Code
        </Button>
      </div>
    </MainLayout>
  );
};
export default LinkPage;
