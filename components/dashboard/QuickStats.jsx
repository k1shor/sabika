"use client";

export default function QuickStats({ role, posts }) {
  if (role === "visitor") return null;

  const stats = role === "blog_writer"
    ? [
        {
          label: "Published",
          value: posts ? posts.filter((post) => post.status === "approved").length : 0,
          border: "border-l-[#4F7B62] dark:border-l-[#6B9B7E]",
          text: "text-[#4F7B62] dark:text-[#6B9B7E]",
          bg: "bg-[#4F7B62]/10 dark:bg-[#6B9B7E]/15",
        },
        {
          label: "Pending",
          value: posts ? posts.filter((post) => post.status === "pending").length : 0,
          border: "border-l-[#E0A458] dark:border-l-[#F0BE7A]",
          text: "text-[#E0A458] dark:text-[#F0BE7A]",
          bg: "bg-[#E0A458]/10 dark:bg-[#F0BE7A]/15",
        },
        {
          label: "Drafts",
          value: posts ? posts.filter((post) => post.status === "draft").length : 0,
          border: "border-l-[#0B3C6B] dark:border-l-[#5B9BD5]",
          text: "text-[#0B3C6B] dark:text-[#5B9BD5]",
          bg: "bg-[#0B3C6B]/10 dark:bg-[#5B9BD5]/15",
        },
      ]
    : [
        {
          label: "Total Blogs",
          value: "-",
          border: "border-l-[#C8102E] dark:border-l-[#E85D6B]",
          text: "text-[#C8102E] dark:text-[#E85D6B]",
          bg: "bg-[#C8102E]/10 dark:bg-[#E85D6B]/15",
        },
        {
          label: "Total Users",
          value: "-",
          border: "border-l-[#0B3C6B] dark:border-l-[#5B9BD5]",
          text: "text-[#0B3C6B] dark:text-[#5B9BD5]",
          bg: "bg-[#0B3C6B]/10 dark:bg-[#5B9BD5]/15",
        },
        {
          label: "Pending Review",
          value: "-",
          border: "border-l-[#E0A458] dark:border-l-[#F0BE7A]",
          text: "text-[#E0A458] dark:text-[#F0BE7A]",
          bg: "bg-[#E0A458]/10 dark:bg-[#F0BE7A]/15",
        },
      ];

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group flex flex-col justify-between rounded-xl border border-[#EBE5DB] bg-white p-4 border-l-4 ${stat.border} transition-transform duration-200 hover:scale-[1.02] dark:border-[#2C2E38] dark:bg-[#1E2028]`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6A5C] dark:text-[#A8A69A]">
              {stat.label}
            </span>
            <span className={`h-2 w-2 rounded-full ${stat.bg}`} />
          </div>
          <div className={`mt-2 font-serif text-2xl md:text-3xl font-medium tracking-tight ${stat.text}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
