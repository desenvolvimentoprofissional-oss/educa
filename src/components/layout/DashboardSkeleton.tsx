export function JornadaCursosInicioSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] animate-pulse">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5" style={{ transform: 'translateY(-50%) translateX(33.333333%)' }} />
        <div className="absolute bottom-0 right-32 w-48 h-48 rounded-full bg-white/5" style={{ transform: 'translateY(33.333333%) translateX(25%)' }} />
        
        <div className="relative z-10">
          <div className="h-10 bg-white/20 rounded max-w-[300px] mb-[12px]" />
          
          <div className="flex flex-col gap-[8px] mb-8 max-w-2xl">
            <div className="h-6 bg-white/20 rounded w-full" />
            <div className="h-6 bg-white/20 rounded w-4/5" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-[12px]">
            <div className="h-10 bg-white/20 rounded-full w-full sm:w-[168px]" />
            <div className="h-10 bg-white/20 rounded-full w-full sm:w-[160px]" />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#f3f4f6] rounded-[16px] p-[20px] shadow-sm animate-pulse flex flex-col justify-center gap-[12px] h-[120px]">
               <div className="flex items-center gap-[8px]">
                 <div className="w-8 h-8 rounded-full bg-gray-200" />
                 <div className="flex flex-col gap-1 w-full">
                   <div className="h-3 bg-gray-200 rounded w-1/2" />
                   <div className="h-3 bg-gray-200 rounded w-1/3" />
                 </div>
               </div>
               <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="bg-[#f9fafb] min-h-screen text-gray-900">
      <div className="w-full max-w-[1152px] mx-auto px-[16px] py-8">
        <JornadaCursosInicioSkeleton />
      </div>
    </div>
  );
}
