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
	const elemPlayers = widget.querySelector(".player-count");

	const ONLINE_MAP = {
		[STATUS.LOADING]: "./ping.loading.gif",
		[STATUS.ONLINE]: "./ping.online.png",
		[STATUS.ERROR]: "./ping.error.png",
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
					})
				})
				.catch((err) => {
					console.err(err)
					this.setError()
				})
		}
	};
}


function ServerStatus() {
	const serverStatus = queryWidget("#widget-server", SERVER_IP);
	serverStatus.refresh();
	setInterval(() => serverStatus.refresh(), 30_000);


	const snackbar = Snackbar("Server IP copied.")
	serverStatus.widget.addEventListener("click", async (e) => {
		await copyServerIp();
		snackbar.show()
	})
}

ServerStatus()
