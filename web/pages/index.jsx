import { Anchor, Button, Center, Stack, Text, Title } from "@mantine/core"
import Header from "@web/components/Header"
import Link from "next/link"


export default function LandingPage() {


    return (
        <>
            <Header />
            <Center className="w-screen h-screen">
                <Stack className="items-center max-w-2xl">
                    <Title order={1} className="text-center text-5xl">
                        Dirt-cheap A/B testing for your website
                    </Title>
                    <Text className="text-center text-xl text-gray">
                        Actually, it's not even cheap. It's free.
                    </Text>

                    <Button className="mt-xl" component={Link} href="/login">
                        Get Started Now
                    </Button>

                    <Text className="text-gray mt-20">Made by <Anchor href="https://twitter.com/Zach_Sents" target="_blank">Zach Sents</Anchor></Text>
                </Stack>
            </Center>
        </>
    )
}
