import { ActionIcon, Anchor, Avatar, Group, Menu, Text } from "@mantine/core"
import Brand from "@web/components/Brand"
import { useGlobalStore } from "@web/modules/util"
import { useUser } from "@zachsents/fire-query"
import classNames from "classnames"
import Link from "next/link"
import { TbX } from "react-icons/tb"


export default function Header({ fixed = true, className }) {

    const { data: user, signOut } = useUser()

    const showingLeadMagnetAlert = useGlobalStore(s => s.showingLeadMagnetAlert)
    const hideLeadMagnetAlert = useGlobalStore(s => s.hideLeadMagnetAlert)

    return (
        <header className={classNames(
            "bg-white",
            fixed ? "fixed top-0 left-0 w-screen z-50" : "w-full",
            className
        )}>
            <Group className="max-w-7xl mx-auto w-full justify-between gap-xl p-md">
                <Group className="gap-10">
                    <Brand src="/assets/logo.png" includeText />
                </Group>

                <Group>
                    {user ? <>
                        <Anchor component={Link} href="/sites">My Sites</Anchor>

                        <Menu shadow="xl" withArrow position="bottom-end" classNames={{
                            itemLabel: "text-center"
                        }}>
                            <Menu.Target>
                                <Avatar
                                    src={user?.photoURL}
                                    radius="xl"
                                    className="cursor-pointer ml-md"
                                />
                            </Menu.Target>

                            <Menu.Dropdown className="min-w-[10rem]">
                                <Menu.Item onClick={() => signOut()}>
                                    Sign Out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </> : <>
                        <Anchor component={Link} href="/login">Log In</Anchor>
                        <Anchor component={Link} href="/login">Sign Up</Anchor>
                    </>}
                </Group>
            </Group>

            {showingLeadMagnetAlert &&
                <a
                    href="https://workflow.dog?dv=mkt&ref=dirt" target="_blank" rel="noreferrer"
                    className="flex items-center md:block md:relative px-md py-2 bg-primary hover:bg-primary-700 transition-colors text-white no-underline"
                >
                    <Text className="md:text-center flex-1">
                        Wanna make more marketing automations?
                    </Text>
                    <div className="md:absolute top-1/2 right-10 md:-translate-y-1/2">
                        <ActionIcon
                            variant="transparent"
                            className="text-white hover:bg-primary-500"
                            onClick={ev => {
                                ev.preventDefault()
                                hideLeadMagnetAlert()
                            }}
                        >
                            <TbX />
                        </ActionIcon>
                    </div>
                </a>}
        </header>
    )
}
