
let previousUrl = ""
new MutationObserver(async () => {
    if (window.location.href !== previousUrl) {
        previousUrl = window.location.href

        const urlParams = new URLSearchParams(window.location.search)
        const variantName = urlParams.get("dv")
        const hasVariantName = urlParams.has("dv")
        const shouldUseRandomVariant = hasVariantName && !variantName

        if (!hasVariantName) return

        const dirtScriptTag = document.getElementById("dirt-ab-site-script")
        const siteId = dirtScriptTag.getAttribute("data-site-id")

        const debugging = dirtScriptTag.getAttribute("data-debug") === "true"
        const debug = (...args) => debugging && console.debug("[Dirt A/B]", ...args)

        const siteDoc = await fetch(`https://firestore.googleapis.com/v1/projects/dirt-ab/databases/(default)/documents/sites/${siteId}`)
            .then(res => res.json())

        const variants = Object.values(siteDoc.fields.variants.mapValue.fields)
            .map(v => v.mapValue.fields)

        const variant = shouldUseRandomVariant
            ? variants[Math.floor(Math.random() * variants.length)]
            : variants.find(v => v.name.stringValue === variantName)

        const findElementTargetId = elId => siteDoc.fields.elements.mapValue.fields[elId].mapValue.fields.targetId.stringValue

        debug("Found variant:", variant.name.stringValue)

        Object.entries(variant.elements.mapValue.fields).forEach(([elementId, elementVariant]) => {
            const targetId = findElementTargetId(elementId)
            const domEl = document.getElementById(targetId)

            if (!domEl) return

            if (elementVariant.mapValue.fields.hidden?.booleanValue) {
                debug(`Hiding element #${targetId}`)
                domEl.style.display = "none"
                return
            }

            const textContent = elementVariant.mapValue.fields.text?.stringValue
            if (textContent) {
                debug(`Adding text for element #${targetId}:`, textContent)
                domEl.innerText = textContent
            }
        })
    }
}).observe(document, { subtree: true, childList: true })