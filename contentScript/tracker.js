
document.addEventListener("click", (e) => {
    var elementCSS        = window.getComputedStyle(e.target);

    const cursor_property = elementCSS.getPropertyValue("cursor");

    if ( cursor_property != "pointer" ) return;

    var cssList =   [];
    for (let index in elementCSS) {
        let css_value   =   elementCSS.getPropertyValue(elementCSS[index]);
        cssList.push( elementCSS[index] + " :  " + css_value  + " : " + elementCSS.getPropertyPriority(elementCSS[index]) );
    }
    
    browser.runtime.sendMessage({"target": e.target.outerHTML, "css": JSON.stringify(cssList)}).then(function(message){
        console.log("add element to bg script ", message);
    }, err => {
        console.log("Error: in adding element to bg script  ", err);
    });
});

browser.runtime.onMessage.addListener( (message) => {
    const querySelector = message["querySelector"];
    const bgColor       = message["color"];
    const textContent   = message["text"];

    const allNodes      = document.querySelectorAll(querySelector);

    // Store selected color for a specific element identified with position in background script.
    browser.runtime.sendMessage({"color": message["color"], position: message["index"]})
    
    .then( (msg) => {
        console.log("added color to bg script  ", msg)
    }, err => {
        console.log("Error ", "err in adding color to bg script ", err);
    });

    // if nodes are greater than 1 than use textContent to identify the corresponding node.
    if ( allNodes.length > 1 ) {
        let node = [].slice.call(allNodes).filter( node  => node.textContent.toLowerCase() == textContent.toLowerCase() )[0];
        node.style.backgroundColor  =   bgColor;
    } else if ( allNodes.length == 1 ) {
        // Assign bg color to selected node.
        document.querySelector(querySelector).style.backgroundColor = bgColor;
    } else {
        console.error("Error 404:- Element Not Found. ", querySelector);
    }
});

