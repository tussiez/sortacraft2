//WILL ONLY WORK IN MAIN THREAD (not in workers).

let alertNum = 0;
const Alerts = {
  alert: function (msg) {
    let wrapper = document.createElement("div");
    wrapper.setAttribute("id", "alert" + alertNum);
    wrapper.style = "position:absolute;display:table; vertical-align:center;width:100%;height:100%;";
    const parent = document.createElement("div");
    parent.style = "display:table-cell;vertical-align:middle; text-align:center;";
    wrapper.appendChild(parent);
    let child = document.createElement("div");
    child.style = "display:inline-block;vertical-align:middle; width:40%;border-radius:2px; background-color:white;z-index:100000;text-align:left;transition:opacity 0.2s ease, transform 0.1s ease;";
    child.innerHTML = "<h1 style='margin-top:5px;margin-bottom:3px;text-align:center;'>Alert!</h1><p style='margin-top:5px;margin-left:10px;color:gray;'>" + msg + "</p><div style='text-align:center;'><button id='dismissAlert" + alertNum + "' style='background-color:lightblue;bottom:4px;right:50px;width:30%;height:30px;color:white;border-radius:1px;border:none;margin-bottom:6px;'>Ok</button></div>";
    parent.appendChild(child);
    document.body.appendChild(wrapper);
    document.getElementById("dismissAlert" + alertNum).addEventListener("click", function () {
      child.style.transform = "translateY(5px)";
      window.setTimeout(function () {
        child.style.opacity = "0";
        child.style.transform = "translateY(-5px)";
        window.setTimeout(function () {
          wrapper.remove();
        }, 100);
      }, 100);
    });
  },
  alertBanner: function (msg, backgroundColor, opacity, zIndex, timeToShow/*In seconds*/) {
    if ("undefined" === typeof msg) throw new TypeError("Parameter \"msg\" (argument 1) is not defined!");
    if ("string" !== typeof backgroundColor) backgroundColor = "inherit";
    if ("number" !== typeof opacity) opacity = 1;
    if ("number" !== typeof zIndex) zIndex = 1;
    if ("number" !== typeof timeToShow) timeToShow = 5; /*Five seconds*/
    /*Convert to seconds*/
    timeToShow *= 1000;
    let banner = document.createElement("div");
    banner.style = "background-color: " + backgroundColor + ";color:white;opacity:" + opacity + ";text-align:center;z-index:" + zIndex + ";position:fixed;width:100%;top:0;left:0;";
    banner.innerHTML = "<p>" + msg + "</p>";
    document.body.appendChild(banner);
    window.setTimeout(function () {
      banner.remove();
    }, timeToShow);
  },
  msgHTML: function (content, timeout) {
    let div = document.createElement('div');
    let inner = document.createElement('inner');
    div.appendChild(inner);
    inner.setAttribute('style', 'margin:8px;padding:8px;');
    inner.innerHTML = content;
    div.setAttribute('style', 'height:30%;width:30%;background-color:#333;color:white;position:absolute;left:35%;top:35%;opacity:0;border-radius:5px;transition:opacity 0.2s ease,transform 0.3s ease;');
    document.body.appendChild(div);
    div.addEventListener('mousedown', hideEle);
    function hideEle() {
      div.style.opacity = '0';
      div.style.transform = 'translateY(-30%)';
      setTimeout(function () {
        document.body.removeChild(div);
      }, 500);
    }
    setTimeout(function () {
      div.style.opacity = '1'
      setTimeout(function () {
        div.style.opacity = '0';
        div.style.transform = 'translateY(-30%)';
        setTimeout(function () {
          if (div.parentNode == document.body) {
            document.body.removeChild(div);
          }
        }, 500);
      }, timeout * 1000)
    }, 500);
  }
};
export default Alerts;