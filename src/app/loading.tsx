export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center">
      <div className="text-center">
        <div className="relative h-12 w-12 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
