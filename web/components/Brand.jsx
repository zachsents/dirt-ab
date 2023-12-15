import { Group, Text } from "@mantine/core"
import siteInfo from "@web/site-info.json"
import classNames from "classnames"
import Link from "next/link"


export default function Brand({ className, src, includeText = false }) {
    return (
        <Link href="/" className="no-underline text-dark">
            <Group noWrap className={classNames("gap-lg", className)}>
                {includeText ?
                    <>
                        {!!src && <img
                            src={src}
                            alt={`${siteInfo.name} logo`}
                            className="h-9 w-auto aspect-square rounded-sm shrink-0"
                        />}
                        <Text className="text-xl md:text-2xl font-bold">
                            {siteInfo.name}
                        </Text>
                    </> :
                    src ? <img
                        src={src}
                        alt={`${siteInfo.name} logo`}
                        className="h-9 w-auto rounded-sm shrink-0"
                    /> : null}
            </Group>
        </Link>
    )
}
