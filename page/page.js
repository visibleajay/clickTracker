
(function () {

    var backScript     =   browser.runtime.getBackgroundPage();

    backScript.then(  (page) => {

        var elementList =  page.bgScript.elementList();

        const parentDiv  = document.body;
        parentDiv.style.display   = "flex";
        parentDiv.style.flexDirection  =   "column";
        parentDiv.style.width          =   "400px";
        parentDiv.style.height         =   "300px";
        parentDiv.style.margin         =   "20px";
        parentDiv.style.overflowY      =   "scroll";
        parentDiv.style.background     =   "transparent";

        let isFirst =   true; 

        for ( let index in elementList ) {
            
            const prop      =   elementList[index];
            let btnElement  =   getBtnElement(prop);

            let clickedElementWidth    =   parseFloat(btnElement.firstElementChild.style.width);
            let clickedElementHeight   =   parseFloat(btnElement.firstElementChild.style.height);
            
            let permissibleElementWidth    =   150;
            let permissibleElementHeight   =   50;
            
            let hoverBtnWidth          =   150;
            let hoverBtnHeight         =   50;

            let [left, top] = isFirst ? [20, 20] : computeTopLeft(parentDiv.lastElementChild, btnElement.firstElementChild);
            btnElement.style.position    =  "absolute";
            btnElement.style.top        =  top+"px";
            btnElement.style.left       =  left+"px";
            btnElement.addEventListener("click", function ($event){
                computeQuerySelector($event, index);
            });
            parentDiv.appendChild(btnElement);
            if ( prop.hasOwnProperty("bgColor") ) {
                addBgColorToBtn(btnElement.firstElementChild, prop["bgColor"]);
            }
            isFirst         =   false;
        }
    }, err => {
        console.log("Error  ", err);
    });


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

    function addBgColorToBtn( element, randomColor ) {
        let btnElement = element;
        while (btnElement.parentElement.nodeName.toLowerCase() != "body" ) {
            btnElement.style.background    =   randomColor;
            btnElement   =   btnElement.parentElement;
        }
        btnElement.style.background    =   randomColor;
        return btnElement
    }

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

    function computeTopLeft( previousElement, currentElement ) {

        let previousElementOffset = previousElement.getBoundingClientRect();

        let previousElementTop  =   previousElementOffset.top;
        let previousElementHeight =  previousElementOffset.height;

        let parentLeft    = 20, parentTop = previousElementTop + previousElementHeight + 20;;
        
        return [parentLeft, parentTop];
    }

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
