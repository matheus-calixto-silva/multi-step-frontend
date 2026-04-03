import { Suspense } from "react";
import { RegisterFlow } from "./register-flow";
import { LoadingScreen } from "@/components/loading-screen";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RegisterFlow />
    </Suspense>
  );
}
