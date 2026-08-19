export default function Divider() {
  return (
    <div className="my-8 flex items-center">
      <div className="h-px flex-1 bg-slate-300"></div>

      <span className="px-4 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        OR
      </span>

      <div className="h-px flex-1 bg-slate-300"></div>
    </div>
  );
}