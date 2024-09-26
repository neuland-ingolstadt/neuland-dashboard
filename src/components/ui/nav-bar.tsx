import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MainNav } from '@/components/ui/main-nav'
import Logo from '@/components/images/logo.webp'
import { CircleUser, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

export default function NavBar() {
  const { data } = useSession()

  const getInitials = useMemo(() => {
    if (!data?.user?.name) return null
    const [firstName, lastName] = data.user.name.split(' ')
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`
  }, [data])

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center">
        <Link
          href="/dashboard"
          passHref
        >
          <Image
            src={Logo}
            alt="Neuland e.V. Logo"
            priority
            width={40}
            height={40}
          />
        </Link>
        <MainNav className="mx-6 flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {data?.user?.name}
                </p>
                {data?.user?.email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {data?.user?.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link
                href="https://sso.informatik.sexy/if/user/#/settings"
                passHref
                target="_blank"
              >
                <DropdownMenuItem>
                  <CircleUser className="mr-2 h-4 w-4" />
                  <p>Account</p>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <p>Abmelden</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
