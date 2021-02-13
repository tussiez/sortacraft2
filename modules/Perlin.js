/*
Perlin Noise Algorithm
@author someone(?)
*/

// class Perlin
function Perlin(t) {
  var r = function (t) {
    // t ??= Math;
    null == t && (t = Math),
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ],
      // this.p = new Uint8Array(0x200)
      this.p = [];

    // crypto.getRandomValues(this.p.subarray(0x0, 0x100)); // half of the array
    for (var r = 0; r < 0x100; ++r) {
		// crypto.getRandomValues
		this.p[r] = Math.floor(0x100 * t.random());
	}
    // this.perm = this.p.slice(); // copy
    this.perm = [];

    // %TypedArray%.prototype.copyWithin(0x0, 0x100, 0x0)
    // copy first half into second half,
    // ex: [ 1, 2, 0, 0 ] => [ 1, 2, 1, 2 ]
	// this.perm.copyWithin(0x0, 0x100, 0x0)

    for (r = 0; r < 0x200; ++r) {
      this.perm[r] = this.p[0xFF & r];
    }
    // Uint8Array? Maybe Int8Array
    this.simplex = [
      [0, 1, 2, 3],
      [0, 1, 3, 2],
      [0, 0, 0, 0],
      [0, 2, 3, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 3, 0],
      [0, 2, 1, 3],
      [0, 0, 0, 0],
      [0, 3, 1, 2],
      [0, 3, 2, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 3, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 0, 3],
      [0, 0, 0, 0],
      [1, 3, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 3, 0, 1],
      [2, 3, 1, 0],
      [1, 0, 2, 3],
      [1, 0, 3, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 3, 1],
      [0, 0, 0, 0],
      [2, 1, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 1, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 0, 1, 2],
      [3, 0, 2, 1],
      [0, 0, 0, 0],
      [3, 1, 2, 0],
      [2, 1, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 1, 0, 2],
      [0, 0, 0, 0],
      [3, 2, 0, 1],
      [3, 2, 1, 0],
    ];
  };
  r.prototype.dot = function (t, r, i) {
    return t[0] * r + t[1] * i;
  },
    r.prototype.noise = function (t, r) {
      // this is compiler output ~ xxpertHacker
      var i,
        h,
        s = (t + r) * (.5 * (Math.sqrt(3) - 1)),
        e = Math.floor(t + s),
        o = Math.floor(r + s),
        n = (3 - Math.sqrt(3)) / 6,
        p = (e + o) * n,
        a = t - (e - p),
        m = r - (o - p);
      a > m ? (i = 1, h = 0) : (i = 0, h = 1);
      var d = a - i + n,
        f = m - h + n,
        u = a - 1 + 2 * n,
        l = m - 1 + 2 * n,
        c = 0xFF & e,
        g = 0xFF & o,
        v = this.perm[c + this.perm[g]] % 12,
        M = this.perm[c + i + this.perm[g + h]] % 12,
        x = this.perm[c + 1 + this.perm[g + 1]] % 12,
        y = 0.5 - a * a - m * m,
        w = 0.5 - d * d - f * f,
        A = 0.5 - u * u - l * l;
      return 70 *
        ((y < 0 ? 0 : (y *= y) * y * this.dot(this.grad3[v], a, m)) + (w < 0
          ? 0
          : (w *= w) * w * this.dot(this.grad3[M], d, f)) +
          (A < 0 ? 0 : (A *= A) * A * this.dot(this.grad3[x], u, l)));
    },
    /* ~ xxpertHacker
	{ A ** 4 } humans write this
	becomes
	{ (A ** 2) ** 2 } humans write this
	becomes
	{ (A ** 2) * (A ** 2) } humans also might write this
	becomes
	{ (A * A) * (A * A) } humans also might write this
	becomes
	{ (A *= A) * A } humans do not write this, only computers do
	*/
    r.prototype.noise3d = function (t, r, i) {
      var h,
        s,
        e,
        o,
        n,
        p,
        a = (t + r + i) * (1 / 3),
        m = Math.floor(t + a),
        d = Math.floor(r + a),
        f = Math.floor(i + a),
        u = 1 / 6,
        l = (m + d + f) * u,
        c = t - (m - l),
        g = r - (d - l),
        v = i - (f - l);
      c >= g
        ? g >= v ? (h = 1, s = 0, e = 0, o = 1, n = 1, p = 0) : c >= v
          ? (h = 1, s = 0, e = 0, o = 1, n = 0, p = 1)
          : (h = 0, s = 0, e = 1, o = 1, n = 0, p = 1)
        : g < v
        ? (h = 0, s = 0, e = 1, o = 0, n = 1, p = 1)
        : c < v
        ? (h = 0, s = 1, e = 0, o = 0, n = 1, p = 1)
        : (h = 0, s = 1, e = 0, o = 1, n = 1, p = 0);
      var M = c - h + u,
        x = g - s + u,
        y = v - e + u,
        w = c - o + 2 * u,
        A = g - n + 2 * u,
        q = v - p + 2 * u,
        C = c - 1 + .5,
        D = g - 1 + .5,
        P = v - 1 + .5,
        S = 0xFF & m,
        b = 0xFF & d,
        j = 0xFF & f,
        k = this.perm[S + this.perm[b + this.perm[j]]] % 12,
        z = this.perm[S + h + this.perm[b + s + this.perm[j + e]]] % 12,
        B = this.perm[S + o + this.perm[b + n + this.perm[j + p]]] % 12,
        E = this.perm[S + 1 + this.perm[b + 1 + this.perm[j + 1]]] % 12,
        F = 0.6 - c * c - g * g - v * v,
        G = 0.6 - M * M - x * x - y * y,
        H = 0.6 - w * w - A * A - q * q,
        I = 0.6 - C * C - D * D - P * P;

      return 32 *
        ((F < 0 ? 0 : (F *= F) * F * this.dot(this.grad3[k], c, g, v)) +
          (G < 0 ? 0 : (G *= G) * G * this.dot(this.grad3[z], M, x, y)) +
          (H < 0 ? 0 : (H *= H) * H * this.dot(this.grad3[B], w, A, q)) + (I < 0
            ? 0
            : (I *= I) * I * this.dot(this.grad3[E], C, D, P)));
    };
  var i = function (t) {
    null == t && (t = Math),
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ],
      this.p = [];
    // same algo as earlier; crypto, copyWithin, Uint8Array
    for (var r = 0; r < 0x100; ++r) this.p[r] = Math.floor(0x100 * t.random());
    this.perm = [];
    for (r = 0; r < 0x200; ++r) this.perm[r] = this.p[0xFF & r];
  };
  i.prototype.dot = function (t, r, i, h) {
    return t[0] * r + t[1] * i + t[2] * h;
  },
    i.prototype.mix = function (t, r, i) {
      return (1 - i) * t + i * r;
    },
    i.prototype.fade = function (t) {
      return t * t * t * (t * (6 * t - 15) + 10);
    },
    i.prototype.noise = function (t, r, i) {
      var h = Math.floor(t), s = Math.floor(r), e = Math.floor(i);
      t -= h, r -= s, i -= e, h &= 255, s &= 255, e &= 255;
      var o = this.perm[h + this.perm[s + this.perm[e]]] % 12;
      var n = this.perm[h + this.perm[s + this.perm[e + 1]]] % 12;
      var p = this.perm[h + this.perm[s + 1 + this.perm[e]]] % 12;
      var a = this.perm[h + this.perm[s + 1 + this.perm[e + 1]]] % 12;
      var m = this.perm[h + 1 + this.perm[s + this.perm[e]]] % 12;
      var d = this.perm[h + 1 + this.perm[s + this.perm[e + 1]]] % 12;
      var f = this.perm[h + 1 + this.perm[s + 1 + this.perm[e]]] % 12;
      var u = this.perm[h + 1 + this.perm[s + 1 + this.perm[e + 1]]] % 12;
      var l = this.dot(this.grad3[o], t, r, i);
      var c = this.dot(this.grad3[m], t - 1, r, i);
      var g = this.dot(this.grad3[p], t, r - 1, i);
      var v = this.dot(this.grad3[f], t - 1, r - 1, i);
      var M = this.dot(this.grad3[n], t, r, i - 1);
      var x = this.dot(this.grad3[d], t - 1, r, i - 1);
      var y = this.dot(this.grad3[a], t, r - 1, i - 1);
      var w = this.dot(this.grad3[u], t - 1, r - 1, i - 1);
      var A = this.fade(t);
      var q = this.fade(r);
      var C = this.fade(i);
      var D = this.mix(l, c, A);
      var P = this.mix(M, x, A);
      var S = this.mix(g, v, A);
      var b = this.mix(y, w, A);
      var j = this.mix(D, S, q);
      var k = this.mix(P, b, q);
      return this.mix(j, k, C);
    };
  var h = {};
  h.random = new function () {
    return function (t) {
      var r = 0, i = 0, h = 0, s = 1;
      0 == t.length && (t = [+new Date()]);
      var e = function () {
        var t = 4022871197,
          r = function (r) {
            r = r.toString();
            for (var i = 0; i < r.length; i++) {
              var h = .02519603282416938 * (t += r.charCodeAt(i));
              h -= t = h >>> 0, t = (h *= t) >>> 0, t += 4294967296 * (h -= t);
            }
            return 2.3283064365386963e-10 * (t >>> 0);
          };
        return r.version = "Mash 0.9", r;
      }();
      r = e(" "), i = e(" "), h = e(" ");
      for (var o = 0; o < t.length; o++) {
        // if statements
        (r -= e(t[o])) < 0 && (r += 1),
          (i -= e(t[o])) < 0 && (i += 1),
          (h -= e(t[o])) < 0 && (h += 1);
      }
      e = null;
      var n = function () {
        var t = 2091639 * r + 2.3283064365386963e-10 * s;
        return r = i, i = h, h = t - (s = 0 | t);
      };
      return n.uint32 = function () {
        return 4294967296 * n();
      },
        n.fract53 = function () {
          return n() + 1.1102230246251565e-16 * (2097152 * n() | 0);
        },
        n.version = "Alea 0.9",
        n.args = t,
        n;
      // ...arguments or Array.from(arguments)
    }(Array.prototype.slice.call(arguments));
  }(t);

  var s = new i(h);
  this.noise = function (t, r, i) {
    return .5 * s.noise(t, r, i) + .5;
  };
}

export default Perlin;
