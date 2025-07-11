const widget_container = document.getElementById("widget-container");
const stores = document.getElementsByClassName("store");
const score_element = document.getElementById("score");
let score = 5;
let super_gompei_count = 0;
let rainbow_gompei_count = 0;
let angle = 0;

function changeScore(amount) {
    score += amount;
    //set score element
    score_element.innerHTML = "Score: " + score;

    // Update the stores to show ones that are too expensive
    for (let store of stores) {
        let cost = parseInt(store.getAttribute("cost"));

        if (score < cost) {
            store.setAttribute("broke", "");
        } else {
            store.removeAttribute("broke");
        }
    }
}

function buy(store) {
    const cost = parseInt(store.getAttribute("cost"));
    const widget = store.firstElementChild.cloneNode(true);

    // check available to buy
    if (score < cost) {
        return;
    }

    if (store.getAttribute("name") === "Rainbow-Gompei") {
        const gompeis = document.querySelectorAll("#widget-container .gompei");
        let first_gompei = gompeis[0];
        // if first gompei exists
        if (first_gompei) {
            widget_container.insertBefore(widget, first_gompei.parentElement);
            first_gompei.parentElement.remove();
            rainbow_gompei_count += 1
            // first_gompei.classList = "rainbow-gompei"
            // first_gompei.parentElement.setAttribute("reap", 100);
            // first_gompei.parentElement.setAttribute("cooldown", .5);
            changeScore(-cost);
            widget.setAttribute("harvesting", "");
            setup_end_harvest(widget);

        }
        return;
    }

    // change score
    changeScore(-cost);

    if (store.getAttribute("name") === "Super-Gompei") {
        const super_gompei = document.querySelector("#widget-container .super-gompei")?.parentElement;
        // If Super-Gompei already exists
        if (super_gompei) {

            super_gompei_count += 1;

            super_gompei.setAttribute("reap", (parseInt(super_gompei.getAttribute("reap")) + 100));
            return;
        }
    }

    // clone node for widget, and add to container
    widget_container.appendChild(widget);

    if (widget.getAttribute("auto") == 'true') {
        widget.setAttribute("harvesting", "");
        setup_end_harvest(widget);
    } else {
        widget.onclick = () => {
            harvest(widget);
        }
    }
}

function setup_end_harvest(widget) {
    setTimeout(() => {
        // Remove the harvesting flag
        widget.removeAttribute("harvesting");
        // If automatic, start again
        if (widget.getAttribute("auto") == 'true') {
            harvest(widget);
        }
    }, parseFloat(widget.getAttribute("cooldown")) * 1000);
}

function harvest(widget) {
    // Only run if currently not harvesting
    if (widget.hasAttribute("harvesting")) return;
    // Set harvesting flag
    widget.setAttribute("harvesting", "");

    // If manual, collect points now
    changeScore(parseInt(widget.getAttribute("reap")));
    showPoint(widget);

    setup_end_harvest(widget);
}


function showPoint(widget) {
    let number = document.createElement("span");
    number.className = "point";
    number.innerHTML = "+" + widget.getAttribute("reap");
    number.onanimationend = () => {
        widget.removeChild(number);
    }
    widget.appendChild(number);
}

changeScore(0);

function onframe() {
    angle += 2 * (rainbow_gompei_count + 1);
    document.body.style = "--gompei-count: " + super_gompei_count + "; --angle:" + angle + "deg;"
    requestAnimationFrame(onframe)
}
onframe() 