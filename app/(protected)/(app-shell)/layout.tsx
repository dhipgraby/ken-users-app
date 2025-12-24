"use client";

import DashboardHeader from "@/components/layout/header";
import DashboardNavBar from "@/components/layout/navbar";
/* import Footer from "@/components/footer"; */
import useMediaQuery from "@/hooks/useMediaQuery";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-provider";
export default function AppShellLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </SidebarProvider>
  );
}

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { collapsed } = useSidebar();
  const gridTemplate = isDesktop ? `${collapsed ? "80px" : "260px"} 1fr` : undefined;

  return (
    <>
      <section
        className={"grid w-full h-screen lg:h-dvh overflow-hidden transition-all duration-300 ease-in-out"}
        style={isDesktop ? { gridTemplateColumns: gridTemplate } : undefined}
      >
        <DashboardNavBar />
        <div className="flex h-full flex-col overflow-hidden">
          {isDesktop && <DashboardHeader />}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </>
  );
}
