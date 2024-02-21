// Put inside the backticks the space/newline separated list of instance domains
const input = `

`

main(input.trim().split(/\s+/))

async function main(domains) {
	console.log("Fetching nodeinfo data, this may take a while ...")

	const closed = []
	const open = []
	const failed = []

	for (const domain of domains) {
		try {
			const { software, openRegistrations } = await fetchNodeInfo(domain)
			const list = openRegistrations ? open : closed

			list.push({
				domain,
				software: `${software.name} ${software.version}`
			})
		} catch (error) {
			failed.push({
				domain,
				error: error.message
			})
		}
	}

	console.log("Done !", "\n")

	renderList(closed, "Closed", true)
	renderList(open, "Open", true)
	renderList(failed, "Failed to access registration state", false)
}

function fetchNodeInfo(domain) {
	return fetchJson(new URL("/.well-known/nodeinfo", `https://${domain}`))
		.then(index => fetchJson(index.links[0].href))
}

function fetchJson(url) {
	return fetch(url).then(response => {
		if (response.ok) {
			return response.json()
		} else {
			throw new Error(`${response.status} ${response.statusText}`)
		}
	})
}

function renderList(list, label, required) {
	if (!required && !list.length) {
		return
	}

	(required ? console.group : console.groupCollapsed)(`${label}`)

	if (list.length) {
		console.table(list)
	} else {
		console.log("Empty")
	}

	console.groupEnd()
}
