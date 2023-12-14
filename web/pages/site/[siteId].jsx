import { Button, Divider, Group, Menu, ScrollArea, Stack, Switch, Text, TextInput, Textarea, Tooltip } from "@mantine/core"
import Header from "@web/components/Header"
import { useMustBeSignedIn } from "@web/modules/firebase"
import { SITES_COLLECTION } from "@web/modules/firestore"
import { defaultElement, defaultVariant, generateId, openCreateSiteModal, useSites } from "@web/modules/sites"
import { sortFromEntries, useActiveUpdateStore, useRemoteValue } from "@web/modules/util"
import { useDocument, useUser } from "@zachsents/fire-query"
import classNames from "classnames"
import { deleteField } from "firebase/firestore"
import _ from "lodash"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useState } from "react"
import { TbChevronDown, TbCopy, TbDeviceLaptop, TbHash, TbPlus, TbTextPlus, TbTrash } from "react-icons/tb"


export default function SitePage() {

    useMustBeSignedIn()

    const router = useRouter()
    const { data: user } = useUser()

    const { data: site, update } = useDocument([SITES_COLLECTION, router.query.siteId])

    const [otherSites] = useSites(false)

    const createAndSelectVariant = async () => {
        const newId = generateId()
        await update.mutateAsync({
            [`variants.${newId}`]: defaultVariant(undefined, site?.variants),
        })
        router.push(`/site/${router.query.siteId}?v=${newId}`)
    }

    const isUpdating = useActiveUpdateStore(s => s.isUpdating())

    useEffect(() => {
        if (!router.isReady)
            return

        if (user !== undefined && site && site?.owner !== user?.uid) {
            router.replace("/sites")
            return
        }

        if (!router.query.v && site?.variants && Object.keys(site.variants).length > 0) {
            router.replace(`/site/${router.query.siteId}?v=${Object.keys(site.variants)[0]}`)
            return
        }
    }, [router.isReady, router.query.v, user?.uid, site])

    return (
        <>
            <div className="fixed top-0 left-0 w-screen z-50 pointer-events-none">
                <Header fixed={false} className="pointer-events-auto" />
                <Divider />
                <div className="max-w-7xl w-full mx-auto p-md pointer-events-auto" style={{
                    backgroundColor: "#ffffffaa",
                    backdropFilter: "blur(8px)",
                }}>
                    <Group className="justify-between">
                        <Menu shadow="lg" position="bottom-start" withinPortal zIndex={50}>
                            <Menu.Target>
                                <div>
                                    <Tooltip label="Change Site">
                                        <Button
                                            variant="outline"
                                            leftIcon={<TbDeviceLaptop />} rightIcon={<TbChevronDown className="ml-md" />}
                                            className="font-normal"
                                        >
                                            {site?.name}
                                        </Button>
                                    </Tooltip>
                                </div>
                            </Menu.Target>

                            <Menu.Dropdown className="min-w-[12rem]">
                                {otherSites?.length > 0 ?
                                    otherSites?.map(s =>
                                        <Menu.Item
                                            component={Link} href={`/site/${s.id}`}
                                            key={s.id}
                                        >
                                            {s.name}
                                        </Menu.Item>
                                    ) :
                                    <Text className="text-sm text-gray text-center py-md">
                                        No other sites
                                    </Text>}

                                <Menu.Item icon={<TbPlus />} color="primary" onClick={openCreateSiteModal}>
                                    New Site
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>

                        {isUpdating ?
                            <Text className="text-sm text-gray">Saving...</Text> :
                            <Text className="font-bold text-sm text-green">Saved!</Text>}
                    </Group>
                </div>
                <Divider />
                <div className="max-w-7xl w-full mx-auto p-md">
                    <Stack className="w-56 pointer-events-auto" key={`${router.query.siteId}-variants`}>
                        <Text className="font-bold">Variants</Text>

                        <Button leftIcon={<TbPlus />} compact variant="light" onClick={createAndSelectVariant}>
                            Add Variant
                        </Button>

                        <ScrollArea.Autosize mah="calc(100vh - 16rem)" offsetScrollbars>
                            <Stack className="gap-xs">
                                {site?.variants && Object.keys(site.variants).length > 0 ?
                                    Object.entries(site.variants).sort(sortFromEntries).map(([variantId]) =>
                                        <VariantSelector key={variantId} id={variantId} />
                                    ) :
                                    <Text className="text-sm text-gray text-center py-md">
                                        No variants
                                    </Text>}
                            </Stack>
                        </ScrollArea.Autosize>
                    </Stack>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto p-md">
                <div className="mt-40 ml-64">
                    {router.query.v ?
                        <VariantView /> :
                        <Text className="text-gray text-center py-md">
                            Select a variant
                        </Text>}
                </div>
            </div>
        </>
    )
}


function VariantSelector({ id }) {

    const router = useRouter()

    const { data: site } = useDocument([SITES_COLLECTION, router.query.siteId])
    const variant = site?.variants[id]
    const active = router.query.v === id

    return (
        <Link href={`/site/${router.query.siteId}?v=${id}`} className="no-underline text-dark">
            <Group
                className={classNames(
                    "pl-xl pr-xs py-xs rounded-md gap-xl justify-between hover:bg-primary-100",
                    active && "bg-primary-50"
                )}
            >
                <Text className="font-medium">
                    {variant?.name}
                </Text>
            </Group>
        </Link>
    )
}


function VariantView() {

    const router = useRouter()
    const variantId = router.query.v

    const { data: site, update } = useDocument([SITES_COLLECTION, router.query.siteId])
    const variant = site?.variants[variantId]

    const [nameError, setNameError] = useState(false)
    const [name, setName] = useRemoteValue(variant?.name, async val => {
        if (!val)
            return setNameError("Name cannot be empty")

        if (!/^[a-zA-Z0-9_-]+$/.test(val))
            return setNameError("Name can only contain letters, numbers, dashes, and underscores")

        if (site?.variants && Object.entries(site.variants).some(([key, v]) => key !== variantId && v.name === val))
            return setNameError("This name is already taken")

        setNameError(false)
        await update.mutateAsync({ [`variants.${variantId}.name`]: val })
    })

    const addElement = async () => {
        const newId = generateId()
        await update.mutateAsync({
            [`elements.${newId}`]: defaultElement(undefined, site?.elements),
        })
    }

    const deleteVariant = () => {
        update.mutate({
            [`variants.${variantId}`]: deleteField(),
        })
        router.push(`/site/${router.query.siteId}`)
    }

    const duplicateAndSelectVariant = async () => {
        const newId = generateId()
        const newProps = _.pick(defaultVariant(variant.name, site?.variants), ["name", "createdAt"])

        await update.mutateAsync({
            [`variants.${newId}`]: {
                ...variant,
                ...newProps,
            },
        })
        router.push(`/site/${router.query.siteId}?v=${newId}`)
    }

    return (
        <Stack className="mb-36" key={router.query.v}>
            <Group className="justify-end">
                <Button leftIcon={<TbCopy />} color="gray" variant="subtle" onClick={duplicateAndSelectVariant}>
                    Duplicate Variant
                </Button>
                <Button leftIcon={<TbTrash />} color="red" variant="subtle" onClick={deleteVariant}>
                    Delete Variant
                </Button>
            </Group>

            <TextInput
                label="Variant Name"
                description="Must be unique and only contain letters, numbers, dashes, and underscores."
                placeholder="variant_name"
                value={name}
                onChange={ev => setName(ev.currentTarget.value)}
                error={nameError}
            />

            <Divider className="my-xl" />

            <Text className="font-bold">
                Elements
            </Text>

            {site?.elements && Object.keys(site.elements).length > 0 ?
                Object.entries(site.elements).sort(sortFromEntries).map(([elementId]) =>
                    <ElementEditor id={elementId} key={elementId} />
                ) :
                <Text className="text-gray text-sm text-center py-md">
                    No elements yet
                </Text>}

            <Button
                leftIcon={<TbTextPlus />} variant="light"
                className="mx-auto max-w-xl w-full"
                onClick={addElement}
            >
                Add Element
            </Button>
        </Stack>
    )
}


function ElementEditor({ id: elementId }) {

    const router = useRouter()
    const variantId = router.query.v

    const { data: site, update } = useDocument([SITES_COLLECTION, router.query.siteId])
    const element = site?.elements[elementId]
    const elementVariant = site?.variants[variantId]?.elements[elementId]

    const [targetIdError, setTargetIdError] = useState(false)
    const [targetId, setTargetId] = useRemoteValue(element?.targetId, async val => {
        if (!val)
            return setTargetIdError("Name cannot be empty")

        if (!/^[a-zA-Z0-9_-]+$/.test(val))
            return setTargetIdError("Name can only contain letters, numbers, dashes, and underscores")

        if (site?.elements && Object.entries(site.elements).some(([key, el]) => key !== elementId && el.targetId === val))
            return setTargetIdError("This ID is already taken")

        setTargetIdError(false)
        await update.mutateAsync({ [`elements.${elementId}.targetId`]: val })
    })

    const [hidden, setHidden] = useRemoteValue(elementVariant?.hidden || false, async val => {
        await update.mutateAsync({ [`variants.${variantId}.elements.${elementId}.hidden`]: val })
    })

    const [textContent, setTextContent] = useRemoteValue(elementVariant?.text || "", async val => {
        await update.mutateAsync({ [`variants.${variantId}.elements.${elementId}.text`]: val })
    })

    const deleteElement = () => {
        update.mutateAsync({
            [`variants.${variantId}.elements.${elementId}`]: deleteField(),
            [`elements.${elementId}`]: deleteField(),
        })
    }

    return (
        <Stack className="ml-md">
            <Group className="justify-between">
                <Text className="font-bold">
                    #{element?.targetId}
                </Text>

                <Group>
                    <Button leftIcon={<TbTrash />} color="red" variant="subtle" onClick={deleteElement}>
                        Delete Element
                    </Button>
                </Group>
            </Group>

            <TextInput
                label="Element ID"
                description="This corresponds to the ID of the element in your HTML. This changes across all variants."
                placeholder="target-id"
                value={targetId}
                onChange={ev => setTargetId(ev.currentTarget.value)}
                error={targetIdError}
                icon={<TbHash />}
            />

            <Switch
                label="Hidden"
                description="If checked, this element will be hidden on this variant."
                checked={hidden}
                onChange={ev => setHidden(ev.currentTarget.checked)}
            />

            {!hidden &&
                <Textarea
                    label="Text Content"
                    description="The text that will be displayed in this element."
                    placeholder="The next game-changing product is here!"
                    value={textContent}
                    onChange={ev => setTextContent(ev.currentTarget.value)}
                    autosize minRows={2} maxRows={10}
                />}

            <Divider className="my-md" />
        </Stack>
    )
}



