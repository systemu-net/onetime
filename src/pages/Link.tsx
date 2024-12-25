import { Subheading } from '@/components/elements/heading'
import { Table, TableHead, TableHeader, TableRow } from '@/components/elements/table'
import MainLayout from '@/components/layouts/MainLayout'
import { LINKS_ROUTE } from '@/routes'

import { getLink } from '@/apis/shorten'
import { ItemDetails } from '@/components/elements/ItemDetails'
import { extractDomain } from '@/utils/transformers'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Link } from './LinksPage'


const LinkPage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  // Optionally, you can call fetchLinks when the component mounts (if needed)
  useEffect(() => {
    if (cookies.token) {
      fetchLink();
    }
  }, [cookies.token]); // Runs when the token is available

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink to={LINKS_ROUTE} className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Links
        </RouterLink>
      </div>
      <div className='px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white'>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {link && <ItemDetails title={extractDomain(link.original_url)}
          description={link.original_url}
          info={link.lookup_code}
          date={link.created_at}
        />}
        {/* <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Stat title="Total revenue" value={link.totalRevenue} change={link.totalRevenueChange} />
        <Stat
        title="Tickets sold"
        value={`${link.ticketsSold}/${link.ticketsAvailable}`}
        change={link.ticketsSoldChange}
        />
        <Stat title="Pageviews" value={link.pageViews} change={link.pageViewsChange} />
        </div> */}
        <Subheading className="mt-12">Statistics</Subheading>
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
    </MainLayout>
  )
}
export default LinkPage;