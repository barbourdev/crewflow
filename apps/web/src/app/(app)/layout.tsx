import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Fluid animated background (same as Stitch) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0066ff]/5 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[120px] animate-blob [animation-delay:-7s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-white/40 rounded-full blur-[100px] animate-blob [animation-delay:-12s]" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
