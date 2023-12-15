import { Anchor, Button, Card, Center, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import Header from "@web/components/Header"
import classNames from "classnames"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { TbLetterA, TbLetterB, TbRefresh } from "react-icons/tb"


export default function LandingPage() {

    const router = useRouter()
    useEffect(() => {
        if (router.isReady && !router.query.dv)
            router.replace("?dv=a", undefined, { shallow: true })
    }, [router.isReady, router.query.dv])

    return (
        <>
            <Header />
            <Center className="w-screen min-h-screen p-xl mt-48 md:mt-0">
                <Group className="items-start gap-20">
                    <Stack className="items-start max-w-2xl">
                        <Title order={1} className="text-4xl md:text-5xl" id="landing-headline">
                            Dirt-cheap A/B testing for your website
                        </Title>
                        <Text className="text-xl text-gray" id="landing-subtitle">
                            Actually, it's not even cheap. It's free.
                        </Text>
                        <Button className="mt-xl" component={Link} href="/login">
                            Get Started Now
                        </Button>
                        <Text className="text-gray mt-20">Made by <Anchor href="https://twitter.com/Zach_Sents" target="_blank">Zach Sents</Anchor></Text>
                    </Stack>

                    <Stack className="mt-10 min-w-[20rem]">
                        <Title order={3}>Try it out!</Title>

                        <DemoVariantCard name="A" icon={TbLetterA} href="/?dv=a" />
                        <DemoVariantCard name="B" icon={TbLetterB} href="/?dv=b" />
                    </Stack>
                </Group>
            </Center>

            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script src="https://dirtab.com/dirtab.js" id="dirt-ab-site-script" data-site-id="qs7XuVsyTnpOVWDGwtnf" key="dirt-ab-site-script"></script>
        </>
    )
}


function DemoVariantCard({ href, name, icon: Icon }) {

    const router = useRouter()
    const active = router.query.dv === name.toLowerCase()

    return (
        <Card component="a" href={href} withBorder
            className={classNames("shadow-xs p-xl transition", {
                "outline outline-2 outline-primary hover:outline-2": active,
                "hover:scale-102 hover:shadow-sm": !active,
            })}
        >
            <Group className="justify-between">
                <Group>
                    <ThemeIcon>
                        <Icon />
                    </ThemeIcon>
                    <Text>
                        Variant {name}
                    </Text>
                </Group>

                <TbRefresh className="text-gray" />
            </Group>
        </Card>
    )
}