/*Easy alerts
Main thread
@author Baconman321
@coauthor xxpertHacker
*/

// global "imports"
const {
  Promise,
  TypeError,
  document,
  document: { body },
  setTimeout,
} = globalThis;

// throwing helper for missing arguments
const throwFromFunction = (
  argumentPosition = throwFromFunction(1, throwFromFunction),
  { name } = throwFromFunction(2, throwFromFunction),
) => {
  throw new TypeError(
    `Argument ${argumentPosition} was not passed to function "${name}"`,
  );
};

const delay = (seconds = throwFromFunction(1, delay)) =>
  new Promise(
    (resolve) => setTimeout(resolve, 1000.0 * seconds),
  );

// FIXME: ++ this somewhere!
let alertNum = 0;

// should probably use a JS Map instead of referencing via DOM IDs for these DOM elements ~ xxpertHacker

export const alert = (msg) => {
  const wrapper = document.createElement("div");

  wrapper.setAttribute("id", `alert${alertNum}`);

  // should be a CSS class or ID instead ~ xxpertHacker
  wrapper.style =
    "position:absolute;display:table; vertical-align:center;width:100%;height:100%;";

  const parent = document.createElement("div");

  // ditto ~ xxpertHacker
  parent.style = "display:table-cell;vertical-align:middle; text-align:center;";

  wrapper.appendChild(parent);

  const child = document.createElement("div");
  child.style =
    "display:inline-block;vertical-align:middle; width:40%;border-radius:2px; background-color:white;z-index:100000;text-align:left;transition:opacity 0.2s ease, transform 0.1s ease;";
  child.innerHTML =
    `<h1 style='margin-top:5px;margin-bottom:3px;text-align:center;'>Alert!</h1><p style='margin-top:5px;margin-left:10px;color:gray;'>${msg}</p><div style='text-align:center;'><button id='dismissAlert${alertNum}' style='background-color:lightblue;bottom:4px;right:50px;width:30%;height:30px;color:white;border-radius:1px;border:none;margin-bottom:6px;'>Ok</button></div>`;
  // ditto, and don't use innerHTML, make a template and use Element#close() ~ xxpertHacker
  parent.appendChild(child);
  body.appendChild(wrapper);
  ++alerts;
  // don't target by IDs, use elements directly from the template above ^ ~ xxpertHacker
  document
    .getElementById(`dismissAlert${alertNum}`)
    .addEventListener(
      "click",
      async () => {
        // Probably the worst way to do it, but I suck at CSS...
        const { style } = child;

        // Use keyframes ~ xxpertHacker
        // I would still have to wait a few seconds because I need to delete it after or I will have a DOM pile build-upp
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
};

export const alertBanner = async (
  msg = throwFromFunction(1, alertBanner),
  backgroundColor = "inherit",
  opacity = 1,
  zIndex = 1,
  timeToShow = 5, /* In seconds */
) => {
  const banner = document.createElement("div");
  banner.style =
    `background-color: ${backgroundColor};color:white;opacity:${opacity};text-align:center;z-index:${zIndex};position:fixed;width:100%;top:0;left:0;`;
  banner.innerHTML = `<p>${msg}</p>`;
  body.appendChild(banner);
  await delay(timeToShow);
  banner.remove();
};

async function hideEle({ currentTarget: div }) {
  div.style.opacity = "0";
  div.style.transform = "translateY(-30%)";
  await delay(0.5);
  div.remove();
}

// timeout in seconds
export const msgHTML = async (content, timeout) => {
  const div = document.createElement("div");

  const inner = document.createElement("inner");
  div.appendChild(inner);

  // ditto, CSS & classes ~ xxpertHacker
  inner.setAttribute("style", "margin:8px;padding:8px;");

  inner.innerHTML = content;

  div.setAttribute(
    "style",
    "height:30%;width:30%;background-color:#333;color:white;position:absolute;left:35%;top:35%;opacity:0;border-radius:5px;transition:opacity 0.2s ease,transform 0.3s ease;",
  );

  body.appendChild(div);

  div.addEventListener("mousedown", hideEle);

  const { style } = div;

  await delay(0.5);
  style.opacity = "1";

  await delay(timeout);
  style.opacity = "0";
  style.transform = "translateY(-30%)";

  await delay(0.5);
  div.remove();
};
