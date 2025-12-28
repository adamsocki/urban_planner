import Link from "next/link";

export const MinimalHeaderLogoLink = () => {
  return (
    <Link
      href="/planner/about"
      className="py-1 pl-1 pr-2 flex gap-x-2 items-center rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-1 focus-visible:ring-purple-300"
      title="Planner"
    >
      <span aria-hidden className="w-8 h-8 grid place-items-center">
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 text-purple-600 dark:text-purple-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 10H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 14H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="font-semibold tracking-wide text-gray-700 dark:text-gray-200">
        Planner
      </span>
    </Link>
  );
};

export const MinimalHeader = () => {
  return (
    <div className="flex border-b dark:border-black border-gray-200">
      <nav className="w-full max-w-4xl mx-auto flex items-center flex-auto gap-x-2 py-2">
        <MinimalHeaderLogoLink />
      </nav>
    </div>
  );
};
