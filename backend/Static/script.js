function addLog(message){

    let list = document.getElementById("logList")

    let item = document.createElement("li")

    item.textContent = new Date().toLocaleTimeString() + " - " + message

    list.appendChild(item)

}

function triggerAlert(){

    document.getElementById("alertStatus").innerText = "ALERT DETECTED"

    document.getElementById("alertStatus").style.color = "red"

    addLog("SOS Gesture detected")
    addLog("Image captured")
    addLog("SMS / WhatsApp alerts sent")

}

setTimeout(triggerAlert,10000)