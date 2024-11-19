import { Suspense } from "react";

export default function AddProductLayout({ children }) {
    return  <Suspense fallback={null}>{children}</Suspense>;
  }
  