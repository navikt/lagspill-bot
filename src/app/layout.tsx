import 'next-logger'
import './global.css'

import { PropsWithChildren, ReactElement } from 'react'


export default async function RootLayout({ children }: PropsWithChildren): Promise<ReactElement> {

    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen">
                <main className="container p-4 sm:p-16 sm:pt-4 min-h-fit grow">{children}</main>
            </body>
        </html>
    )
}
