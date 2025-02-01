import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import React, { forwardRef } from 'react';

const ColorPicker = forwardRef(function Input(
  {
    className,
    ...props
  }: {
    className?: string;
  } & Omit<Headless.InputProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  return (
    <span
      data-slot="control"
    >
      <Headless.Input
        type="color"
        ref={ref}
        {...props}
        className={clsx([
          'p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg focus:outline-none',
          'disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700',
          'focus:ring-2 focus:ring-violet-600 dark:focus:ring-offset-neutral-900',
        ])}
      />
    </span>
  );
});

export default ColorPicker;