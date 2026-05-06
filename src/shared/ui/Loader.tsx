export function Loader() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-soft">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-orange-400" />
        <span className="text-sm font-medium text-slate-600">Loading live backend data...</span>
      </div>
    </div>
  );
}
