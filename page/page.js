
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
            
            console.log("element index ", index);
            const prop      =   elementList[index];
            let btnElement  =   getBtnElement(prop);

            let clickedElementWidth    =   parseFloat(btnElement.firstElementChild.style.width);
            let clickedElementHeight   =   parseFloat(btnElement.firstElementChild.style.height);
            
            let permissibleElementWidth    =   150;
            let permissibleElementHeight   =   50;
            
            let hoverBtnWidth          =   150;
            let hoverBtnHeight         =   50;

            // if ( 
            //     ( isNaN(clickedElementWidth) || isNaN(clickedElementHeight) ) || 
            //     ( clickedElementWidth > permissibleElementWidth || clickedElementHeight > permissibleElementHeight )
            //     ) {

            //     let hoverBtnElement            =   document.createElement("button");
                
            //     hoverBtnElement.style.width    =   hoverBtnWidth + "px";
            //     hoverBtnElement.style.height   =   hoverBtnHeight + "px";
            //     hoverBtnElement.textContent    =   "Over Here";
            //     hoverBtnElement.style.backgroundColor  =   "#d3d3d3";
            //     hoverBtnElement.style.padding  =   "15px";

            //     btnElement.style.display        =   "none";

            //     btnElement.onclick              =  computeQuerySelector

            //     hoverBtnElement.appendChild(btnElement);

            //     hoverBtnElement.onmouseover =   () => {
            //         btnElement.style.zIndex     =   "10";
            //         btnElement.style.display    =   "block";
            //         btnElement.style.position      =   "absolute";
            //     }
            //     hoverBtnElement.onmouseleave =   () => {
            //         btnElement.style.display    =   "none";
            //     }
                
            //     // let previousElement     =   null;

            //     // if ( parentDiv.lastElementChild.style.height.length == 0 || parentDiv.lastElementChild.style.width.length == 0 ) {
            //     //     previousElement     =   parentDiv.lastElementChild.firstElementChild;
            //     // } else {
            //     //     previousElement     =   parentDiv.lastElementChild;
            //     // }

            //     let [left, top] =   isFirst ? [20, 20] : computeTopLeft(parentDiv.lastElementChild, hoverBtnElement);
            //     hoverBtnElement.style.position =   "absolute";
            //     hoverBtnElement.style.top   =   top+"px";
            //     hoverBtnElement.style.left  =   left+"px";
            //     console.log("hover element Top ", top);
            //     console.log("hover element Left ", left);

            //     parentDiv.appendChild(hoverBtnElement);

            // } else {
                let [left, top] = isFirst ? [20, 20] : computeTopLeft(parentDiv.lastElementChild, btnElement.firstElementChild);
                console.log("clicked element Top ", top);
                console.log("clicked element Left ", left);
                btnElement.style.position    =  "absolute";
                btnElement.style.top        =  top+"px";
                btnElement.style.left       =  left+"px";
                btnElement.addEventListener("click", function ($event){
                    computeQuerySelector($event, index);
                });
                parentDiv.appendChild(btnElement);
                // console.log(prop, btnElement);
                if ( prop.hasOwnProperty("bgColor") ) {
                    console.log("inside element " + prop["bgColor"]);
                    addBgColorToBtn(btnElement.firstElementChild, prop["bgColor"]);
                }
            // }
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

        let previousElementLeft =   previousElementOffset.left;
        let previousElementTop  =   previousElementOffset.top;

        let previousElementWidth =  previousElementOffset.width;
        let previousElementHeight =  previousElementOffset.height;

        let parentLeft    = 0, parentTop = 0;
        let requiredWidth = previousElementWidth + parseFloat(currentElement.style.width) + previousElementLeft + 20;
        
        // if ( requiredWidth <= 800 ) {
        //     parentTop     = previousElementTop;
        //     parentLeft    = previousElementLeft + previousElementWidth + 20;
        // } else {
            parentTop     = previousElementTop + previousElementHeight + 20;
            parentLeft    = 20;
        // }

        return [parentLeft, parentTop];
                /*  1) Decide first element
                    2) If first element, append with top: 20 and left as 20.
                    3) If second element, compute last element child top,left.
                    4) add offsetwidth and increment left by 20, check computed width + element size lesser than div width
                    5) Increment left.
                    6) else element width > available width, take left as 20 and top as previous element top + 20.
                    7) Append element to body
                    8) Redo the process for next element.
                */
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
