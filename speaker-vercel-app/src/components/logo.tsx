import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-purple-500"
      >
        <path
          d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M16 6c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4s4-1.8 4-4V10c0-2.2-1.8-4-4-4z"
          fill="currentColor"
        />
        <path
          d="M8 14c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1s1-.4 1-1v-2c0-.6-.4-1-1-1zM24 14c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1s1-.4 1-1v-2c0-.6-.4-1-1-1z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Speaker
      </span>
    </div>
  );
}