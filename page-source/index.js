import Highlighter from "highlight.js";

const EXAMPLES = {
	"header": require("†/examples/header.js").default,
	"quick-start": require("†/examples/quick-start.js").default,
	"precompiled": require("†/examples/precompiled.js").default,
	"subworkers": require("†/examples/subworkers.js").default,
	"performance-worker": require("†/examples/performance-worker.js").default,
	"performance-main-thread": require("†/examples/performance-main-thread.js").default,
	"stream": require("†/examples/stream.js").default,
	"playground": require("†/examples/playground.js").default
};

import "†/assets/styles/main.scss";

document.addEventListener("DOMContentLoaded", async ()=>{

	let previousNow = 0;

	function checkLoop( now ){

		requestAnimationFrame(checkLoop);

		let delta = now - previousNow;

		if( delta > 1000 && document.hasFocus() ){

			console.log(`%cThe main-thread freezed during more than 1 second: ${ (delta / 1000).toFixed(1) }s`, "padding: 5px 15px; color: #D49F41; background-color: #322B08; border-radius: 5px;");

		}

		previousNow = now;

	};

	requestAnimationFrame(checkLoop);

	EXAMPLES.header(document.querySelector("header"));

	document.querySelector(".logo .toggle-code").addEventListener("click", ()=>{

		document.querySelector(".logo").classList.toggle("show-code");

	});

	Array.from(document.querySelectorAll("pre")).forEach(( pre )=>{

		const ignoredTabs = `(^|\n)${ Array.from(pre.innerHTML.match(/^\t+/) || "")[0] }`;

		pre.innerHTML = pre.innerHTML.replace(new RegExp(ignoredTabs, "g"), "\n").replace(/\t+$/, "").replace(/^\n/, "");

		const script = EXAMPLES[pre.dataset.script];
		const isEditable = pre.hasAttribute("contenteditable");

		if( isEditable ){

			const clone = pre.cloneNode(true);

			clone.removeAttribute("contenteditable");

			document.addEventListener("keydown", event => {

				if( event.key === "Enter" ){

					event.preventDefault();

					document.execCommand("insertLineBreak");
				}

			});

			pre.addEventListener("input", ()=>{

				clone.innerHTML = pre.innerHTML.replace(/<br\/>/g, "\n");

				Highlighter.highlightElement(clone);

			});

			pre.parentElement.appendChild(clone);

			pre.dispatchEvent(new Event("input"));

		}
		else {

			Highlighter.highlightElement(pre);

		}

		if( script ){

			const button = pre.parentElement.querySelector(".run-code");

			button.addEventListener("click", ()=>{

				if( !button.classList.contains("running") ){

					button.classList.add("pressed", "running");

					requestAnimationFrame(async ()=>{

						if( isEditable ){

							button.runningScript = await script(pre.innerHTML, ()=>{

								button.classList.remove("running");

								button.runningScript?.element?.remove();

							});

						}
						else {

							button.runningScript = await script(()=>{

								button.classList.remove("running");

								button.runningScript?.element?.remove();

							});

						}

						if( button.runningScript ){

							if( button.runningScript.element ){

								button.runningScript.element.classList.add("output");

								pre.parentElement.appendChild(button.runningScript.element);

							}

						}

						requestAnimationFrame(() => button.classList.remove("pressed"));

					});

				}
				else {

					button.classList.remove("running");

					button.runningScript?.destroy();

					button.runningScript?.element?.remove();

				}

			});

		}

	});

	await document.fonts.load("10px Fira Code");

	Array.from(document.querySelectorAll(".tabs")).forEach(( container )=>{

		const tabs = Array.from(container.querySelectorAll("ul > li"));

		const files = Array.from(container.querySelectorAll("[data-file]"));

		const maxHeight = files.map(file => file.getBoundingClientRect().height).sort(( a, b )=> a > b ? -1 : 1)[0];

		for( let file of files ){

			file.style.height = `${ maxHeight }px`;

		}

		for( let tab of tabs ){

			tab.addEventListener("click", ()=>{

				tabs.forEach(( parsedTab )=>{

					parsedTab.classList.toggle("current", parsedTab.dataset.tab === tab.dataset.tab);

				});

				files.forEach(( file )=>{

					file.style.display = file.dataset.file === tab.dataset.tab ? "" : "none";

				});

			});

		}

		const current = Math.max(0, files.findIndex(tab => tab.classList.contains("current")));

		tabs[current].dispatchEvent(new Event("click"));

	});

}, { once: true });
