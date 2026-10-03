const STATUS = {
	ERROR: "error",
	LOADING: "loading",
	ONLINE: "online",
}

function queryWidget(selector, ip) {
	const widget = $(selector);
	const elemName = widget.querySelector(".server-name .label");
	const elemMotd = widget.querySelector(".server-motd");
	const elemIcon = widget.querySelector(".server-icon");
	const elemOnline = widget.querySelector(".status-online");
	const elemPlayers = widget.querySelector(".players .count");
	const elemPlayersTooltip = widget.querySelector(".players .tooltip-text");

	const ONLINE_MAP = {
		[STATUS.LOADING]: "./assets/ping.loading.gif",
		[STATUS.ONLINE]: "./assets/ping.online.png",
		[STATUS.ERROR]: "./assets/ping.error.png",
	};

	return {
		widget,
		setData(body, silent=false) {
			elemName.innerText = body.title ?? elemName.innerText;
			elemMotd.innerHTML = body.motd ?? elemMotd.innerHTML ?? "";
			elemIcon.src = body.icon ?? elemIcon.src;
			elemOnline.src = ONLINE_MAP[body.status] ?? ONLINE_MAP.error
			if (body.playerCount != null && body.playerMax != null) {
				elemPlayers.textContent = `${body.playerCount} / ${body.playerMax}`
			} else if (!silent) {
				elemPlayers.textContent = "";
			}
				
			if (body.players?.length > 0) {
				elemPlayersTooltip.classList.remove("empty");
			} else {
				elemPlayersTooltip.classList.add("empty");
			}
			elemPlayersTooltip.innerHTML = (body.players ?? []).map((player) => 
				`<tr><td>${player}</td><td><img src="./assets/ping.online.png"/></td></tr>`
			).join("")
		},
		setLoading() {
			this.setData({ status: STATUS.LOADING }, true)
		},
		setError() {
			this.setData({
				motd: `<span class="motd-error">Failed to fetch server status.`,
				status: STATUS.ERROR,
			})
		},
		setOffline() {
			this.setData({
				motd: `<span class="motd-error">Server is offline.`,
				status: STATUS.ERROR
			})
		},
		refresh() {
			this.setLoading()
			fetch(`https://api.mcstatus.io/v2/status/java/${ip}`)
				.then((response) => response.json())
				.then((data) => {
					if (!data.online) {
						this.setOffline()
						return;
					}
					this.setData({
						title: data.host ?? SERVER_IP,
						motd: data.motd.html,
						icon: data.icon,
						status: STATUS.ONLINE,
						playerCount: data.players.online,
						playerMax: data.players.max,
						players: data.players.list.map((player) => player.name_clean),
					})
				})
				.catch((err) => {
					console.error(err)
					this.setError()
				})
		}
	};
}


function ServerStatus() {
	const serverStatus = queryWidget("#widget-server", SERVER_IP);
	serverStatus.refresh();
	setInterval(() => serverStatus.refresh(), 30_000);
	// serverStatus.setData({
	// 	title: "Custom title",
	// 	motd: `<span style="color: darkred">Hello?`,
	// 	status: STATUS.ONLINE,
	// 	playerCount: 12,
	// 	playerMax: 32,
	//	players: ["Luminighty", "Alias01", "LabRa7"],
	// })


	const snackbar = Snackbar("Server IP copied.")
	serverStatus.widget.addEventListener("click", async (e) => {
		await copyServerIp();
		snackbar.show()
	})
}

ServerStatus()
