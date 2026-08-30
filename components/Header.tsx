import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import { checkUser } from "@/lib/checkUser";
import { Show, SignInButton } from "@clerk/nextjs";
import { PenBox } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Header = async () => {
  await checkUser();

  return (
    <nav className="mx-auto py-2 px-4 flex justify-between items-center shadow-md border-b-2">
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          width="150"
          height="60"
          alt="Schedulrr Logo"
          className="h-16 w-auto"
          loading="eager"
        />
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/events?create=true">
          <Button variant="default" className="flex items-center gap-2">
            <PenBox size={18} />
            <span className="hidden sm:inline">Create Event</span>
          </Button>
        </Link>
        <Show when="signed-out">
          <SignInButton forceRedirectUrl="/dashboard">
            <Button variant="outline">Login</Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserMenu />
        </Show>
      </div>
    </nav>
  );
};

export default Header;