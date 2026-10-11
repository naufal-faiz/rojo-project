import { Suspense } from "react";
import PermohonanView from "@/components/main/permohonan/PermohonanView";

export default function Page() {
  return (
    <Suspense>
      <PermohonanView />
    </Suspense>
  );
}
