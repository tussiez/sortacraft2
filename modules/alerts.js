/*Easy alerts
Main thread
@author Baconman321
@coauthor xxpertHacker
*/

const { Promise, TypeError, document, setTimeout } = globalThis;

const throwFromFunction = (
  argumentPosition = throwFromFunction(1, throwFromFunction),
  { name } = throwFromFunction(2, throwFromFunction),
) => {
  throw new TypeError(
    `Argument ${argumentPosition} was not passed to function "${name}"`,
  );
};

const delay = async (seconds = throwFromFunction(1, delay)) =>
  new Promise(
    (resolve) => setTimeout(resolve, 1000.0 * seconds),
  );

let alertNum = 0;

const Alerts = {
  alert: (msg) => {
    const wrapper = document.createElement("div");

    wrapper.setAttribute("id", `alert${alertNum}`);

    // should be a CSS class or ID instead ~ xxpertHacker
    wrapper.style =
      "position:absolute;display:table; vertical-align:center;width:100%;height:100%;";

    const parent = document.createElement("div");

    // ditto ~ xxpertHacker
    parent.style =
      "display:table-cell;vertical-align:middle; text-align:center;";

    wrapper.appendChild(parent);

    const child = document.createElement("div");
    child.style =
      "display:inline-block;vertical-align:middle; width:40%;border-radius:2px; background-color:white;z-index:100000;text-align:left;transition:opacity 0.2s ease, transform 0.1s ease;";
    child.innerHTML =
      `<h1 style='margin-top:5px;margin-bottom:3px;text-align:center;'>Alert!</h1><p style='margin-top:5px;margin-left:10px;color:gray;'>${msg}</p><div style='text-align:center;'><button id='dismissAlert${alertNum}' style='background-color:lightblue;bottom:4px;right:50px;width:30%;height:30px;color:white;border-radius:1px;border:none;margin-bottom:6px;'>Ok</button></div>`;
    // ditto, and don't use innerHTML, make a template and use Element#close() ~ xxpertHacker
    parent.appendChild(child);
    document.body.appendChild(wrapper);
    // don't target by IDs, use elements directly from the template above ^ ~ xxpertHacker
    document
      .getElementById(`dismissAlert${alertNum}`)
      .addEventListener(
        "click",
        async () => {
          // Probably the worst way to do it, but I suck at CSS...
          const { style } = child;

          // Use keyframes ~ xxpertHacker
          style.transform = "translateY(5px)";
          await delay(0.1);
          style.opacity = "0";
          style.transform = "translateY(-5px)";
          await delay(0.1);
          wrapper.remove();
        },
        {
          once: true,
        },
      );
  },
  alertBanner: async (
    msg = throwFromFunction(1, Alerts.alertBanner),
    backgroundColor = "inherit",
    opacity = 1,
    zIndex = 1,
    timeToShow = 5, /* In seconds */
  ) => {
    const banner = document.createElement("div");
    banner.style =
      `background-color: ${backgroundColor};color:white;opacity:${opacity};text-align:center;z-index:${zIndex};position:fixed;width:100%;top:0;left:0;`;
    banner.innerHTML = `<p>${msg}</p>`;
    document.body.appendChild(banner);
    await delay(timeToShow);
    banner.remove();
  },
};

export default Alerts;
