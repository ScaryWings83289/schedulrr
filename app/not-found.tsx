"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <main className="flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <Image
        src="/404.svg"
        alt="Page not found"
        width={400}
        height={300}
        loading="eager"
        priority
        className="mx-auto mb-10 drop-shadow-2xl"
      />

      <h1 className="mt-6 gradient-title text-5xl font-bold md:text-7xl">
        Missed the Slot?
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-500">
        Looks like this page never made it onto the calendar. The page
        you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="h-11 px-6 text-base">
          <Link href="/dashboard">
            <Home />
            Back to Dashboard
          </Link>
        </Button>

        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="lg"
          className="h-11 px-6 text-base"
        >
          <ArrowLeft />
          Go Back
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
