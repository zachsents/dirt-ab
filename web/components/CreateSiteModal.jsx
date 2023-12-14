import { Button, Group, Stack, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { createSite } from "@web/modules/sites"
import { useUser } from "@zachsents/fire-query"
import { useRouter } from "next/router"
import { useMutation } from "react-query"


export default function CreateSiteModal({ context, id }) {

    const router = useRouter()
    const { data: user } = useUser()

    const form = useForm({
        initialValues: {
            name: "",
        },
        validate: {
            name: value => !value,
        },
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const newSiteId = await createSite({
                name: form.values.name,
                owner: user.uid,
            })

            context.closeModal(id)
            router.push(`/site/${newSiteId}`)
        }
    })

    return (
        <form onSubmit={form.onSubmit(mutation.mutate)}>
            <Stack>
                <TextInput
                    label="Site Name"
                    placeholder="This doesn't really matter, it's just for you."
                    data-autofocus
                    {...form.getInputProps("name")}
                />
                <Group className="justify-end">
                    <Button
                        loading={mutation.isLoading}
                        disabled={!form.isValid()}
                        type="submit"
                    >
                        Create Site
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}
