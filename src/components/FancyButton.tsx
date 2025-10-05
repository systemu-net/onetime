import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface Props extends LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const FancyButton = ({ to, children, className, ...props }: Props) => {
  return (
    <Link
      to={to}
      {...props} // Spread all additional props, including onClick
      className={`block p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-violet-500 rounded-md shadow hover:bg-gray-50 dark:hover:bg-zinc-950 transition-all duration-300 ${className}`}
    >
      {children}
    </Link>
  );
};

export default FancyButton;
