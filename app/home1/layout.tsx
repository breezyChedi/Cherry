import '../globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cherry - Your Path to Higher Education in South Africa',
  description: 'Calculate your APS Score in 60 seconds. Search university courses, check eligibility requirements, and find the perfect degree program for your future career.',
  keywords: ['APS calculator', 'South African universities', 'university courses', 'NBT', 'National Senior Certificate', 'higher education'],
  openGraph: {
    title: 'Cherry - Your Path to Higher Education in South Africa',
    description: 'Calculate your APS Score in 60 seconds. Search university courses, check eligibility requirements, and find the perfect degree program for your future career.',
    url: 'https://www.cherry.org.za',
    siteName: 'Cherry',
    images: [
      {
        url: 'https://www.cherry.org.za/cherryLogoPng.png',
        width: 512,
        height: 512,
        alt: 'Cherry Logo',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cherry - Your Path to Higher Education in South Africa',
    description: 'Calculate your APS Score in 60 seconds. Search university courses, check eligibility requirements, and find the perfect degree program for your future career.',
    images: ['https://www.cherry.org.za/cherryLogoPng.png'],
  },
};

export default function Home1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
