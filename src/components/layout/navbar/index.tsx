import Link from "next/link";
import {Suspense} from "react";
import Search from "./Search";
import {SearchSkeleton} from "@/components/common/skeleton/SearchSkeleton";
import LogoIcon from "@components/common/icons/LogoIcon";
import {CartAndUserActions} from "@components/layout/navbar/CartAndUserActions";
import {ActionsSkeleton} from "@components/layout/navbar/ActionsSkeleton";
import {NavbarErrorBoundary} from "@components/error/ErrorBoundary";
import {NavigationSkeleton} from "@components/layout/navbar/NavigationSkeleton";
import {CategoriesMenu} from "@components/layout/navbar/CategoriesMenu";

export default async function Navbar() {
  return (
      <NavbarErrorBoundary>
        <>
          <header className="sticky top-0 z-10">
            <nav
                className="relative flex flex-col items-center justify-between gap-4 bg-neutral-50 p-4 dark:bg-neutral-900 md:flex-row lg:px-6 lg:py-4">
              <div className="flex w-full items-center justify-between gap-0 sm:gap-4">
                <div className="flex max-w-fit gap-2 xl:gap-6">
                  <Link
                      className="flex h-9 w-full scale-95 items-center md:h-9 md:w-auto lg:h-10"
                      href="/"
                      aria-label="Go to homepage"
                  >
                    <LogoIcon/>
                  </Link>
                  {/* 2. STATIC HOLE: Categories (Suspended) */}
                  <Suspense fallback={<NavigationSkeleton/>}>
                    <CategoriesMenu/>
                  </Suspense>
                </div>

                <div className="hidden flex-1 justify-center md:flex">
                  <Suspense fallback={<SearchSkeleton/>}>
                    <Search search={false}/>
                  </Suspense>
                </div>

                <Suspense fallback={<ActionsSkeleton/>}>
                  <CartAndUserActions/>
              </Suspense>

              </div>
            </nav>
          </header>
      </>
      </NavbarErrorBoundary>
  );
}