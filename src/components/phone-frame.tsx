import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[2.7rem] border-[10px] border-[#171a20] bg-[#0d1015] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="rounded-[2rem] bg-[#ffffff] p-4">
        <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-[#1f2530]" />
        {children}
      </div>
    </div>
  );
}
