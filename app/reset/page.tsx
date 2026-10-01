import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetRunner } from "./ResetRunner";

export const metadata: Metadata = { title: "Reset" };

export default function ResetPage() {
  return (
    <Suspense>
      <ResetRunner />
    </Suspense>
  );
}
