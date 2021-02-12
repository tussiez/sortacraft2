/*
SortaCanvas
JavaScript canvas library
@author tussiez
*/

let SortaCanvas = {
  ready: false,
  strictMode: false,
  init: function (canvas, loop, tween) {
    //Prep
    if (canvas != undefined) {
      this.canvas = canvas;
      if (typeof document != 'undefined') {
        this.addEventListeners();
      }
      this.ctx = canvas.getContext('2d');
      this.objects = [];
      this.ready = true;
      this.physics = false;
      this.strictMode = this.strictMode;
      this.logs = 0;
      this.frames = 0;
      this.clearRect = false;
      this.background = 'rgb(0,0,0)';
      this.supportedEvents = ['mousedown', 'mouseup', 'mousemove', 'mousedownhit', 'mouseuphit', 'mousemovehit', 'collision']
      this.TWEEN = tween != undefined ? tween : false;

      this.loop = loop == true ? true : false;
      if (this.loop == true) {
        SortaCanvas.render();
      }
    } else {
      this.error('Missing canvas variable! Please pass in your <canvas> element into this function.');
    }
  },
  setBackground: function (color) {
    if (typeof color == 'string') {
      this.background = color;
    } else {
      if (this.strictMode == true) {
        this.throwError('Input color must be a string.');
      }
    }
  },
  doRender: function (bool) {
    this.loop = typeof bool == 'boolean' ? bool : false;
    if (bool == true) {
      this.render();
    }
    if (typeof bool != 'boolean' && this.strictMode == true) {
      this.error('doRender only accepts a boolean as its only argument.')
    }
  },
  enableFullscreen: function () {
    this.setSize(window.innerWidth, window.innerHeight);
    if (window) {
      window.addEventListener('resize', function () {
        SortaCanvas.setSize(window.innerWidth, window.innerHeight)
      })
    } else {
      this.warn('No window scope');
      if (this.strictMode == true) {
        this.throwError('Missing window scope.');
      }
    }
  },
  setSize: function (width, height) {
    if (typeof height == 'number' && typeof width == 'number') {
      this.canvas.height = height;
      this.canvas.width = width;
    } else {
      if (this.strictMode == true) {
        this.throwError('One or more variables are not of their expected types. (number)');
      }
    }
  },

  enableStrictMode: function () {
    this.strictMode = true;
  },
  disableStrictMode: function () {
    this.strictMode = false;
  },
  addEventListener: function (event, fn) {
    if (!this.supportedEvents.includes(event) && this.strictMode == true) {
      this.warn('Added unsupported event.');
    }
    this[event] = fn;
  },
  getBounds: function (obj) {
    return {
      min: {
        x: obj.x,
        y: obj.y,
      },
      max: {
        x: obj.width + obj.x,
        y: obj.height + obj.y,
      },
    };
  },
  calculateSize: function (obj) {

    var ox = obj.x;
    var oy = obj.y;
    var width = obj.width;
    var height = obj.height;
    if (obj.type == 'text') {
      oy -= height;
    }
    if (obj.type == 'circle') {//Handle circle collisions
      //Since handling circle collisions is annoying, treat circle as a rectangle

      height = width = (obj.radius * 2);
      ox -= obj.radius;
      oy -= obj.radius;
    };
    return {
      x: ox,
      y: oy,
      height,
      width
    }
  },
  collision: function (obj, obj2) {
    if (obj != undefined && obj2 != undefined) {
      let bounds = this.getBounds(this.calculateSize(obj));
      let bounds2 = this.getBounds(this.calculateSize(obj2));
      if (bounds.min.x < bounds2.max.x && bounds.max.x > bounds2.min.x && bounds.min.y < bounds2.max.y && bounds.max.y > bounds2.min.y) {
        return true;//Collide
      } else {
        return false;//No collision detected
      }
    }
  },
  raycast: function (x, y) {
    for (var i = 0; i < this.objects.length; i++) {
      var obj = this.objects[i];
      if (obj.pick == undefined || obj.pick == true) {
        let bounds = this.getBounds(this.calculateSize(obj))
        if (x > bounds.min.x && x < bounds.max.x && y > bounds.min.y && y < bounds.max.y) {
          return obj;
        }
      }
    }
  },
  calculateMousePos: function (e) {
    let canvasX = this.canvas.offsetLeft;
    let canvasY = this.canvas.offsetTop;
    let x = e.clientX - canvasX;
    let y = e.clientY - canvasY;
    return { x: x, y: y }
  },
  dispatch: function (name, data) {
    if (this[name] != undefined) {
      this[name](data);
    }
  },
  mouseUpEvent: function (e) {
    if (e.target == SortaCanvas.canvas) {
      var e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = SortaCanvas.calculateMousePos(e2);
      var obj = SortaCanvas.raycast(pos.x, pos.y);
      if (obj != undefined) {
        //Hit an object.
        SortaCanvas.dispatch('mouseup', {
          object: obj,
          pos: pos,
          event: e
        })
      } else {
        SortaCanvas.dispatch('mouseup', {
          pos: pos,
          event: e
        })
      }
      //e.preventDefault();
    }
  },
  contextMenuEvent: function (e) {
    if (e.target == SortaCanvas.canvas) {
      var pos = SortaCanvas.calculateMousePos(e);
      var obj = SortaCanvas.raycast(pos.x, pos.y);
      if (obj != undefined) {
        SortaCanvas.dispatch('contextmenuhit', {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        SortaCanvas.dispatch('contextmenu', {
          pos: pos,
          event: e
        })
      }
      // e.preventDefault();
      e.stopPropagation();//stop contextmenu
    }
  },
  mouseMoveEvent: function (e) {
    if (e.target == SortaCanvas.canvas) {
      var e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = SortaCanvas.calculateMousePos(e2);
      var obj = SortaCanvas.raycast(pos.x, pos.y);
      if (obj != undefined) {
        SortaCanvas.dispatch('mousemovehit', {
          object: obj,
          pos: pos,
          event: e
        })
      } else {
        SortaCanvas.dispatch('mousemove', {
          pos: pos,
          event: e
        })
      }
      //  e.preventDefault();
    }
  },
  mouseDownEvent: function (e) {
    if (e.target == SortaCanvas.canvas) {
      let e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = SortaCanvas.calculateMousePos(e2);
      var obj = SortaCanvas.raycast(pos.x, pos.y);
      if (obj != undefined) {
        SortaCanvas.dispatch('mousedownhit', {
          object: obj,
          pos: pos,
          event: e
        });
      } else {
        SortaCanvas.dispatch('mousedown', {
          pos: pos,
          event: e
        })
      }
      //e.preventDefault();
    }
  },
  addEventListeners: function () {
    if (document) {
      document.body.addEventListener('mouseup', this.mouseUpEvent);
      document.body.addEventListener('contextmenu', this.contextMenuEvent)
      document.body.addEventListener('mousemove', this.mouseMoveEvent);
      document.body.addEventListener('mousedown', this.mouseDownEvent);
      document.body.addEventListener('touchstart', this.mouseDownEvent);
      document.body.addEventListener('touchmove', this.mouseMoveEvent);
      document.body.addEventListener('touchend', this.mouseUpEvent);
    } else {
      if (this.strictMode == true) {
        this.throwError("The window scope is unavailable. If you are using this library outside of the window scope, run the event functions manually. Pass them to mouseUpEvent, mouseMoveEvent, and mouseDownEvent.");
      } else {
        this.error('Incorrect scope, cannot add listeners.')
      }
    }
  },

  render: function () {
    if (this.loop == true) {
      requestAnimationFrame(this.render);
    }
    if (this.TWEEN != false) {
      this.TWEEN.update();
    }
    if (this.clearRect == false) {
      this.ctx.fillStyle = this.background;
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fill();
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width);
    }
    if (this.ready == true) {
      let ln = this.objects.length;
      let lastDraw = [];
      for (let i = 0; i < ln; i++) {
        if (this.objects[i].drawLast == undefined || this.objects[i].drawLast == false) {
          this.objects[i].draw();
        } else {
          lastDraw.push(this.objects[i]);
        }
      }
      if (lastDraw.length > 0) {
        for (let l = 0; l < lastDraw.length; l++) {
          lastDraw[l].draw();
        }
      }
    }
    this.frames++;
  },
  Move: function (obj, x2, y2, time) {
    if (this.tween != false) {
      let fr = { x: obj.x, y: obj.y };
      let to = { x: typeof x2 == 'number' ? x2 : 0, y: typeof y2 == 'number' ? y2 : 0 };
      let tween = new this.TWEEN.Tween(fr).to(to, time * 1000).onUpdate(function () {
        obj.x = fr.x;
        obj.y = fr.y;
      }).start();

      if (typeof x2 != 'number' || typeof y2 != 'number' || typeof time != 'number') {
        if (this.strictMode == true) {
          this.throwError('One or more arguments were not of their expected types (number)')
        }
      }
    } else {
      if (this.strictMode == false) {
        this.warn('Animation is disabled, using fallback.');
        obj.x = x2;
        obj.y = y2;
      } else {
        this.throwError('Animation is disabled.');
      }

    }
  },
  Rotate: function (obj, rot, time) {
    if (typeof rot != 'number' || typeof time != 'number') {
      rot = 0;
      time = 0;
      this.throwError('One or more variables are not of their expected types (number).')
      return false;
    }
    let fr = { rot: obj.rotation };
    let to = { rot: rot };
    let tween = new this.TWEEN.Tween(fr).to(to, time * 1000).onUpdate(function () {
      obj.rotation = fr.rot;
    }).start();
    return tween;
  },
  Rectangle: function (x, y, h, w, c, n) {
    this.x = typeof x == 'number' ? x : 0;
    this.y = typeof y == 'number' ? y : 0;
    this.height = typeof h == 'number' && h >= 0 ? h : 0;
    this.width = typeof w == 'number' && w >= 0 ? w : 0;
    this.color = typeof c == 'string' ? c : 'black';
    this.name = n;
    this.rotation = 0;
    this.type = 'rectangle';
    if (typeof x != 'number' || typeof y != 'number' || typeof h != 'number' || typeof w != 'number' || typeof c != 'string' || h < 0 || w < 0) {
      if (SortaCanvas.strictMode == true) {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.');
      }
    }
    this.draw = function () {
      if (typeof this.x != 'number' || typeof this.y != 'number' || typeof this.height != 'number' || typeof this.width != 'number' || typeof this.color != 'string' || this.height < 0 || this.width < 0 || typeof this.rotation != 'number') {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.');
      } else {
        if (this.rotation != 0) {
          SortaCanvas.ctx.save();
          SortaCanvas.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        }
        SortaCanvas.ctx.rotate(this.rotation * Math.PI / 180)
        SortaCanvas.ctx.beginPath();
        SortaCanvas.ctx.fillStyle = this.color;
        if (this.rotation != 0) {
          SortaCanvas.ctx.rect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
        } else {
          SortaCanvas.ctx.rect(this.x, this.y, this.width, this.height)
        }
        SortaCanvas.ctx.fill();
        SortaCanvas.ctx.closePath();
        if (this.rotation != 0) {
          SortaCanvas.ctx.restore();
        }
      }
    }
  },
  Circle: function (x, y, r, c, n) {
    this.x = typeof x == 'number' ? x : 0;
    this.y = typeof y == 'number' ? y : 0;
    this.radius = typeof r == 'number' && r >= 0 ? r : 0;
    this.color = typeof c == 'string' ? c : 'black';
    this.name = n;
    this.type = 'circle';
    if (typeof x != 'number' || typeof y != 'number' || typeof r != 'number' || typeof c != 'string' || r < 0) {
      if (SortaCanvas.strictMode == true) {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.')
      }
    }
    this.draw = function () {
      if (typeof this.x != 'number' || typeof this.y != 'number' || typeof this.color != 'string' || typeof this.radius != 'number' || this.radius < 0) {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.');

      } else {
        SortaCanvas.ctx.fillStyle = this.color;
        SortaCanvas.ctx.beginPath();
        SortaCanvas.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        SortaCanvas.ctx.fill();
        SortaCanvas.ctx.closePath();
      }
    }
  },
  Image: function (x, y, h, w, s, n) {
    this.x = typeof x == 'number' ? x : 0;
    this.y = typeof y == 'number' ? y : 0;
    this.height = typeof h == 'number' && h >= 0 ? h : 0;
    this.width = typeof w == 'number' && w >= 0 ? w : 0;
    this.img = typeof Image != 'undefined' ? new Image() : undefined;//no caps
    if (this.img != undefined) {
      this.img.src = typeof s == 'string' ? s : '';
    } else {
      //Image is undefined. Use fetch() to load image
      let imge = undefined;
      let response = fetch(s).then(response => response.blob()).then(blob => {
        createImageBitmap(blob, 0, 0, w, h).then(function (i) {
          imge = i;
        })
      });
      let parent = this;
      function lazyLoop() {
        if (imge != undefined) {
          parent.img = imge;
          if (parent.onload != undefined) {
            parent.onload(parent.img);
          }
          clearInterval(itv);
        }
      }
      let itv = setInterval(lazyLoop);
    }
    this.name = n;
    this.type = 'image';
    this.loaded = false;
    this.rotation = 0;
    if (typeof x != 'number' || typeof y != 'number' || typeof h != 'number' || typeof w != 'number' || typeof s != 'string' || h < 0 || w < 0) {
      if (SortaCanvas.strictMode == true) {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.');
      }
    }
    if (this.img != undefined) {
      this.img.onload = function () {
        this.loaded = true;//If the user may wish to debug or check when the image is loaded
      }
    }
    this.draw = function () {
      if (typeof this.x != 'number' || typeof this.y != 'number' || typeof this.height != 'number' || typeof this.width != 'number' || this.height < 0 || this.width < 0 || typeof this.rotation != 'number') {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative.');

      } else {
        if (this.img != undefined) {
          if (this.rotation != 0) {
            SortaCanvas.ctx.save();
            SortaCanvas.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
          }
          SortaCanvas.ctx.rotate(this.rotation * Math.PI / 180);
          if (this.rotation != 0) {
            SortaCanvas.ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
            SortaCanvas.ctx.restore();
          } else {
            SortaCanvas.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
          }

        }
      }
    }
  },
  Text: function (x, y, t, font, s, str, n) {
    this.font = typeof font == 'string' ? font : '20px Arial';
    this.x = typeof x == 'number' ? x : 0;
    this.y = typeof y == 'number' ? y : 0;
    this.text = typeof t == 'string' ? t : 'Missing text!';
    this.type = 'text';
    this.style = typeof s == 'string' ? s : 'red';
    this.color = this.style;
    this.stroke = typeof str == 'boolean' ? str : false;
    this.name = n;
    this.rotation = 0;
    if (typeof font != 'string' || typeof x != 'number' || typeof y != 'number' || typeof t != 'string' || typeof s != 'string' || typeof str != 'boolean') {
      if (SortaCanvas.strictMode == true) {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any values are negative.')
      }
    }
    this.width = SortaCanvas.ctx.measureText(this.text).width;
    this.height = Number(this.font.replace(/\D/g, ''));
    this.draw = function () {
      if (typeof this.font != 'string' || typeof this.x != 'number' || typeof this.y != 'number' || typeof this.text != 'string' || typeof this.style != 'string' || typeof this.stroke != 'boolean' || typeof this.rotation != 'number') {
        SortaCanvas.throwError('One or more variables are not of their expected types, or are undefined. This error will also be thrown if any values are negative.')
      } else {

        SortaCanvas.ctx.font = this.font;//Font: "30px Arial"
        this.style = this.color;
        SortaCanvas.ctx.fillStyle = this.style;//Style: "green"
        this.width = SortaCanvas.ctx.measureText(this.text).width;
        this.height = Number(this.font.split('px ')[0]);
        if (typeof this.strokeStyle == 'string') {
          SortaCanvas.strokeStyle = this.strokeStyle;
        }
        if (this.rotation != 0) {
          SortaCanvas.ctx.save();
          SortaCanvas.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
          SortaCanvas.ctx.rotate(this.rotation * Math.PI / 180);
        }
        if (this.rotation == 0) {
          SortaCanvas.ctx.fillText(this.text, this.x, this.y);
          if (this.stroke == true) {
            SortaCanvas.ctx.strokeText(this.text, this.x, this.y)
          }
        } else {
          SortaCanvas.ctx.fillText(this.text, -this.width / 2, -this.height / 2);
          if (this.stroke == true) {
            SortaCanvas.ctx.strokeText(this.text, -this.width / 2, -this.height / 2)
          }
          SortaCanvas.ctx.restore();
        }

      }

    }
  },
  add: function (obj) {
    this.objects.push(obj);
  },
  remove: function (obj) {
    try {
      this.objects.splice(this.objects.indexOf(obj), 1);
    } catch (err) {
      this.error('Unable to remove object. Error reported: ' + err)
    }
  },
  getObjectByName(n) {
    try {
      return this.objects[this.objects.indexOf(obj)];
    } catch (err) {
      this.error('Unable to get object. Error reported: ' + err);
    }
  },
  log: function (t) {
    if (this.logs < 1000) {
      console.log('SortaCanvas: ' + t);
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn('SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease.');
      }
    }
  },
  warn: function (t) {
    if (this.logs < 1000) {
      if (this.strictMode == false) {
        console.warn('SortaCanvas: ' + t);
      } else {
        console.warn('SortaCanvas (strict): ' + t)
      }
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn('SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease.');
      }
    }
  },
  error: function (t) {
    if (this.logs < 1000) {
      if (this.strictMode == false) {
        console.error('SortaCanvas: ' + t);
      } else {
        console.error('SortaCanvas (strict): ' + t);
      }
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn('SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease.');
      }
    }
  },
  throwError: function (err) {
    if (this.logs < 1000) {
      this.logs++;
      class SortaCanvasError extends Error {
        constructor(message, ...args) {
          super(message, ...args);
          this.name = "SortaCanvasLib_Error";
          this.message = message;
        }
      }
      throw new SortaCanvasError(err);
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn('SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease.');
      }
    }
  },
  randomColor: function () {
    return 'rgb(' + (Math.random() * 255) + ',' + (Math.random() * 255) + ',' + (Math.random() * 255) + ')'
  }


}

//Export module
export default SortaCanvas;
