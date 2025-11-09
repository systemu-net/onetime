import { API_URL } from '@/apis/config';
import { Page } from '@/types';
import { http, HttpResponse } from 'msw';
const LINKS = [
  {
    created_at: '2024-12-19T08:30:00Z',
    id: 1,
    lookup_code: 'abc123',
    original_url: 'https://example.com',
    updated_at: '2024-12-21T12:00:00Z',
    user_id: 101,
  },
  {
    created_at: '2024-12-19T08:30:00Z',
    id: 2,
    lookup_code: 'def456',
    original_url: 'https://another-example.com',
    updated_at: '2024-12-20T09:00:00Z',
    user_id: 102,
  },
  {
    created_at: '2024-12-18T14:45:00Z',
    id: 3,
    lookup_code: 'ghi789',
    original_url:
      'https://tailwindcss.com/very-long-url-here/and/herevery-long-url-here/and/herevery-long-url-here/and/herevery-long-url-here/and/here',
    updated_at: '2024-12-19T16:30:00Z',
    user_id: 103,
  },
  {
    created_at: '2023-05-18T14:45:00Z',
    id: 3,
    lookup_code: 'rti789',
    original_url:
      'https://youtube.com/very-long-url-here/and/herevery-long-url-here/and/herevery-long-url-here/and/herevery-long-url-here/and/here',
    updated_at: '2024-12-19T16:30:00Z',
    user_id: 103,
  },
];
const QR_CODES = [
  {
    created_at: '2024-12-20T10:00:00Z',
    id: 1,
    lookup_code: 'abc123',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
    updated_at: '2024-12-21T12:00:00Z',
    link_id: 101,
  },
  {
    created_at: '2024-12-19T08:30:00Z',
    id: 2,
    lookup_code: 'def456',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
    updated_at: '2024-12-20T09:00:00Z',
    link_id: 102,
  },
  {
    created_at: '2024-12-18T14:45:00Z',
    id: 3,
    lookup_code: 'ghi789',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/8/82/QR_code_Wi-Fi.svghttps://play-lh.googleusercontent.com/Byl6BHzEv7tWDGa5QUgztneq8C8TGYelu8ywVMTTRUH2e9keboyLqL4YhmzaU3vjgA=w480-h960-rw',
    updated_at: '2024-12-19T16:30:00Z',
    link_id: 103,
  },
];
const PAGE: Page = {
  lookup_code: 'sergii-demo',
  published_lookup_code: 'sergii-demo-pub',
  title: 'Sergii Demianchuk',
  description: 'CTO and entrepreneur',
  created_at: '2024-12-19T08:30:00Z',
  updated_at: '2024-12-20T09:00:00Z',
  links: [
    {
      id: '1',
      label: 'Submit',
      color: '#ffffff',
      link: 'https://example.com/submit',
    },
    {
      id: '2',
      label: 'Cancel',
      color: '#ffffff',
      link: 'https://example.com/cancel',
    },
    {
      id: '3',
      label: 'Learn More',
      color: '#ffffff',
      link: 'https://example.com/learn-more',
    },
  ],
  content: {
    button: 'rounded',
    buttonColor: '#ffffff',
    textColor: '#8b5cf6',
    background: '#ffffff',
    backgroundType: 'color',
    backgroundColor: '#3b3054',
    profileImage: 'https://www.sdemian.com/images/Sergii-Demianchuk.jpeg',
    social: {
      fb: 'https://facebook.com/smariana',
    },
    fontFamily: 'rubik',
  },
};
const pages: Page[] = [];

export const handlers = [
  // http.post(
  //   `${API_URL}/users/sign_in`,
  //   async ({request, params, cookies}) => {
  //     // const {email, password} = await request.json();

  //     // // Validate the request payload (optional)
  //     // if (email === 'camomile.mail2@gmail.com' && password === 'testtest') {
  //     return new HttpResponse(null, {
  //       status: 200,
  //       headers: {
  //         Authorization: 'Bearer mock-token-123',
  //       },
  //     });
  //   }
  //   // }
  // ),
  // http.get(
  //   `${API_URL}/api/v1/current_user`,
  //   async ({request, params, cookies}) => {
  //     return HttpResponse.json({
  //       user: {
  //         id: 12,
  //         email: 'camomile.mail2@gmail.com',
  //         role: 'admin',
  //         created_at: '2024-12-19T16:30:00Z',
  //         updated_at: '2024-12-19T16:30:00Z',
  //       },
  //     });
  //   }
  // ),
  http.post(`${API_URL}/api/v1/links`, async () => {
    return HttpResponse.json({
      links: LINKS,
    });
  }),
  http.get(`${API_URL}/api/v1/links`, async () => {
    return HttpResponse.json({
      links: LINKS,
    });
  }),
  http.delete(
    `${API_URL}/api/v1/links/:lookup_code`,
    async () => {
      return new HttpResponse(null, {
        status: 200,
      });
    }
  ),
  http.get(
    `${API_URL}/api/v1/links/:lookup_code`,
    async () => {
      return HttpResponse.json({
        link: {
          created_at: '2024-12-19T08:30:00Z',
          id: 2,
          lookup_code: 'def456',
          original_url: 'https://another-example.com',
          updated_at: '2024-12-20T09:00:00Z',
          user_id: 102,
        },
      });
    }
  ),
    http.get(`${API_URL}/api/v1/qr_codes`, () => {
    return HttpResponse.json({
      qr_codes: QR_CODES,
    });
  }),
  http.get(
    `${API_URL}/api/v1/qr_codes/:lookup_code`,
    async () => {
      return HttpResponse.json({
        qr_code: QR_CODES[0],
      });
    }
  ),
  http.post(
    `${API_URL}/api/v1/qr_codes`,
    async () => {
      return HttpResponse.json({
        qr_code: QR_CODES[0],
      });
    }
  ),
    http.get(`${API_URL}/api/v1/brand_pages`, () => {
    if (!pages.length) {
      pages.push(PAGE);
    }
    return HttpResponse.json({
      brand_pages: pages,
    });
  }),
  http.get(
    `${API_URL}/api/v1/brand_pages/:id`,
    async ({params}) => {
      const id = params?.id as string;
      return HttpResponse.json({
        page: pages.filter((page) => page.lookup_code === id)[0],
      });
    }
  ),
  http.post(`${API_URL}/api/v1/brand_pages`, async ({request}) => {
    const {page} = await request.json() as {page: Partial<Page>};
    const newPage = {...PAGE, ...page, id: pages.length + 1};
    pages.push(newPage);

    return HttpResponse.json({
      page: newPage,
    });
  }),
];
