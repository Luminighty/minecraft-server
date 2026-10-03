function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

async function copyServerIp() {
	await navigator.clipboard.writeText(SERVER_IP)
}

function wait(ms) {
	return new Promise((resolve) => setTimeout(() => resolve(), ms))
}


function DebounceWaiterFn() {
	let lastTimeout = null;

	return (ms) => {
		if (lastTimeout)
			clearTimeout(lastTimeout)
		return new Promise((resolve) => {
			lastTimeout = setTimeout(() => resolve(), ms);
		})
	}
}

