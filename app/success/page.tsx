import { Suspense } from "react";
import SuccessView from "@/components/SuccessView";

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessView />
    </Suspense>
  );
}
