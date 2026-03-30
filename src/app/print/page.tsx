import { Suspense } from "react";
import { ReceiptClientPage } from "@/components/receipt/receipt-client-page";

type PrintPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function PrintPage({ searchParams }: PrintPageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-[#666a79]">Preparing print view...</div>}>
      <ReceiptClientPage searchParams={searchParams} printMode />
    </Suspense>
  );
}
