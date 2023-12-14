import { Anchor, Button, Card, Group, Stack, Text, Title } from "@mantine/core"
import Header from "@web/components/Header"
import { SITES_COLLECTION } from "@web/modules/firestore"
import { confirmDeleteSite, openCreateSiteModal } from "@web/modules/sites"
import { plural } from "@web/modules/util"
import { useCollectionQuery, useUser } from "@zachsents/fire-query"
import { where } from "firebase/firestore"
import Link from "next/link"
import { TbPlus } from "react-icons/tb"


export default function SitesPage() {

    const { data: user } = useUser()

    const { data: sites } = useCollectionQuery([SITES_COLLECTION], [
        user && where("owner", "==", user.uid),
    ])

    return (
        <>
            <Header />

            <div className="mt-20 max-w-7xl w-full mx-auto p-md">
                <Group className="justify-between mb-xl">
                    <Title order={1}>My Sites</Title>

                    <Button leftIcon={<TbPlus />} onClick={openCreateSiteModal}>New Site</Button>
                </Group>

                {sites?.length > 0 ?
                    <div className="grid grid-cols-3 gap-xl">
                        {sites?.map(s =>
                            <SiteCard key={s.id} {...s} />
                        )}
                    </div> :
                    <Text className="text-gray text-center py-md">
                        No sites yet. Go make one!
                    </Text>}
            </div>
        </>
    )
}


function SiteCard({ id, name, variants, createdAt }) {
    return (
        <Stack className="gap-xs">
            <Card className="p-xl shadow-xs hover:shadow-sm hover:scale-102 transition" withBorder component={Link} href={`/site/${id}`}>
                <Stack className="gap-1">
                    <Text className="font-bold text-xl">
                        {name}
                    </Text>
                    <Text className="text-gray">
                        {plural("variant", variants ? Object.keys(variants).length : 0, true)}
                    </Text>
                    <Text className="text-xs text-gray">
                        Created on {createdAt?.toDate().toLocaleDateString()}
                    </Text>
                </Stack>
            </Card>

            <Group className="justify-end px-sm">
                <Anchor onClick={() => confirmDeleteSite(id)} component="span" className="text-xs text-gray">
                    Delete Site
                </Anchor>
            </Group>
        </Stack>
    )
}