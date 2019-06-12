
var bgScript = (function() {

    if ( window.hasRun ) {
        return;
    }
    window.hasRun       =   true;
    var elementList     =   [];

    browser.runtime.onMessage.addListener( (message, send, sendResponse) => {
        if ( message.hasOwnProperty("color") ) {
            let index       = parseInt(message["position"]);
            elementList[index]["bgColor"] =   message["color"];
        } else {
            elementList.push(message);
        }
    });    

    function getElementList() {
        return elementList;
    }
          
    return {
        "elementList": getElementList,
        "clear": () => {
            // Clear the stored element list.
            elementList = [];
        }
    }
})();
