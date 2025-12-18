import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { MainNav } from '@/components/ui/mainNav'
import Logo from '@public/logo.webp'
import { CircleUser, LogOut, Palette } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

export default function NavBar() {
  const { data } = useSession()

  const getInitials = useMemo(() => {
    if (!data?.user?.name) return null
    const [firstName, lastName] = data.user.name.split(' ')
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase()
  }, [data])

  const { setTheme } = useTheme()

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center">
        <Link href="/" passHref>
          <Image
            src={Logo}
            alt="Neuland e.V. Logo"
            priority
            width={35}
            height={35}
            className="cursor-pointer"
          />
        </Link>
        <MainNav className="mx-6 flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
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
                href="https://auth.neuland.ing/if/user/#/settings"
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
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <p>Design</p>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      Hell
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      Dunkel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
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
