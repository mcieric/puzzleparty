import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Puzzle Party",
    description: "Mint pieces, reveal the image, win the jackpot!",
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": "https://puzzleparty.vercel.app/og-image.png",
        "fc:frame:button:1": "Play Puzzle Party",
        "fc:frame:button:1:action": "link",
        "fc:frame:button:1:target": "https://puzzleparty.vercel.app",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
