import type { Metadata } from "next";
import type { ReactNode } from "react";

const shareTitle = "thanks for the time spent :)";

export const metadata: Metadata = {
  title: shareTitle,
  description: shareTitle,
  openGraph: {
    title: shareTitle,
    description: shareTitle,
    type: "website",
    images: ["/og-receipt-share.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareTitle,
    images: ["/og-receipt-share.png"],
  },
};

export default function ReceiptLayout({ children }: { children: ReactNode }) {
  return children;
}
