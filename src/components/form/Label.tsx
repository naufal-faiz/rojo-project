import { Children, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // User-defined className that can override the default margin
        className
      )}
    >
      {Children.map(children, (child) => typeof child === "string"
        ? child.split("*").map((part, index) => <span key={index}>{index > 0 && <span className="text-error-600 dark:text-error-400" aria-label="wajib diisi">*</span>}{part}</span>)
        : child)}
    </label>
  );
};

export default Label;
