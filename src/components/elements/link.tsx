import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import { LinkProps, Link as RouterLink } from 'react-router-dom';

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <RouterLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
