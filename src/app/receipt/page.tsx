import { Suspense } from "react";
import { ReceiptClientPage } from "@/components/receipt/receipt-client-page";

type ReceiptPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function ReceiptPage({ searchParams }: ReceiptPageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-[#666a79]">Loading receipt...</div>}>
      <ReceiptClientPage searchParams={searchParams} />
    </Suspense>
  );
}
