import { auth } from "@/auth";

import LoginButton from "@/components/ui/LoginButton";
import UserMenu from "@/components/ui/UserMenu";
import SellButton from "@/components/ui/SellButton";
import SearchBar from "@/components/ui/SearchBar";
import Logo from "@/components/ui/Logo";
import WishlistNavButton from "@/components/ui/WishlistNavButton";

export default async function Navbar() {
  const session = await auth();
  console.log("======== NAVBAR SESSION ========");
  console.log(session);
  console.log("================================");
  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[220px_1fr_auto] items-center gap-8 px-6 lg:px-8">
        <Logo />

        <SearchBar />

        <div className="flex items-center gap-4">
          <WishlistNavButton />

          {session?.user ? (
            <UserMenu />
          ) : (
            <LoginButton />
          )}

          <SellButton />
        </div>
      </div>
    </nav>
  );
}
