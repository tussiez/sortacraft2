//Annoying bros

//They don't know JS so Ima just fool 'em a bit.

//NO ONE SAY ANYTHING IN HERE! I don't want them guessing :D
//If you want to say something then use annotations.

//Obfuscated with my personal number obfuscator. I should make this more complicated in the future (my personal obfuscator sucks).
//Team members ask me for the password (if you don't know how to get it).
const ready=()=>{const e=localStorage.isDev,t=localStorage.devPassword,o=new URL(location.href).searchParams.get("p"),a=+([+!+[]]+[+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+[+!+[]+!+[]+!+[]+!+[]+!+[]]+[+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+[+!+[]+!+[]+!+[]]+[+!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]+!+[]]+[+!+[]]+[0]+[+!+[]+!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+!+[]]);if("true"===e&&+t===a||+o===a){const e=document.createElement("script");e.src="./script.js",e.type="module",document.body.appendChild(e)}else{const e=document.createElement("div");e.style="text-align:center;";const t=`<h1 style='color:white;'>Heeeey!</h1><p style='color:white;'>Looks like you're not a dev here.</p><p style='color:white;'>To play this game as a dev you have to find out a secret. Until then, you can't play this! 😉</p><button onclick="javascript:location.href = '/';" style='background-color:brown;color:white;border:1px solid black;padding:10px;cursor:pointer;'>I accept da challenge</button>`,o=(new DOMParser).parseFromString(t,"text/html").getRootNode();e.append(...o.body.children),document.body.appendChild(e)}};"loading"!==document.readyState?ready():window.addEventListener("DOMContentLoaded",ready);