'use client';

import Link from 'next/link';
import { Button, type ButtonProps } from '@mui/material';

interface ButtonLinkProps extends Omit<ButtonProps, 'component' | 'href'> {
  href: string;
  target?: string;
  rel?: string;
}

export default function ButtonLink({ href, children, target, rel, ...buttonProps }: ButtonLinkProps) {
  return (
    <Link href={href} target={target} rel={rel} style={{ textDecoration: 'none' }}>
      <Button component="span" {...buttonProps}>
        {children}
      </Button>
    </Link>
  );
}
