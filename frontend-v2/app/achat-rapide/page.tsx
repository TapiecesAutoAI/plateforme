import { Suspense } from "react";
import QuickPurchaseContent from "./QuickPurchaseContent";

export default function QuickPurchasePage() {
  return (
    <Suspense fallback={null}>
      <QuickPurchaseContent />
    </Suspense>
  );
}
