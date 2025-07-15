// A small helper function to get paths from an object via dot.notation syntax
const dig = (obj, path) => {
    if (typeof path === 'string') path = path.replace(/\[(\d+)]/g, '.$1').split('.');
    obj = obj[path.shift()];
    if (obj && path.length) return dig(obj, path);
    return obj;
}

const customLive = () => {
    // On this template we have a custom tag data-custom-live-editing
    const elements = [...document.querySelectorAll(`[data-custom-live-editing]`)].map(element => {
        // These tags are comma separated with the aspects of the element that should be live edited 
        const connections = element.dataset.customLiveEditing.split(`,`).map(connection => {
            // For each segment of this tag consists of an element attribute and a front matter path
            const [set, path] = connection.split(`:`);
            return { set, path };
        });
        return {
            dom: element,
            connections: connections
        };
    });

    // Apply an updated value to an element attribute
    const update = (element, attribute, value) => {
        if (attribute === "innerText") {
            element.innerText = value;
        } else if (attribute === "innerHTML") {
            element.innerHTML = value;
        } else if (attribute === "backgroundImage"){
            element.style.backgroundImage = `url(${value})`;
        } else if (attribute === "array"){
          console.log(element, value)
        } else {
            element.setAttribute(attribute, value);
        }
    }

    // Get latest CloudCannon front matter and apply it to relevant elements
    const render = async (CloudCannon) => {
        const latestValue = await CloudCannon.value();

        elements.forEach(element => {
            element.connections.forEach(connection => {
                const newValue = dig(latestValue, connection.path);
                if (newValue) {
                    update(element.dom, connection.set, newValue);
                }
            });
        });
    }

    // Handle the CloudCannon visual editor initializing
    document.addEventListener('cloudcannon:load', function (e) {
        e.detail.CloudCannon.enableEvents();
    });
    // Handle the CloudCannon event for front matter being changed on the page
    document.addEventListener('cloudcannon:update', async function (e) {
        render(e.detail.CloudCannon);
    });
}

customLive();