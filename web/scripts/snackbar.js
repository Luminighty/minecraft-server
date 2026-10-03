function Snackbar(text = "") {
	const wait = DebounceWaiterFn();
	const hideWait = DebounceWaiterFn();

	const element = document.createElement("div");
	element.classList.add("snackbar");
	element.innerText = text ?? "";

	document.body.appendChild(element);

	return {
		element,

		set text(data) {
			element.innerText = data;
		},

		get text() {
			return element.innerText;
		},

		async show(delay = 2000) {
			element.classList.remove("hide");
			element.classList.add("show");

			await wait(delay);

			element.classList.remove("show");
			element.classList.add("hide");

			await hideWait(500);

			element.classList.remove("hide");
		},
	};
}
