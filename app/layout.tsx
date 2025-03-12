// app/layout.tsx (Server Component)
import { Metadata } from 'next'
import ClientLayout from './ClientLayout'

export const metadata = {
  title: 'Cherry | APS ',
  description: 'Explore South African universities and their faculties',
  keywords: 'South African universities, university faculties, higher education, APS, APS Calculator, university requirements, university preparation, subject marks, higher education',
  openGraph: {
    title: 'Universities | Cherry',
    description: 'Find information about South African universities and their faculties'
  }
};

// Rest of your existing UniversitiesPage component code...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}


