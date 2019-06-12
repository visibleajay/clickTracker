
(function () {

    var backScript     =   browser.runtime.getBackgroundPage();

    backScript.then(  (page) => {

        const rootElement  = createRootElement();
        addElementsToPage(rootElement, page.bgScript.elementList());
    }, err => {
        console.log("Error  ", err);
    });

    // Assign default style to rootElement.
    function createRootElement() {
        const rootElement           =   document.getElementById("root");
        rootElement.style.display   =   "flex";
        rootElement.style.flexDirection  =   "column";
        rootElement.style.width          =   "400px";
        rootElement.style.height         =   "300px";
        rootElement.style.margin         =   "20px";
        rootElement.style.overflowY      =   "scroll";
        rootElement.style.background     =   "transparent";
        return rootElement;
    }

    // Add elements from elementList to rootElement.
    function addElementsToPage(rootElement, elementList) {

        let isFirst =   true; 

        // Parse elementList and put each element as children to rootElement.
        for ( let index in elementList ) {
            
            const prop      =   elementList[index];
            let btnElement  =   getBtnElement(prop);

            let [left, top] = isFirst ? [20, 40] : computeTopLeft(rootElement.lastElementChild, btnElement.firstElementChild);
            btnElement.style.position    =  "absolute";
            btnElement.style.top        =  top+"px";
            btnElement.style.left       =  left+"px";
            btnElement.addEventListener("click", function ($event){
                computeQuerySelector($event, index);
            });
            rootElement.appendChild(btnElement);

            if ( prop.hasOwnProperty("bgColor") ) {
                addBgColorToBtn(btnElement.firstElementChild, prop["bgColor"]);
            }
            isFirst         =   false;
        }
    }

    // Pass selected element reference and color to content script 
    // for coloring the same color in opened web app.
    function computeQuerySelector($event, queryCounter) {

        const randomColor = getRandomColor();
        const firstElementChild = $event.target.firstElementChild ? $event.target.firstElementChild : $event.target;
        let btnElement = addBgColorToBtn(firstElementChild, randomColor);

        let nodeName    =  btnElement.firstElementChild.nodeName.toLowerCase();
        const className =  [].slice.call(btnElement.firstElementChild.classList).join(".");
    
        if ( className.length > 0 ) {
            nodeName    =   nodeName + "." + className;
        }

        $event.preventDefault();
        $event.stopPropagation();

        browser.tabs.query({active: true, currentWindow: true})
                .then( (tabs) => {
                    browser.tabs.sendMessage(tabs[0].id, {
                        "querySelector": nodeName,
                        "color": randomColor,
                        "text": btnElement.firstElementChild.textContent,
                        "index": queryCounter
                    });
                }).catch ( (err) => {
                    console.log("Browser query ", err);
                });
    }

    // Add Background Color to clicked element in page template.
    function addBgColorToBtn( element, randomColor ) {
        let btnElement = element;
        const rootElementId = "root";
        while (btnElement.parentElement.id.toLowerCase() != rootElementId ) {
            btnElement.style.background    =   randomColor;
            btnElement   =   btnElement.parentElement;
        }
        btnElement.style.background    =   randomColor;
        return btnElement
    }

    // Create a new btn with passed prop obj.
    function getBtnElement( prop ) {
        let element        = prop["target"];
        let cssList        = JSON.parse(prop["css"]);
        let btnElement     = document.createElement("button");
        btnElement.insertAdjacentHTML("afterbegin", element);
        for ( let css of cssList ) {
            const cssInfo = css.split(" : ");
            if ( cssInfo[1] ) btnElement.firstElementChild.style.setProperty(cssInfo[0], cssInfo[1], cssInfo[2]);
        }

        return btnElement;
    }

    // Compute absolute position of current element wrt previous element.
    function computeTopLeft( previousElement, currentElement ) {

        let previousElementOffset = previousElement.getBoundingClientRect();

        let previousElementTop  =   previousElementOffset.top;
        let previousElementHeight =  previousElementOffset.height;

        let parentLeft    = 20, parentTop = previousElementTop + previousElementHeight + 20;;
        
        return [parentLeft, parentTop];
    }

    // Fetch random color in HEX format.
    function getRandomColor() {
        let letters      =  "0123456789ABCDEF";
        let color        =  "#";
        let colorCounter =  0;
        for ( colorCounter; colorCounter<6; colorCounter ++) {
            let randomLetter = letters[Math.floor(Math.random()*16)];
            color += randomLetter;
        }
        return color;
    }

})();
