define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDesignSystem = void 0;
    const el = (str, elementType, container) => {
        const el = document.createElement(elementType);
        el.innerHTML = str;
        container.appendChild(el);
        return el;
    };
    // The Playground Plugin design system
    const createDesignSystem = (sandbox) => {
        const ts = sandbox.ts;
        return (container) => {
            const clear = () => {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            };
            let decorations = [];
            let decorationLock = false;
            const clearDeltaDecorators = (force) => {
                // console.log(`clearing, ${decorations.length}}`)
                // console.log(sandbox.editor.getModel()?.getAllDecorations())
                if (force) {
                    sandbox.editor.deltaDecorations(decorations, []);
                    decorations = [];
                    decorationLock = false;
                }
                else if (!decorationLock) {
                    sandbox.editor.deltaDecorations(decorations, []);
                    decorations = [];
                }
            };
            /** Lets a HTML Element hover to highlight code in the editor  */
            const addEditorHoverToElement = (element, pos, config) => {
                element.onmouseenter = () => {
                    if (!decorationLock) {
                        const model = sandbox.getModel();
                        const start = model.getPositionAt(pos.start);
                        const end = model.getPositionAt(pos.end);
                        decorations = sandbox.editor.deltaDecorations(decorations, [
                            {
                                range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                options: { inlineClassName: "highlight-" + config.type },
                            },
                        ]);
                    }
                };
                element.onmouseleave = () => {
                    clearDeltaDecorators();
                };
            };
            const declareRestartRequired = (i) => {
                if (document.getElementById("restart-required"))
                    return;
                const localize = i || window.i;
                const li = document.createElement("li");
                li.id = "restart-required";
                const a = document.createElement("a");
                a.style.color = "#c63131";
                a.textContent = localize("play_sidebar_options_restart_required");
                a.href = "#";
                a.onclick = () => document.location.reload();
                const nav = document.getElementsByClassName("navbar-right")[0];
                li.appendChild(a);
                nav.insertBefore(li, nav.firstChild);
            };
            const localStorageOption = (setting) => {
                // Think about this as being something which you want enabled by default and can suppress whether
                // it should do something.
                const invertedLogic = setting.emptyImpliesEnabled;
                const li = document.createElement("li");
                const label = document.createElement("label");
                const split = setting.oneline ? "" : "<br/>";
                label.innerHTML = `<span>${setting.display}</span>${split}${setting.blurb}`;
                const key = setting.flag;
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = key;
                input.checked = invertedLogic ? !localStorage.getItem(key) : !!localStorage.getItem(key);
                input.onchange = () => {
                    if (input.checked) {
                        if (!invertedLogic)
                            localStorage.setItem(key, "true");
                        else
                            localStorage.removeItem(key);
                    }
                    else {
                        if (invertedLogic)
                            localStorage.setItem(key, "true");
                        else
                            localStorage.removeItem(key);
                    }
                    if (setting.onchange) {
                        setting.onchange(!!localStorage.getItem(key));
                    }
                    if (setting.requireRestart) {
                        declareRestartRequired();
                    }
                };
                label.htmlFor = input.id;
                li.appendChild(input);
                li.appendChild(label);
                container.appendChild(li);
                return li;
            };
            const button = (settings) => {
                const join = document.createElement("input");
                join.type = "button";
                join.value = settings.label;
                if (settings.onclick) {
                    join.onclick = settings.onclick;
                }
                container.appendChild(join);
                return join;
            };
            const code = (code) => {
                const createCodePre = document.createElement("pre");
                const codeElement = document.createElement("code");
                codeElement.innerHTML = code;
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
                return codeElement;
            };
            const showEmptyScreen = (message) => {
                clear();
                const noErrorsMessage = document.createElement("div");
                noErrorsMessage.id = "empty-message-container";
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message;
                messageDiv.classList.add("empty-plugin-message");
                noErrorsMessage.appendChild(messageDiv);
                container.appendChild(noErrorsMessage);
                return noErrorsMessage;
            };
            const createTabBar = () => {
                const tabBar = document.createElement("div");
                tabBar.classList.add("playground-plugin-tabview");
                /** Support left/right in the tab bar for accessibility */
                let tabFocus = 0;
                tabBar.addEventListener("keydown", e => {
                    const tabs = tabBar.querySelectorAll('[role="tab"]');
                    // Move right
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        tabs[tabFocus].setAttribute("tabindex", "-1");
                        if (e.key === "ArrowRight") {
                            tabFocus++;
                            // If we're at the end, go to the start
                            if (tabFocus >= tabs.length) {
                                tabFocus = 0;
                            }
                            // Move left
                        }
                        else if (e.key === "ArrowLeft") {
                            tabFocus--;
                            // If we're at the start, move to the end
                            if (tabFocus < 0) {
                                tabFocus = tabs.length - 1;
                            }
                        }
                        tabs[tabFocus].setAttribute("tabindex", "0");
                        tabs[tabFocus].focus();
                    }
                });
                container.appendChild(tabBar);
                return tabBar;
            };
            const createTabButton = (text) => {
                const element = document.createElement("button");
                element.setAttribute("role", "tab");
                element.textContent = text;
                return element;
            };
            const listDiags = (model, diags) => {
                const errorUL = document.createElement("ul");
                errorUL.className = "compiler-diagnostics";
                errorUL.onmouseleave = ev => {
                    clearDeltaDecorators();
                };
                container.appendChild(errorUL);
                diags.forEach(diag => {
                    const li = document.createElement("li");
                    li.classList.add("diagnostic");
                    switch (diag.category) {
                        case 0:
                            li.classList.add("warning");
                            break;
                        case 1:
                            li.classList.add("error");
                            break;
                        case 2:
                            li.classList.add("suggestion");
                            break;
                        case 3:
                            li.classList.add("message");
                            break;
                    }
                    if (typeof diag === "string") {
                        li.textContent = diag;
                    }
                    else {
                        li.textContent = sandbox.ts.flattenDiagnosticMessageText(diag.messageText, "\n", 4);
                    }
                    errorUL.appendChild(li);
                    if (diag.start && diag.length) {
                        addEditorHoverToElement(li, { start: diag.start, end: diag.start + diag.length }, { type: "error" });
                    }
                    li.onclick = () => {
                        if (diag.start && diag.length) {
                            const start = model.getPositionAt(diag.start);
                            sandbox.editor.revealLine(start.lineNumber);
                            const end = model.getPositionAt(diag.start + diag.length);
                            decorations = sandbox.editor.deltaDecorations(decorations, [
                                {
                                    range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                    options: { inlineClassName: "error-highlight", isWholeLine: true },
                                },
                            ]);
                            decorationLock = true;
                            setTimeout(() => {
                                decorationLock = false;
                                sandbox.editor.deltaDecorations(decorations, []);
                            }, 300);
                        }
                    };
                });
                return errorUL;
            };
            const showOptionList = (options, style) => {
                const ol = document.createElement("ol");
                ol.className = style.style === "separated" ? "playground-options" : "playground-options tight";
                options.forEach(option => {
                    if (style.style === "rows")
                        option.oneline = true;
                    if (style.requireRestart)
                        option.requireRestart = true;
                    const settingButton = localStorageOption(option);
                    ol.appendChild(settingButton);
                });
                container.appendChild(ol);
            };
            const createASTTree = (node) => {
                const div = document.createElement("div");
                div.className = "ast";
                const infoForNode = (node) => {
                    const name = ts.SyntaxKind[node.kind];
                    return {
                        name,
                    };
                };
                const renderLiteralField = (key, value, info) => {
                    const li = document.createElement("li");
                    const typeofSpan = `ast-node-${typeof value}`;
                    let suffix = "";
                    if (key === "kind") {
                        suffix = ` (SyntaxKind.${info.name})`;
                    }
                    li.innerHTML = `${key}: <span class='${typeofSpan}'>${value}</span>${suffix}`;
                    return li;
                };
                const renderSingleChild = (key, value, depth) => {
                    const li = document.createElement("li");
                    li.innerHTML = `${key}: `;
                    renderItem(li, value, depth + 1);
                    return li;
                };
                const renderManyChildren = (key, nodes, depth) => {
                    const childers = document.createElement("div");
                    childers.classList.add("ast-children");
                    const li = document.createElement("li");
                    li.innerHTML = `${key}: [<br/>`;
                    childers.appendChild(li);
                    nodes.forEach(node => {
                        renderItem(childers, node, depth + 1);
                    });
                    const liEnd = document.createElement("li");
                    liEnd.innerHTML += "]";
                    childers.appendChild(liEnd);
                    return childers;
                };
                const renderItem = (parentElement, node, depth) => {
                    const itemDiv = document.createElement("div");
                    parentElement.appendChild(itemDiv);
                    itemDiv.className = "ast-tree-start";
                    itemDiv.attributes.setNamedItem;
                    // @ts-expect-error
                    itemDiv.dataset.pos = node.pos;
                    // @ts-expect-error
                    itemDiv.dataset.end = node.end;
                    // @ts-expect-error
                    itemDiv.dataset.depth = depth;
                    if (depth === 0)
                        itemDiv.classList.add("open");
                    const info = infoForNode(node);
                    const a = document.createElement("a");
                    a.classList.add("node-name");
                    a.textContent = info.name;
                    itemDiv.appendChild(a);
                    a.onclick = _ => a.parentElement.classList.toggle("open");
                    addEditorHoverToElement(a, { start: node.pos, end: node.end }, { type: "info" });
                    const properties = document.createElement("ul");
                    properties.className = "ast-tree";
                    itemDiv.appendChild(properties);
                    Object.keys(node).forEach(field => {
                        if (typeof field === "function")
                            return;
                        if (field === "parent" || field === "flowNode")
                            return;
                        const value = node[field];
                        if (typeof value === "object" && Array.isArray(value) && value[0] && "pos" in value[0] && "end" in value[0]) {
                            //  Is an array of Nodes
                            properties.appendChild(renderManyChildren(field, value, depth));
                        }
                        else if (typeof value === "object" && "pos" in value && "end" in value) {
                            // Is a single child property
                            properties.appendChild(renderSingleChild(field, value, depth));
                        }
                        else {
                            properties.appendChild(renderLiteralField(field, value, info));
                        }
                    });
                };
                renderItem(div, node, 0);
                container.append(div);
                return div;
            };
            const createTextInput = (config) => {
                const form = document.createElement("form");
                const textbox = document.createElement("input");
                textbox.id = config.id;
                textbox.placeholder = config.placeholder;
                textbox.autocomplete = "off";
                textbox.autocapitalize = "off";
                textbox.spellcheck = false;
                // @ts-ignore
                textbox.autocorrect = "off";
                const localStorageKey = "playground-input-" + config.id;
                if (config.value) {
                    textbox.value = config.value;
                }
                else if (config.keepValueAcrossReloads) {
                    const storedQuery = localStorage.getItem(localStorageKey);
                    if (storedQuery)
                        textbox.value = storedQuery;
                }
                if (config.isEnabled) {
                    const enabled = config.isEnabled(textbox);
                    textbox.classList.add(enabled ? "good" : "bad");
                }
                else {
                    textbox.classList.add("good");
                }
                const textUpdate = (e) => {
                    const href = e.target.value.trim();
                    if (config.keepValueAcrossReloads) {
                        localStorage.setItem(localStorageKey, href);
                    }
                    if (config.onChanged)
                        config.onChanged(e.target.value, textbox);
                };
                textbox.style.width = "90%";
                textbox.style.height = "2rem";
                textbox.addEventListener("input", textUpdate);
                // Suppress the enter key
                textbox.onkeydown = (evt) => {
                    if (evt.key === "Enter" || evt.code === "Enter") {
                        config.onEnter(textbox.value, textbox);
                        return false;
                    }
                };
                form.appendChild(textbox);
                container.appendChild(form);
                return form;
            };
            return {
                /** Clear the sidebar */
                clear,
                /** Present code in a pre > code  */
                code,
                /** Ideally only use this once, and maybe even prefer using subtitles everywhere */
                title: (title) => el(title, "h3", container),
                /** Used to denote sections, give info etc */
                subtitle: (subtitle) => el(subtitle, "h4", container),
                /** Used to show a paragraph */
                p: (subtitle) => el(subtitle, "p", container),
                /** When you can't do something, or have nothing to show */
                showEmptyScreen,
                /**
                 * Shows a list of hoverable, and selectable items (errors, highlights etc) which have code representation.
                 * The type is quite small, so it should be very feasible for you to massage other data to fit into this function
                 */
                listDiags,
                /** Lets you remove the hovers from listDiags etc */
                clearDeltaDecorators,
                /** Shows a single option in local storage (adds an li to the container BTW) */
                localStorageOption,
                /** Uses localStorageOption to create a list of options */
                showOptionList,
                /** Shows a full-width text input */
                createTextInput,
                /** Renders an AST tree */
                createASTTree,
                /** Creates an input button */
                button,
                /** Used to re-create a UI like the tab bar at the top of the plugins section */
                createTabBar,
                /** Used with createTabBar to add buttons */
                createTabButton,
                /** A general "restart your browser" message  */
                declareRestartRequired,
            };
        };
    };
    exports.createDesignSystem = createDesignSystem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRGVzaWduU3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvZHMvY3JlYXRlRGVzaWduU3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFtQkEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFXLEVBQUUsV0FBbUIsRUFBRSxTQUFrQixFQUFFLEVBQUU7UUFDbEUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUM5QyxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQTtRQUNsQixTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQyxDQUFBO0lBRUQsc0NBQXNDO0lBQy9CLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQUU7UUFDckQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUVyQixPQUFPLENBQUMsU0FBa0IsRUFBRSxFQUFFO1lBQzVCLE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUMsVUFBVSxFQUFFO29CQUMzQixTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtpQkFDNUM7WUFDSCxDQUFDLENBQUE7WUFDRCxJQUFJLFdBQVcsR0FBYSxFQUFFLENBQUE7WUFDOUIsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFBO1lBRTFCLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDNUMsa0RBQWtEO2dCQUNsRCw4REFBOEQ7Z0JBQzlELElBQUksS0FBSyxFQUFFO29CQUNULE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO29CQUNoRCxXQUFXLEdBQUcsRUFBRSxDQUFBO29C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Q0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztnQkFDcEQsNkNBQTZDO2dCQUM3QyxRQUFRLEVBQUUsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7Z0JBQzdELCtCQUErQjtnQkFDL0IsQ0FBQyxFQUFFLENBQUMsUUFBZ0IsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDO2dCQUNyRCwyREFBMkQ7Z0JBQzNELGVBQWU7Z0JBQ2Y7OzttQkFHRztnQkFDSCxTQUFTO2dCQUNULG9EQUFvRDtnQkFDcEQsb0JBQW9CO2dCQUNwQiwrRUFBK0U7Z0JBQy9FLGtCQUFrQjtnQkFDbEIsMERBQTBEO2dCQUMxRCxjQUFjO2dCQUNkLG9DQUFvQztnQkFDcEMsZUFBZTtnQkFDZiwwQkFBMEI7Z0JBQzFCLGFBQWE7Z0JBQ2IsOEJBQThCO2dCQUM5QixNQUFNO2dCQUNOLGdGQUFnRjtnQkFDaEYsWUFBWTtnQkFDWiw0Q0FBNEM7Z0JBQzVDLGVBQWU7Z0JBQ2YsZ0RBQWdEO2dCQUNoRCxzQkFBc0I7YUFDdkIsQ0FBQTtRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQXRkWSxRQUFBLGtCQUFrQixzQkFzZDlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTYW5kYm94IH0gZnJvbSBcInR5cGVzY3JpcHRsYW5nLW9yZy9zdGF0aWMvanMvc2FuZGJveFwiXG5pbXBvcnQgdHlwZSB7IERpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb24sIE5vZGUgfSBmcm9tIFwidHlwZXNjcmlwdFwiXG5cbmV4cG9ydCB0eXBlIExvY2FsU3RvcmFnZU9wdGlvbiA9IHtcbiAgYmx1cmI6IHN0cmluZ1xuICBmbGFnOiBzdHJpbmdcbiAgZGlzcGxheTogc3RyaW5nXG5cbiAgZW1wdHlJbXBsaWVzRW5hYmxlZD86IHRydWVcbiAgb25lbGluZT86IHRydWVcbiAgcmVxdWlyZVJlc3RhcnQ/OiB0cnVlXG4gIG9uY2hhbmdlPzogKG5ld1ZhbHVlOiBib29sZWFuKSA9PiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvbnNMaXN0Q29uZmlnID0ge1xuICBzdHlsZTogXCJzZXBhcmF0ZWRcIiB8IFwicm93c1wiXG4gIHJlcXVpcmVSZXN0YXJ0PzogdHJ1ZVxufVxuXG5jb25zdCBlbCA9IChzdHI6IHN0cmluZywgZWxlbWVudFR5cGU6IHN0cmluZywgY29udGFpbmVyOiBFbGVtZW50KSA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50VHlwZSlcbiAgZWwuaW5uZXJIVE1MID0gc3RyXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbClcbiAgcmV0dXJuIGVsXG59XG5cbi8vIFRoZSBQbGF5Z3JvdW5kIFBsdWdpbiBkZXNpZ24gc3lzdGVtXG5leHBvcnQgY29uc3QgY3JlYXRlRGVzaWduU3lzdGVtID0gKHNhbmRib3g6IFNhbmRib3gpID0+IHtcbiAgY29uc3QgdHMgPSBzYW5kYm94LnRzXG5cbiAgcmV0dXJuIChjb250YWluZXI6IEVsZW1lbnQpID0+IHtcbiAgICBjb25zdCBjbGVhciA9ICgpID0+IHtcbiAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpXG4gICAgICB9XG4gICAgfVxuICAgIGxldCBkZWNvcmF0aW9uczogc3RyaW5nW10gPSBbXVxuICAgIGxldCBkZWNvcmF0aW9uTG9jayA9IGZhbHNlXG5cbiAgICBjb25zdCBjbGVhckRlbHRhRGVjb3JhdG9ycyA9IChmb3JjZT86IHRydWUpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBjbGVhcmluZywgJHtkZWNvcmF0aW9ucy5sZW5ndGh9fWApXG4gICAgICAvLyBjb25zb2xlLmxvZyhzYW5kYm94LmVkaXRvci5nZXRNb2RlbCgpPy5nZXRBbGxEZWNvcmF0aW9ucygpKVxuICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgIHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtdKVxuICAgICAgICBkZWNvcmF0aW9ucyA9IFtdXG4gICAgICAgIGRlY29yYXRpb25Mb2NrID0gZmFsc2VcbiAgICAgIH0gZWxzZSBpZiAoIWRlY29yYXRpb25Mb2NrKSB7XG4gICAgICAgIHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtdKVxuICAgICAgICBkZWNvcmF0aW9ucyA9IFtdXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIExldHMgYSBIVE1MIEVsZW1lbnQgaG92ZXIgdG8gaGlnaGxpZ2h0IGNvZGUgaW4gdGhlIGVkaXRvciAgKi9cbiAgICBjb25zdCBhZGRFZGl0b3JIb3ZlclRvRWxlbWVudCA9IChcbiAgICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgICAgcG9zOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH0sXG4gICAgICBjb25maWc6IHsgdHlwZTogXCJlcnJvclwiIHwgXCJpbmZvXCIgfVxuICAgICkgPT4ge1xuICAgICAgZWxlbWVudC5vbm1vdXNlZW50ZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghZGVjb3JhdGlvbkxvY2spIHtcbiAgICAgICAgICBjb25zdCBtb2RlbCA9IHNhbmRib3guZ2V0TW9kZWwoKVxuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gbW9kZWwuZ2V0UG9zaXRpb25BdChwb3Muc3RhcnQpXG4gICAgICAgICAgY29uc3QgZW5kID0gbW9kZWwuZ2V0UG9zaXRpb25BdChwb3MuZW5kKVxuXG4gICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJhbmdlOiBuZXcgc2FuZGJveC5tb25hY28uUmFuZ2Uoc3RhcnQubGluZU51bWJlciwgc3RhcnQuY29sdW1uLCBlbmQubGluZU51bWJlciwgZW5kLmNvbHVtbiksXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiBcImhpZ2hsaWdodC1cIiArIGNvbmZpZy50eXBlIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5vbm1vdXNlbGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFyRGVsdGFEZWNvcmF0b3JzKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJlUmVzdGFydFJlcXVpcmVkID0gKGk/OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZykgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1yZXF1aXJlZFwiKSkgcmV0dXJuXG4gICAgICBjb25zdCBsb2NhbGl6ZSA9IGkgfHwgKHdpbmRvdyBhcyBhbnkpLmlcbiAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICBsaS5pZCA9IFwicmVzdGFydC1yZXF1aXJlZFwiXG5cbiAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgYS5zdHlsZS5jb2xvciA9IFwiI2M2MzEzMVwiXG4gICAgICBhLnRleHRDb250ZW50ID0gbG9jYWxpemUoXCJwbGF5X3NpZGViYXJfb3B0aW9uc19yZXN0YXJ0X3JlcXVpcmVkXCIpXG4gICAgICBhLmhyZWYgPSBcIiNcIlxuICAgICAgYS5vbmNsaWNrID0gKCkgPT4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuICAgICAgY29uc3QgbmF2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm5hdmJhci1yaWdodFwiKVswXVxuICAgICAgbGkuYXBwZW5kQ2hpbGQoYSlcbiAgICAgIG5hdi5pbnNlcnRCZWZvcmUobGksIG5hdi5maXJzdENoaWxkKVxuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsU3RvcmFnZU9wdGlvbiA9IChzZXR0aW5nOiBMb2NhbFN0b3JhZ2VPcHRpb24pID0+IHtcbiAgICAgIC8vIFRoaW5rIGFib3V0IHRoaXMgYXMgYmVpbmcgc29tZXRoaW5nIHdoaWNoIHlvdSB3YW50IGVuYWJsZWQgYnkgZGVmYXVsdCBhbmQgY2FuIHN1cHByZXNzIHdoZXRoZXJcbiAgICAgIC8vIGl0IHNob3VsZCBkbyBzb21ldGhpbmcuXG4gICAgICBjb25zdCBpbnZlcnRlZExvZ2ljID0gc2V0dGluZy5lbXB0eUltcGxpZXNFbmFibGVkXG5cbiAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKVxuICAgICAgY29uc3Qgc3BsaXQgPSBzZXR0aW5nLm9uZWxpbmUgPyBcIlwiIDogXCI8YnIvPlwiXG4gICAgICBsYWJlbC5pbm5lckhUTUwgPSBgPHNwYW4+JHtzZXR0aW5nLmRpc3BsYXl9PC9zcGFuPiR7c3BsaXR9JHtzZXR0aW5nLmJsdXJifWBcblxuICAgICAgY29uc3Qga2V5ID0gc2V0dGluZy5mbGFnXG4gICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICAgICAgaW5wdXQudHlwZSA9IFwiY2hlY2tib3hcIlxuICAgICAgaW5wdXQuaWQgPSBrZXlcblxuICAgICAgaW5wdXQuY2hlY2tlZCA9IGludmVydGVkTG9naWMgPyAhbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSA6ICEhbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KVxuXG4gICAgICBpbnB1dC5vbmNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGlucHV0LmNoZWNrZWQpIHtcbiAgICAgICAgICBpZiAoIWludmVydGVkTG9naWMpIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgXCJ0cnVlXCIpXG4gICAgICAgICAgZWxzZSBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGludmVydGVkTG9naWMpIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgXCJ0cnVlXCIpXG4gICAgICAgICAgZWxzZSBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZy5vbmNoYW5nZSkge1xuICAgICAgICAgIHNldHRpbmcub25jaGFuZ2UoISFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxuICAgICAgICB9XG4gICAgICAgIGlmIChzZXR0aW5nLnJlcXVpcmVSZXN0YXJ0KSB7XG4gICAgICAgICAgZGVjbGFyZVJlc3RhcnRSZXF1aXJlZCgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGFiZWwuaHRtbEZvciA9IGlucHV0LmlkXG5cbiAgICAgIGxpLmFwcGVuZENoaWxkKGlucHV0KVxuICAgICAgbGkuYXBwZW5kQ2hpbGQobGFiZWwpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobGkpXG4gICAgICByZXR1cm4gbGlcbiAgICB9XG5cbiAgICBjb25zdCBidXR0b24gPSAoc2V0dGluZ3M6IHsgbGFiZWw6IHN0cmluZzsgb25jbGljaz86IChldjogTW91c2VFdmVudCkgPT4gdm9pZCB9KSA9PiB7XG4gICAgICBjb25zdCBqb2luID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpXG4gICAgICBqb2luLnR5cGUgPSBcImJ1dHRvblwiXG4gICAgICBqb2luLnZhbHVlID0gc2V0dGluZ3MubGFiZWxcbiAgICAgIGlmIChzZXR0aW5ncy5vbmNsaWNrKSB7XG4gICAgICAgIGpvaW4ub25jbGljayA9IHNldHRpbmdzLm9uY2xpY2tcbiAgICAgIH1cblxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGpvaW4pXG4gICAgICByZXR1cm4gam9pblxuICAgIH1cblxuICAgIGNvbnN0IGNvZGUgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBjcmVhdGVDb2RlUHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInByZVwiKVxuICAgICAgY29uc3QgY29kZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY29kZVwiKVxuXG4gICAgICBjb2RlRWxlbWVudC5pbm5lckhUTUwgPSBjb2RlXG5cbiAgICAgIGNyZWF0ZUNvZGVQcmUuYXBwZW5kQ2hpbGQoY29kZUVsZW1lbnQpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ29kZVByZSlcblxuICAgICAgcmV0dXJuIGNvZGVFbGVtZW50XG4gICAgfVxuXG4gICAgY29uc3Qgc2hvd0VtcHR5U2NyZWVuID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgY2xlYXIoKVxuXG4gICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSBcImVtcHR5LW1lc3NhZ2UtY29udGFpbmVyXCJcblxuICAgICAgY29uc3QgbWVzc2FnZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIG1lc3NhZ2VEaXYudGV4dENvbnRlbnQgPSBtZXNzYWdlXG4gICAgICBtZXNzYWdlRGl2LmNsYXNzTGlzdC5hZGQoXCJlbXB0eS1wbHVnaW4tbWVzc2FnZVwiKVxuICAgICAgbm9FcnJvcnNNZXNzYWdlLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpXG5cbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub0Vycm9yc01lc3NhZ2UpXG4gICAgICByZXR1cm4gbm9FcnJvcnNNZXNzYWdlXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlVGFiQmFyID0gKCkgPT4ge1xuICAgICAgY29uc3QgdGFiQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgdGFiQmFyLmNsYXNzTGlzdC5hZGQoXCJwbGF5Z3JvdW5kLXBsdWdpbi10YWJ2aWV3XCIpXG5cbiAgICAgIC8qKiBTdXBwb3J0IGxlZnQvcmlnaHQgaW4gdGhlIHRhYiBiYXIgZm9yIGFjY2Vzc2liaWxpdHkgKi9cbiAgICAgIGxldCB0YWJGb2N1cyA9IDBcbiAgICAgIHRhYkJhci5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFicyA9IHRhYkJhci5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cInRhYlwiXScpXG4gICAgICAgIC8vIE1vdmUgcmlnaHRcbiAgICAgICAgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIiB8fCBlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikge1xuICAgICAgICAgIHRhYnNbdGFiRm9jdXNdLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIilcbiAgICAgICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSB7XG4gICAgICAgICAgICB0YWJGb2N1cysrXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgZW5kLCBnbyB0byB0aGUgc3RhcnRcbiAgICAgICAgICAgIGlmICh0YWJGb2N1cyA+PSB0YWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICB0YWJGb2N1cyA9IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1vdmUgbGVmdFxuICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09IFwiQXJyb3dMZWZ0XCIpIHtcbiAgICAgICAgICAgIHRhYkZvY3VzLS1cbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBzdGFydCwgbW92ZSB0byB0aGUgZW5kXG4gICAgICAgICAgICBpZiAodGFiRm9jdXMgPCAwKSB7XG4gICAgICAgICAgICAgIHRhYkZvY3VzID0gdGFicy5sZW5ndGggLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGFic1t0YWJGb2N1c10uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpXG4gICAgICAgICAgOyh0YWJzW3RhYkZvY3VzXSBhcyBhbnkpLmZvY3VzKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRhYkJhcilcbiAgICAgIHJldHVybiB0YWJCYXJcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVUYWJCdXR0b24gPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKVxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwidGFiXCIpXG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dFxuICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0RGlhZ3MgPSAobW9kZWw6IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuZWRpdG9yLklUZXh0TW9kZWwsIGRpYWdzOiBEaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10pID0+IHtcbiAgICAgIGNvbnN0IGVycm9yVUwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIilcbiAgICAgIGVycm9yVUwuY2xhc3NOYW1lID0gXCJjb21waWxlci1kaWFnbm9zdGljc1wiXG4gICAgICBlcnJvclVMLm9ubW91c2VsZWF2ZSA9IGV2ID0+IHtcbiAgICAgICAgY2xlYXJEZWx0YURlY29yYXRvcnMoKVxuICAgICAgfVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG5cbiAgICAgIGRpYWdzLmZvckVhY2goZGlhZyA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJkaWFnbm9zdGljXCIpXG4gICAgICAgIHN3aXRjaCAoZGlhZy5jYXRlZ29yeSkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJ3YXJuaW5nXCIpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJlcnJvclwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwic3VnZ2VzdGlvblwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwibWVzc2FnZVwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZGlhZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gZGlhZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gc2FuZGJveC50cy5mbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VUZXh0KGRpYWcubWVzc2FnZVRleHQsIFwiXFxuXCIsIDQpXG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JVTC5hcHBlbmRDaGlsZChsaSlcblxuICAgICAgICBpZiAoZGlhZy5zdGFydCAmJiBkaWFnLmxlbmd0aCkge1xuICAgICAgICAgIGFkZEVkaXRvckhvdmVyVG9FbGVtZW50KGxpLCB7IHN0YXJ0OiBkaWFnLnN0YXJ0LCBlbmQ6IGRpYWcuc3RhcnQgKyBkaWFnLmxlbmd0aCB9LCB7IHR5cGU6IFwiZXJyb3JcIiB9KVxuICAgICAgICB9XG5cbiAgICAgICAgbGkub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoZGlhZy5zdGFydCAmJiBkaWFnLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGRpYWcuc3RhcnQpXG4gICAgICAgICAgICBzYW5kYm94LmVkaXRvci5yZXZlYWxMaW5lKHN0YXJ0LmxpbmVOdW1iZXIpXG5cbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IG1vZGVsLmdldFBvc2l0aW9uQXQoZGlhZy5zdGFydCArIGRpYWcubGVuZ3RoKVxuICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByYW5nZTogbmV3IHNhbmRib3gubW9uYWNvLlJhbmdlKHN0YXJ0LmxpbmVOdW1iZXIsIHN0YXJ0LmNvbHVtbiwgZW5kLmxpbmVOdW1iZXIsIGVuZC5jb2x1bW4pLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiBcImVycm9yLWhpZ2hsaWdodFwiLCBpc1dob2xlTGluZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSB0cnVlXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgICBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXSlcbiAgICAgICAgICAgIH0sIDMwMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gZXJyb3JVTFxuICAgIH1cblxuICAgIGNvbnN0IHNob3dPcHRpb25MaXN0ID0gKG9wdGlvbnM6IExvY2FsU3RvcmFnZU9wdGlvbltdLCBzdHlsZTogT3B0aW9uc0xpc3RDb25maWcpID0+IHtcbiAgICAgIGNvbnN0IG9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpXG4gICAgICBvbC5jbGFzc05hbWUgPSBzdHlsZS5zdHlsZSA9PT0gXCJzZXBhcmF0ZWRcIiA/IFwicGxheWdyb3VuZC1vcHRpb25zXCIgOiBcInBsYXlncm91bmQtb3B0aW9ucyB0aWdodFwiXG5cbiAgICAgIG9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGUgPT09IFwicm93c1wiKSBvcHRpb24ub25lbGluZSA9IHRydWVcbiAgICAgICAgaWYgKHN0eWxlLnJlcXVpcmVSZXN0YXJ0KSBvcHRpb24ucmVxdWlyZVJlc3RhcnQgPSB0cnVlXG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ0J1dHRvbiA9IGxvY2FsU3RvcmFnZU9wdGlvbihvcHRpb24pXG4gICAgICAgIG9sLmFwcGVuZENoaWxkKHNldHRpbmdCdXR0b24pXG4gICAgICB9KVxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQob2wpXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQVNUVHJlZSA9IChub2RlOiBOb2RlKSA9PiB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBkaXYuY2xhc3NOYW1lID0gXCJhc3RcIlxuXG4gICAgICBjb25zdCBpbmZvRm9yTm9kZSA9IChub2RlOiBOb2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0cy5TeW50YXhLaW5kW25vZGUua2luZF1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHlwZSBOb2RlSW5mbyA9IFJldHVyblR5cGU8dHlwZW9mIGluZm9Gb3JOb2RlPlxuXG4gICAgICBjb25zdCByZW5kZXJMaXRlcmFsRmllbGQgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGluZm86IE5vZGVJbmZvKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGNvbnN0IHR5cGVvZlNwYW4gPSBgYXN0LW5vZGUtJHt0eXBlb2YgdmFsdWV9YFxuICAgICAgICBsZXQgc3VmZml4ID0gXCJcIlxuICAgICAgICBpZiAoa2V5ID09PSBcImtpbmRcIikge1xuICAgICAgICAgIHN1ZmZpeCA9IGAgKFN5bnRheEtpbmQuJHtpbmZvLm5hbWV9KWBcbiAgICAgICAgfVxuICAgICAgICBsaS5pbm5lckhUTUwgPSBgJHtrZXl9OiA8c3BhbiBjbGFzcz0nJHt0eXBlb2ZTcGFufSc+JHt2YWx1ZX08L3NwYW4+JHtzdWZmaXh9YFxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVuZGVyU2luZ2xlQ2hpbGQgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBOb2RlLCBkZXB0aDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGxpLmlubmVySFRNTCA9IGAke2tleX06IGBcblxuICAgICAgICByZW5kZXJJdGVtKGxpLCB2YWx1ZSwgZGVwdGggKyAxKVxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVuZGVyTWFueUNoaWxkcmVuID0gKGtleTogc3RyaW5nLCBub2RlczogTm9kZVtdLCBkZXB0aDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkZXJzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBjaGlsZGVycy5jbGFzc0xpc3QuYWRkKFwiYXN0LWNoaWxkcmVuXCIpXG5cbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgICAgbGkuaW5uZXJIVE1MID0gYCR7a2V5fTogWzxici8+YFxuICAgICAgICBjaGlsZGVycy5hcHBlbmRDaGlsZChsaSlcblxuICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgIHJlbmRlckl0ZW0oY2hpbGRlcnMsIG5vZGUsIGRlcHRoICsgMSlcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBsaUVuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgICBsaUVuZC5pbm5lckhUTUwgKz0gXCJdXCJcbiAgICAgICAgY2hpbGRlcnMuYXBwZW5kQ2hpbGQobGlFbmQpXG4gICAgICAgIHJldHVybiBjaGlsZGVyc1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZW5kZXJJdGVtID0gKHBhcmVudEVsZW1lbnQ6IEVsZW1lbnQsIG5vZGU6IE5vZGUsIGRlcHRoOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChpdGVtRGl2KVxuICAgICAgICBpdGVtRGl2LmNsYXNzTmFtZSA9IFwiYXN0LXRyZWUtc3RhcnRcIlxuICAgICAgICBpdGVtRGl2LmF0dHJpYnV0ZXMuc2V0TmFtZWRJdGVtXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgaXRlbURpdi5kYXRhc2V0LnBvcyA9IG5vZGUucG9zXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgaXRlbURpdi5kYXRhc2V0LmVuZCA9IG5vZGUuZW5kXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgaXRlbURpdi5kYXRhc2V0LmRlcHRoID0gZGVwdGhcblxuICAgICAgICBpZiAoZGVwdGggPT09IDApIGl0ZW1EaXYuY2xhc3NMaXN0LmFkZChcIm9wZW5cIilcblxuICAgICAgICBjb25zdCBpbmZvID0gaW5mb0Zvck5vZGUobm9kZSlcblxuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcbiAgICAgICAgYS5jbGFzc0xpc3QuYWRkKFwibm9kZS1uYW1lXCIpXG4gICAgICAgIGEudGV4dENvbnRlbnQgPSBpbmZvLm5hbWVcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChhKVxuICAgICAgICBhLm9uY2xpY2sgPSBfID0+IGEucGFyZW50RWxlbWVudCEuY2xhc3NMaXN0LnRvZ2dsZShcIm9wZW5cIilcbiAgICAgICAgYWRkRWRpdG9ySG92ZXJUb0VsZW1lbnQoYSwgeyBzdGFydDogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmQgfSwgeyB0eXBlOiBcImluZm9cIiB9KVxuXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIilcbiAgICAgICAgcHJvcGVydGllcy5jbGFzc05hbWUgPSBcImFzdC10cmVlXCJcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChwcm9wZXJ0aWVzKVxuXG4gICAgICAgIE9iamVjdC5rZXlzKG5vZGUpLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZmllbGQgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuXG4gICAgICAgICAgaWYgKGZpZWxkID09PSBcInBhcmVudFwiIHx8IGZpZWxkID09PSBcImZsb3dOb2RlXCIpIHJldHVyblxuXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSAobm9kZSBhcyBhbnkpW2ZpZWxkXVxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWVbMF0gJiYgXCJwb3NcIiBpbiB2YWx1ZVswXSAmJiBcImVuZFwiIGluIHZhbHVlWzBdKSB7XG4gICAgICAgICAgICAvLyAgSXMgYW4gYXJyYXkgb2YgTm9kZXNcbiAgICAgICAgICAgIHByb3BlcnRpZXMuYXBwZW5kQ2hpbGQocmVuZGVyTWFueUNoaWxkcmVuKGZpZWxkLCB2YWx1ZSwgZGVwdGgpKVxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIFwicG9zXCIgaW4gdmFsdWUgJiYgXCJlbmRcIiBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gSXMgYSBzaW5nbGUgY2hpbGQgcHJvcGVydHlcbiAgICAgICAgICAgIHByb3BlcnRpZXMuYXBwZW5kQ2hpbGQocmVuZGVyU2luZ2xlQ2hpbGQoZmllbGQsIHZhbHVlLCBkZXB0aCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMuYXBwZW5kQ2hpbGQocmVuZGVyTGl0ZXJhbEZpZWxkKGZpZWxkLCB2YWx1ZSwgaW5mbykpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZW5kZXJJdGVtKGRpdiwgbm9kZSwgMClcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQoZGl2KVxuICAgICAgcmV0dXJuIGRpdlxuICAgIH1cblxuICAgIHR5cGUgVGV4dElucHV0Q29uZmlnID0ge1xuICAgICAgaWQ6IHN0cmluZ1xuICAgICAgcGxhY2Vob2xkZXI6IHN0cmluZ1xuXG4gICAgICBvbkNoYW5nZWQ/OiAodGV4dDogc3RyaW5nLCBpbnB1dDogSFRNTElucHV0RWxlbWVudCkgPT4gdm9pZFxuICAgICAgb25FbnRlcjogKHRleHQ6IHN0cmluZywgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpID0+IHZvaWRcblxuICAgICAgdmFsdWU/OiBzdHJpbmdcbiAgICAgIGtlZXBWYWx1ZUFjcm9zc1JlbG9hZHM/OiB0cnVlXG4gICAgICBpc0VuYWJsZWQ/OiAoaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpID0+IGJvb2xlYW5cbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVUZXh0SW5wdXQgPSAoY29uZmlnOiBUZXh0SW5wdXRDb25maWcpID0+IHtcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiKVxuXG4gICAgICBjb25zdCB0ZXh0Ym94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpXG4gICAgICB0ZXh0Ym94LmlkID0gY29uZmlnLmlkXG4gICAgICB0ZXh0Ym94LnBsYWNlaG9sZGVyID0gY29uZmlnLnBsYWNlaG9sZGVyXG4gICAgICB0ZXh0Ym94LmF1dG9jb21wbGV0ZSA9IFwib2ZmXCJcbiAgICAgIHRleHRib3guYXV0b2NhcGl0YWxpemUgPSBcIm9mZlwiXG4gICAgICB0ZXh0Ym94LnNwZWxsY2hlY2sgPSBmYWxzZVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGV4dGJveC5hdXRvY29ycmVjdCA9IFwib2ZmXCJcblxuICAgICAgY29uc3QgbG9jYWxTdG9yYWdlS2V5ID0gXCJwbGF5Z3JvdW5kLWlucHV0LVwiICsgY29uZmlnLmlkXG5cbiAgICAgIGlmIChjb25maWcudmFsdWUpIHtcbiAgICAgICAgdGV4dGJveC52YWx1ZSA9IGNvbmZpZy52YWx1ZVxuICAgICAgfSBlbHNlIGlmIChjb25maWcua2VlcFZhbHVlQWNyb3NzUmVsb2Fkcykge1xuICAgICAgICBjb25zdCBzdG9yZWRRdWVyeSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGxvY2FsU3RvcmFnZUtleSlcbiAgICAgICAgaWYgKHN0b3JlZFF1ZXJ5KSB0ZXh0Ym94LnZhbHVlID0gc3RvcmVkUXVlcnlcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5pc0VuYWJsZWQpIHtcbiAgICAgICAgY29uc3QgZW5hYmxlZCA9IGNvbmZpZy5pc0VuYWJsZWQodGV4dGJveClcbiAgICAgICAgdGV4dGJveC5jbGFzc0xpc3QuYWRkKGVuYWJsZWQgPyBcImdvb2RcIiA6IFwiYmFkXCIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0Ym94LmNsYXNzTGlzdC5hZGQoXCJnb29kXCIpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRleHRVcGRhdGUgPSAoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGhyZWYgPSBlLnRhcmdldC52YWx1ZS50cmltKClcbiAgICAgICAgaWYgKGNvbmZpZy5rZWVwVmFsdWVBY3Jvc3NSZWxvYWRzKSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obG9jYWxTdG9yYWdlS2V5LCBocmVmKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcub25DaGFuZ2VkKSBjb25maWcub25DaGFuZ2VkKGUudGFyZ2V0LnZhbHVlLCB0ZXh0Ym94KVxuICAgICAgfVxuXG4gICAgICB0ZXh0Ym94LnN0eWxlLndpZHRoID0gXCI5MCVcIlxuICAgICAgdGV4dGJveC5zdHlsZS5oZWlnaHQgPSBcIjJyZW1cIlxuICAgICAgdGV4dGJveC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGV4dFVwZGF0ZSlcblxuICAgICAgLy8gU3VwcHJlc3MgdGhlIGVudGVyIGtleVxuICAgICAgdGV4dGJveC5vbmtleWRvd24gPSAoZXZ0OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldnQua2V5ID09PSBcIkVudGVyXCIgfHwgZXZ0LmNvZGUgPT09IFwiRW50ZXJcIikge1xuICAgICAgICAgIGNvbmZpZy5vbkVudGVyKHRleHRib3gudmFsdWUsIHRleHRib3gpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0Ym94KVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pXG4gICAgICByZXR1cm4gZm9ybVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAvKiogQ2xlYXIgdGhlIHNpZGViYXIgKi9cbiAgICAgIGNsZWFyLFxuICAgICAgLyoqIFByZXNlbnQgY29kZSBpbiBhIHByZSA+IGNvZGUgICovXG4gICAgICBjb2RlLFxuICAgICAgLyoqIElkZWFsbHkgb25seSB1c2UgdGhpcyBvbmNlLCBhbmQgbWF5YmUgZXZlbiBwcmVmZXIgdXNpbmcgc3VidGl0bGVzIGV2ZXJ5d2hlcmUgKi9cbiAgICAgIHRpdGxlOiAodGl0bGU6IHN0cmluZykgPT4gZWwodGl0bGUsIFwiaDNcIiwgY29udGFpbmVyKSxcbiAgICAgIC8qKiBVc2VkIHRvIGRlbm90ZSBzZWN0aW9ucywgZ2l2ZSBpbmZvIGV0YyAqL1xuICAgICAgc3VidGl0bGU6IChzdWJ0aXRsZTogc3RyaW5nKSA9PiBlbChzdWJ0aXRsZSwgXCJoNFwiLCBjb250YWluZXIpLFxuICAgICAgLyoqIFVzZWQgdG8gc2hvdyBhIHBhcmFncmFwaCAqL1xuICAgICAgcDogKHN1YnRpdGxlOiBzdHJpbmcpID0+IGVsKHN1YnRpdGxlLCBcInBcIiwgY29udGFpbmVyKSxcbiAgICAgIC8qKiBXaGVuIHlvdSBjYW4ndCBkbyBzb21ldGhpbmcsIG9yIGhhdmUgbm90aGluZyB0byBzaG93ICovXG4gICAgICBzaG93RW1wdHlTY3JlZW4sXG4gICAgICAvKipcbiAgICAgICAqIFNob3dzIGEgbGlzdCBvZiBob3ZlcmFibGUsIGFuZCBzZWxlY3RhYmxlIGl0ZW1zIChlcnJvcnMsIGhpZ2hsaWdodHMgZXRjKSB3aGljaCBoYXZlIGNvZGUgcmVwcmVzZW50YXRpb24uXG4gICAgICAgKiBUaGUgdHlwZSBpcyBxdWl0ZSBzbWFsbCwgc28gaXQgc2hvdWxkIGJlIHZlcnkgZmVhc2libGUgZm9yIHlvdSB0byBtYXNzYWdlIG90aGVyIGRhdGEgdG8gZml0IGludG8gdGhpcyBmdW5jdGlvblxuICAgICAgICovXG4gICAgICBsaXN0RGlhZ3MsXG4gICAgICAvKiogTGV0cyB5b3UgcmVtb3ZlIHRoZSBob3ZlcnMgZnJvbSBsaXN0RGlhZ3MgZXRjICovXG4gICAgICBjbGVhckRlbHRhRGVjb3JhdG9ycyxcbiAgICAgIC8qKiBTaG93cyBhIHNpbmdsZSBvcHRpb24gaW4gbG9jYWwgc3RvcmFnZSAoYWRkcyBhbiBsaSB0byB0aGUgY29udGFpbmVyIEJUVykgKi9cbiAgICAgIGxvY2FsU3RvcmFnZU9wdGlvbixcbiAgICAgIC8qKiBVc2VzIGxvY2FsU3RvcmFnZU9wdGlvbiB0byBjcmVhdGUgYSBsaXN0IG9mIG9wdGlvbnMgKi9cbiAgICAgIHNob3dPcHRpb25MaXN0LFxuICAgICAgLyoqIFNob3dzIGEgZnVsbC13aWR0aCB0ZXh0IGlucHV0ICovXG4gICAgICBjcmVhdGVUZXh0SW5wdXQsXG4gICAgICAvKiogUmVuZGVycyBhbiBBU1QgdHJlZSAqL1xuICAgICAgY3JlYXRlQVNUVHJlZSxcbiAgICAgIC8qKiBDcmVhdGVzIGFuIGlucHV0IGJ1dHRvbiAqL1xuICAgICAgYnV0dG9uLFxuICAgICAgLyoqIFVzZWQgdG8gcmUtY3JlYXRlIGEgVUkgbGlrZSB0aGUgdGFiIGJhciBhdCB0aGUgdG9wIG9mIHRoZSBwbHVnaW5zIHNlY3Rpb24gKi9cbiAgICAgIGNyZWF0ZVRhYkJhcixcbiAgICAgIC8qKiBVc2VkIHdpdGggY3JlYXRlVGFiQmFyIHRvIGFkZCBidXR0b25zICovXG4gICAgICBjcmVhdGVUYWJCdXR0b24sXG4gICAgICAvKiogQSBnZW5lcmFsIFwicmVzdGFydCB5b3VyIGJyb3dzZXJcIiBtZXNzYWdlICAqL1xuICAgICAgZGVjbGFyZVJlc3RhcnRSZXF1aXJlZCxcbiAgICB9XG4gIH1cbn1cbiJdfQ==