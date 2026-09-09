import { Suspense } from "react";
import ShowroomContent from "./ShowroomContent";

export default function ShowroomPage() {
  return (
    <Suspense fallback={null}>
      <ShowroomContent />
    </Suspense>
  );
}
