import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHeader } from "../stores/header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

const AdminNavbar = () => {
  const title = useHeader((state) => state.title);

  return (
    <header className='sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear supports-backdrop-filter:bg-background/70 group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <h1 className='truncate text-base font-semibold tracking-tight text-foreground'>
          {title}
        </h1>
        <div className='ml-auto flex items-center gap-1.5'>
          {/* <NotificationBell variant='admin' /> */}
          <Button
            variant='ghost'
            asChild
            size='icon'
            className='text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            aria-label='Open public site in a new tab'
          >
            <Link
              href='/'
              rel='noopener noreferrer'
              target='_blank'
              className='flex size-full items-center justify-center'
            >
              <Home className='size-5' />
              <span className='sr-only'>Open public site</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
