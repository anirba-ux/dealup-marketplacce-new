interface DateSeparatorProps {
  date: string | Date;
}

export default function DateSeparator({
  date,
}: DateSeparatorProps) {
  const messageDate = new Date(date);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label = messageDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (messageDate.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (
    messageDate.toDateString() === yesterday.toDateString()
  ) {
    label = "Yesterday";
  }

  return (
    <div className="my-6 flex justify-center">
      <span className="rounded-full bg-slate-200 px-4 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-300">
        {label}
      </span>
    </div>
  );
}