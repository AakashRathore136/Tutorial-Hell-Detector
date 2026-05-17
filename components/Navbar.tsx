import Link from 'next/link';
import { Terminal } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Terminal className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">Tutorial Hell Detector</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/analyze" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Analyze
            </Link>
            <Link href="/history" className="transition-colors hover:text-foreground/80 text-foreground/60">
              History
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}
