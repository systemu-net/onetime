import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from '../../components/SocialIcons';

export const ContainerOuter = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(function OuterContainer({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={clsx('sm:px-8', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  )
})

export const ContainerInner = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(function InnerContainer({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
})

export const Container = forwardRef<
  React.ElementRef<typeof ContainerOuter>,
  React.ComponentPropsWithoutRef<typeof ContainerOuter>
>(function Container({ children, ...props }, ref) {
  return (
    <ContainerOuter ref={ref} {...props}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  )
})


function SocialLink({
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  )
}

export const ProfileSection = () => {
  return (
    <Container className="mt-9">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Your place for exploring the world of then Next generation shortened links.
        </h1>

        <div className="mt-6 flex gap-6">
          <SocialLink to="#" aria-label="Follow on X" icon={XIcon} />
          <SocialLink
            to="#"
            aria-label="Follow on Instagram"
            icon={InstagramIcon}
          />
          <SocialLink
            to="https://github.com/ndemianc/"
            aria-label="Follow on GitHub"
            icon={GitHubIcon}
          />
          <SocialLink
            to="https://www.linkedin.com/in/sdemian/"
            aria-label="Follow on LinkedIn"
            icon={LinkedInIcon}
          />
        </div>
      </div>
    </Container>
  )
};
