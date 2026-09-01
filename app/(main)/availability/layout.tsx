import { Suspense } from "react";

const AvailabilityLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto">
      <Suspense fallback={<div>Loading availability...</div>}>
        {children}
      </Suspense>
    </div>
  );
};

export default AvailabilityLayout;