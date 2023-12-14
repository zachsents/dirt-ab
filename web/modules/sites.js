import { modals } from "@mantine/modals"
import { addDoc, collection, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore"
import { fire } from "./firebase"
import { SITES_COLLECTION } from "./firestore"
import { useCollectionQuery, useUser } from "@zachsents/fire-query"
import { useRouter } from "next/router"


export function useSites(includeCurrent = true) {
    const router = useRouter()
    const { data: user } = useUser()

    const query = useCollectionQuery([SITES_COLLECTION], [
        user && where("owner", "==", user.uid),
    ])

    return [includeCurrent ? query.data : query.data?.filter(s => s.id !== router.query.siteId), query]
}

export const openCreateSiteModal = () => modals.openContextModal({
    modal: "CreateSite",
    title: "Create a new site",
    centered: true,
})

export const generateId = () => {
    return Math.random().toString(36).substring(2, 8)
}

export async function deleteSite(id) {
    await deleteDoc(doc(fire.db, SITES_COLLECTION, id))
}

export function confirmDeleteSite(id) {
    modals.openConfirmModal({
        title: "Delete site",
        children: "Are you sure you want to delete this site?",
        labels: { cancel: "Cancel", confirm: "Delete" },
        onConfirm: () => deleteSite(id),
        centered: true,
    })
}

export async function createSite({ name, owner }) {
    const docRef = await addDoc(collection(fire.db, SITES_COLLECTION), {
        name,
        createdAt: serverTimestamp(),
        elements: {},
        variants: {
            [generateId()]: defaultVariant("first_variant"),
        },
        owner,
    })

    return docRef.id
}

function getUniqueName(name, existing, existingProp, count) {
    const nameWithCount = count ? `${name}_${count}` : name
    if (existing && Object.values(existing).find(variant => variant[existingProp] === nameWithCount))
        return getUniqueName(name, existing, existingProp, count ? count + 1 : 2)
    return nameWithCount
}


export function defaultVariant(name = "new_variant", existingVariants) {
    return {
        createdAt: serverTimestamp(),
        name: getUniqueName(name, existingVariants, "name"),
        elements: {},
    }
}


export function defaultElement(targetId = "new-element", existingElements) {
    return {
        createdAt: serverTimestamp(),
        targetId: getUniqueName(targetId, existingElements, "targetId"),
    }
}