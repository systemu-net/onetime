import { ReactNode } from "react";

interface BoxProps {
  children: ReactNode;
  className?: string;
}

const Box = ({ children, className }: BoxProps) => {
  return (
    <div className={`mb-4 px-4 py-5 sm:p-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900 ${className}`}>
      {children}
    </div>
  )
}

export default Box
