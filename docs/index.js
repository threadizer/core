// import Threadizer from "@/index.js";
import Highlighter from "highlight.js";

const EXAMPLES = {
	"header": require("†/assets/examples/header.js").default,
	"quick-start": require("†/assets/examples/quick-start.js").default,
	"compiled-workers": require("†/assets/examples/compiled-workers.js").default,
};

import "†/assets/styles/main.scss";

document.addEventListener("DOMContentLoaded", async ()=>{

	EXAMPLES.header(document.querySelector("header"));

	document.querySelector(".logo .toggle-code").addEventListener("click", ()=>{

		document.querySelector(".logo").classList.toggle("show-code");

	});

	Array.from(document.querySelectorAll("pre")).forEach(( pre )=>{

		const ignoredTabs = `(^|\n)${ Array.from(pre.innerHTML.match(/^\t+/) || "")[0] }`;

		pre.innerHTML = pre.innerHTML.replace(new RegExp(ignoredTabs, "g"), "\n").replace(/\t+$/, "").replace(/^\n/, "");

		Highlighter.highlightElement(pre);

		const script = EXAMPLES[pre.dataset.script];

		if( script ){

			pre.parentElement.querySelector(".run-code").addEventListener("click", script);

		}

	});

	Array.from(document.querySelectorAll(".tabs")).forEach(( container )=>{

		const tabs = Array.from(container.querySelectorAll("ul > li"));

		const files = Array.from(container.querySelectorAll("pre"));

		for( let tab of tabs ){

			tab.addEventListener("click", ()=>{

				tabs.forEach(( parsedTab )=>{

					parsedTab.classList.toggle("current", parsedTab.dataset.tab === tab.dataset.tab);

				});

				files.forEach(( file )=>{

					file.style.display = file.dataset.tab === tab.dataset.tab ? "" : "none";

				});

			});

		}

		tabs[0].dispatchEvent(new Event("click"));

	});

	// const canvas = document.createElement("canvas");

	// document.body.appendChild(canvas);

	// const offscreenCanvas = canvas.transferControlToOffscreen();

	// const thread = await new Threadizer(window.location.href + "worker.js");

	// thread.on("rendered", ()=>{

	// 	console.log("MAIN THREAD - Canvas has been rendered");

	// });

	// thread.transfer("canvas", offscreenCanvas, [offscreenCanvas]);

}, { once: true });
