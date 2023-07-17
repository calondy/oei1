(() => {
  // src/lib/Ball.js
  function Ball(fn) {
    let Radio = 140;
    let active2 = true;
    let ball2 = document.createElement("div");
    ball2.style.width = Radio + "px";
    ball2.style.height = Radio + "px";
    ball2.classList.add("Ball");
    document.body.appendChild(ball2);
    let x = 0, y = 0, mousex = 0, mousey = 0;
    document.addEventListener("mousemove", chg);
    run();
    function chg(e) {
      50;
      mousex = e.clientX;
      mousey = e.clientY;
    }
    function run() {
      x += (mousex - x) * 0.1;
      y += (mousey - y) * 0.1;
      if (active2) {
        ball2.style.left = `${x - Radio * 0.5}px`;
        ball2.style.top = `${y - Radio * 0.5}px`;
        if (mousey < 80 || mousex < 80) {
          ball2.style.transform = `scale(0,0)`;
        } else
          ball2.style.transform = `scale(1,1)`;
        requestAnimationFrame(run);
      }
    }
    function hide() {
      active2 = false;
      ball2.style.transform = `scale(0,0)`;
    }
    function show() {
      ball2.style.transform = `scale(1,1)`;
      active2 = true;
      run();
    }
    return { hide, show };
  }

  // src/lib/Scrolling.js
  function easeScroll(fn, el, onscrollFn) {
    window.removeEventListener("scroll", ease);
    window.addEventListener("scroll", ease);
    function ease() {
      sy = window.pageYOffset;
      fn({ dy: sy, sy });
      if (onscrollFn) {
        onscrollFn(sy);
      }
    }
    function goTo(yy) {
      window.scrollTo({
        top: yy,
        behavior: "smooth"
      });
    }
    function end() {
      setActive(false);
    }
    function setActive(b) {
      if (b) {
        window.removeEventListener("scroll", ease);
        window.addEventListener("scroll", ease);
      } else {
        window.removeEventListener("scroll", ease);
      }
      active = b;
    }
    return { setActive, end, goTo };
  }

  // src/lib/ProjectBut.js
  function ProjectBut({ but, index, dv, obj, action, rov, rout }) {
    let txt = but.querySelector("svg text");
    txt.addEventListener("mouseover", mo);
    txt.addEventListener("mouseout", mout);
    txt.addEventListener("click", clk);
    function clk(evt) {
      if (evt)
        evt.preventDefault();
      action(index);
    }
    function mout(e) {
      rout(obj, index);
    }
    function mo(e) {
      rov(obj, index);
    }
  }

  // src/lib/EnterImage.js
  function EnterImage(src, i, imgsDv) {
    let scale = 1;
    let img = new Image();
    let x = Math.random() * 50;
    if (i == 2)
      x -= 100;
    img.style.transform = `translate(${x}px,${400}px) scale(${scale},${scale})`;
    img.style.opacity = `0`;
    if (i != 0) {
      img.style.top = `${Math.random() * 5 + (i == 2 ? 60 : 50)}%`;
      img.style.left = `${35 * i + 2}%`;
    } else {
      img.style.bottom = `${Math.random() * 5 + 50}%`;
      img.style.right = `${20 * i + 30}%`;
    }
    img.style.maxWidth = "15%";
    img.setAttribute("data-x", x);
    let t = Math.random() / 2 + 0.3;
    img.onload = function() {
      let rs = Math.random() / 2 + 0.8;
      setTimeout(() => {
        img.style.transition = `all ${t}s ease-in-out`;
        if (i != 2)
          img.style.transform = `translate(${x}px,${0}px)  scale(${rs},${rs})`;
        else
          img.style.transform = `translate(${x}px,${0}px)  scale(${1.6},${1.6})`;
        img.style.opacity = `1`;
      }, 100);
    };
    img.src = src;
    imgsDv.appendChild(img);
    return img;
  }

  // src/lib/FloatingThumbs.js
  function FloatingThumbs() {
    let scale = 1;
    let imgs = [];
    let imgsDv = document.querySelector(".floatingThumbs");
    function clear() {
      if (imgs.length > 0) {
        imgs.forEach((img) => {
          if (img.getAttribute("done") == "true") {
          } else {
            img.onload = null;
            img.setAttribute("done", "true");
            img.style.transform = `translate(${img.getAttribute("data-x")}px,${-400}px)  scale(${scale},${scale})`;
            img.style.opacity = `0`;
            setTimeout(() => {
              imgsDv.removeChild(img);
            }, 400);
          }
        });
      }
      imgs = [];
    }
    function addThumbs(arr) {
      clear();
      arr.forEach((im, i) => {
        imgs.push(EnterImage(im, i, imgsDv));
      });
    }
    return { addThumbs, clear };
  }

  // src/lib/scripts/PreloadImages.js
  function PreloadImages(arr, endfn, stepfn) {
    var n = arr.length;
    var i = 0;
    loadNext();
    function loadNext() {
      var img = new Image();
      img.onload = function() {
        img.onload = null;
        img = null;
        if (stepfn)
          stepfn(arr[i], i);
        i++;
        if (i >= n) {
          if (endfn)
            endfn();
          return;
        }
        loadNext();
      };
      img.src = arr[i];
    }
  }

  // src/lib/projectsList.js
  function projectsList(clickFn, fn) {
    const worker = new Worker("ww.js");
    let list, buts, nav;
    let dv = document.querySelector(".projectsList");
    let sto;
    let thumbs = FloatingThumbs();
    if (dv) {
    } else
      return;
    fetch("projects.json").then((d) => d.json()).then((PJ) => {
      worker.postMessage({ type: "load", data: PJ.join(" ") });
    }).catch((e) => console.log(e));
    worker.onmessage = function(event) {
      jsonLoaded(event.data.map((d) => {
        return { project: d };
      }));
    };
    function jsonLoaded(json) {
      list = json.filter((pr) => {
        return pr.project.inactive != true;
      });
      console.log(list.length, "active projects ");
      let plo = [];
      list.forEach((l) => {
        plo = [...plo, ...l.project.thumbs];
      });
      let pl = Array.from(new Set(plo));
      let initiated2 = false;
      PreloadImages(pl, () => {
        console.log("loaded all thumbs");
      }, (sr, i) => {
        if ((pl.length == 1 || i >= pl.length / 3) && !initiated2) {
          initiated2 = true;
          draw();
          setTimeout(() => {
            fn();
          }, 200);
        }
      });
    }
    function draw() {
      dv.style.height = `${list.length * 200}px`;
      document.body.style.height = `${list.length * 200 + 100}px`;
      dv.innerHTML = `
 
    ${list.map((p, i) => {
        return `<p class="stroke" data-index='${i}'>
                            <svg xmlns="http://www.w3.org/2000/svg" width='100%'   viewBox="0 0 1180 160">
                             <text x="120" y="120" data-index='${i}'>${p.project.title}</text>
                            </svg>





                           </p>`;
      }).join("\n")}
 `;
      buts = [...dv.querySelectorAll(".stroke")];
      buts.forEach((b, i) => {
        let fl = list[i].project.folder.split("/");
        initBut(b, i);
        let e = document.createElement("a");
        e.classList.add("hash");
        e.setAttribute("name", fl[fl.length - 1]);
        e.setAttribute("title", list[i].project.title);
        document.body.prepend(e);
      });
    }
    function action(i) {
      let fl = list[i].project.folder.split("/");
      thumbs.clear();
      window.location.href = "#" + fl[fl.length - 1];
      clickFn(list[i]);
    }
    function rover(obj, i) {
      clearTimeout(sto);
      sto = setTimeout(() => {
        thumbs.addThumbs(obj.project.thumbs);
      }, 100);
    }
    function rout(ob, i) {
      thumbs.clear();
    }
    function initBut(but, i) {
      ProjectBut({ but, index: i, dv, obj: list[i], action, rov: rover, rout });
    }
    function hide() {
      dv.classList.add("hidded");
    }
    function show() {
      setTimeout(() => {
        dv.classList.remove("hidded");
      }, 200);
    }
    function getProject(tag) {
      let pp;
      list.forEach((l) => {
        let f = l.project.folder.split("/");
        f = f[f.length - 1];
        if (f == tag)
          pp = l;
      });
      return pp;
    }
    return { hide, show, getProject };
  }

  // src/templates.js
  var templates = {
    svgApp: `
    <div class='svgApp'>
    <svg xmlns="http://www.w3.org/2000/svg" ></svg> 
    <div class='svgAppTextContainer'>
    <div>
    <p class='sectionTitle'>{title}</p>
    <h3>{txt}</h3>
    </div>
    </div>
    </div>`,
    fullVideo: `<div class='fullVideo'>
    
        <video style='width:100%;height:100%;objectFit:cover;'  loop='' muted=''   >
        <source src='{videosrc}' type='video/mp4'></source>
        </video>
    
       
       

</div>`,
    vimeo: `<div class='fullVideo vimeo' >
    
 <div data-src='{videosrc}' class='iframeCont'></div>



</div>`,
    boldText: `
<div class='boldText'>
<p class='sectionTitle'>{title}</p>
    <div>
        <h3>{txt}</h3>
    </div>
</div>`,
    mediumText: `
<div class='mediumText'>
<p class='sectionTitle'>{title}</p>
    <div>
        <h4>{txt}</h4>
    </div>
</div>`,
    fullImage: `
 <div class='fullImage'>
         <img  loading="lazy"  src='{imgsrc}'>
     
</div>`,
    mediumTextImage: `
<div class='mediumTextImage'>
    <div>
        <img  loading="lazy"  src='{imgsrc}'>
    </div>
    <div><small>about</small>
        <h3>{txt}</h3>
    </div>

</div>`,
    gallery: `
<div class="gallery"> 
  <div class="hero-slideshow ">
    <div class='slider-pages' style='display:none;'>{imgs}</div>
    <div class='side-img side-img-left'><img><div class='grad'></div></div>
    <div class='side-img side-img-right'><img><div class='grad'></div></div> 
    <div class="imagen slider-imagen">
     <div></div>
    </div>
  </div> 
</div> 
`,
    staff: `
<div class='staff'>
{list}
 </div>


`
  };

  // src/functions/isInViewport.js
  function isInViewport(el, i, m) {
    let marg;
    if (m || m == 0) {
      marg = m;
    } else {
      marg = el.clientHeight / 2.5;
    }
    var elementTop = el.offsetTop + marg;
    var elementBottom = elementTop + el.clientHeight - marg;
    var viewportTop = window.scrollY;
    var viewportBottom = viewportTop + window.innerHeight;
    if (elementBottom - viewportTop < marg)
      return false;
    return elementBottom > viewportTop && elementTop < viewportBottom;
  }

  // src/lib/sectionApps/Staff.js
  function Staff(el) {
    const enterEl = (e, i) => {
      let t = (i + 1) * 0.5 * 500;
      setTimeout(() => {
        e.classList.add("el-Op1-x0");
      }, t);
    };
    console.log("init staff");
    [...el.querySelectorAll(".staffLine")].forEach((e, i) => {
      enterEl(e, i);
    });
    function end() {
      console.log("end staff");
      [...el.querySelectorAll(".staffLine")].forEach((e) => {
        e.classList.remove("el-Op1-x0");
      });
    }
    return { end };
  }

  // src/lib/sectionApps/gallery.js
  function Gallery(div) {
    let G = Hero(div.querySelector(".hero-slideshow"));
    function end() {
      console.log("end gallery");
      G.end();
    }
    return { end };
  }
  function Hero(div) {
    let tmo;
    let auto = false;
    let T = 6e3;
    let initiated2 = false;
    let pages = [...div.querySelectorAll(".slider-pages > div")];
    let n = pages.length;
    let index = 0;
    let d = 1;
    let imgDiv = div.querySelector(".slider-imagen");
    let active2 = false;
    let NV = createNav();
    const [prevBut, nextBut, dots] = [NV.prevBut, NV.nextBut, NV.dots];
    let prevIm = div.querySelector(".side-img-left");
    let nextIm = div.querySelector(".side-img-right");
    prevBut.addEventListener("click", prev);
    nextBut.addEventListener("click", next);
    showActual();
    function clk(e) {
      showPage(this.getAttribute("data-n"));
    }
    function showPage(i) {
      if (active2)
        return;
      i = Number(i);
      if (index > i) {
        d = -1;
      } else if (index < i) {
        d = 1;
      } else {
        d = 1;
      }
      index = i;
      showActual();
    }
    function prev(e) {
      if (e)
        e.preventDefault();
      if (active2)
        return;
      auto = true;
      d = -1;
      index--;
      if (index < 0)
        index = n - 1;
      showActual();
    }
    function next(e) {
      if (e)
        e.preventDefault();
      if (active2)
        return;
      auto = true;
      d = 1;
      index++;
      if (index >= n)
        index = 0;
      showActual();
    }
    function showActual() {
      active2 = true;
      let page = pages[index];
      updateNav();
      [...imgDiv.querySelectorAll("div")].forEach((s) => s.classList.add("toRemove"));
      let slide = document.createElement("div");
      slide.innerHTML = `<img src='${page.querySelector("img").getAttribute("src")}'>`;
      imgDiv.appendChild(slide);
      if (d == 1) {
        if (initiated2)
          slide.style.transform = `translate(${window.innerWidth}px,0px)`;
        else
          slide.style.transform = `translate(${0}px,0px)`;
      } else {
        if (initiated2)
          slide.style.transform = `translate(${-window.innerWidth}px,0px)`;
        else
          slide.style.transform = `translate(${0}px,0px)`;
      }
      initiated2 = true;
      requestAnimationFrame(() => {
        slide.style.transition = "transform 0.6s ease-in-out";
        slide.style.transform = `translate(0px,0px)`;
        [...imgDiv.querySelectorAll("div.toRemove")].forEach((s) => {
          s.style.transition = "transform 0.6s ease-in-out";
          s.style.transform = `translate(${d == 1 ? -window.innerWidth : window.innerWidth}px,0px)`;
        });
        setTimeout(() => {
          active2 = false;
          [...imgDiv.querySelectorAll("div.toRemove")].forEach((s) => {
            imgDiv.removeChild(s);
          });
        }, 1e3);
        clearTimeout(tmo);
        if (auto) {
          tmo = setTimeout(function() {
            next();
          }, 6e3);
        }
      });
      prevBut.querySelector("div").style.backgroundImage = `url(${prevImage()})`;
      nextBut.querySelector("div").style.backgroundImage = `url(${nextImage()})`;
      showSides(prevImage(), nextImage(), d);
    }
    function showSides(pi, ni) {
      let ilef = prevIm.querySelector("img");
      let ir = nextIm.querySelector("img");
      if (ilef) {
        ilef.style.transition = `transform 0.3s ease-in-out,opacity 0.3s ease-in-out`;
        ilef.style.opacity = 0;
        ilef.style.transform = `translateX(${-100 * d}px)`;
      }
      if (ir) {
        ir.style.transition = `transform 0.3s ease-in-out,opacity 0.3s ease-in-out`;
        ir.style.opacity = 0;
        ir.style.transform = `translateX(${-100 * d}px)`;
      }
      sto1 = setTimeout(() => {
        ilef = new Image();
        ir = new Image();
        ir.style.opacity = 0;
        ir.style.transform = `translateX(${100 * d}px)`;
        ilef.style.opacity = 0;
        ilef.style.transform = `translateX(${100 * d}px)`;
        ilef.onload = function() {
          prevIm.removeChild(prevIm.querySelector("img"));
          prevIm.prepend(ilef);
          setTimeout(() => {
            ilef.style.transition = `transform 0.3s ease-in-out,opacity 0.3s ease-in-out`;
            ilef.style.opacity = 1;
            ilef.style.transform = `translateX(0px)`;
          }, 100);
        };
        ir.onload = function() {
          nextIm.removeChild(nextIm.querySelector("img"));
          nextIm.prepend(ir);
          setTimeout(() => {
            ir.style.transition = `transform 0.3s ease-in-out,opacity 0.3s ease-in-out`;
            ir.style.opacity = 1;
            ir.style.transform = `translateX(0px)`;
          }, 100);
        };
        ilef.src = pi;
        ir.src = ni;
      }, 301);
    }
    function createNav() {
      let pr = document.createElement("div");
      let nx = document.createElement("div");
      let nv = document.createElement("div");
      nv.classList.add("slider-dots");
      pr.classList.add("slider-arrow");
      pr.classList.add("prev");
      nx.classList.add("slider-arrow");
      nx.classList.add("next");
      pr.innerHTML = `<div></div>`;
      nx.innerHTML = `<div></div>`;
      div.appendChild(pr);
      div.appendChild(nx);
      div.appendChild(nv);
      let dts = [];
      pages.forEach((p, i) => {
        let dot = document.createElement("div");
        dot.classList.add("dot");
        if (i == index)
          dot.classList.add("active");
        dot.setAttribute("data-n", i);
        nv.appendChild(dot);
        dot.addEventListener("click", clk);
        dts.push(dot);
      });
      return { nav: nv, nextBut: nx, prevBut: pr, dots: dts };
    }
    function updateNav() {
      dots.forEach((d2, i) => {
        if (i == index) {
          d2.classList.add("active");
        } else {
          d2.classList.remove("active");
        }
      });
    }
    function prevImage() {
      let ind = index - 1;
      if (ind < 0)
        ind = n - 1;
      return pages[ind].querySelector("img").getAttribute("src");
    }
    function nextImage() {
      let ind = index + 1;
      if (ind >= n)
        ind = 0;
      return pages[ind].querySelector("img").getAttribute("src");
    }
    function end() {
      auto = false;
    }
    return { end };
  }

  // src/lib/svgApps/apps/defaultApp.js
  function defaultApp() {
    return {
      name: "defaultApp",
      circles: [],
      svg: null,
      start: function(svg2, args) {
        this.svg = svg2;
        console.log(this.name, "svgApp starts");
        try {
          this.circles.forEach((c) => {
            this.svg.removeChild(c);
          });
        } catch (e) {
          console.log(e);
        }
        this.circles = [];
        let rn = Math.random() * 50 + 5;
        for (var i = 0; i < rn; i++) {
          this.circles.push(DCircle(svg2, window.innerWidth, window.innerHeight));
        }
      },
      end: function() {
        console.log(this.name, "svgApp ends");
      },
      run: function() {
        this.circles.forEach((c) => c.run());
      }
    };
  }
  function DCircle(svg2, w, h) {
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("r", Math.random() * 30 + 46);
    el.setAttribute("fill", "#aaaaaaaa");
    el.setAttribute("stroke", "#000000");
    el.setAttribute("cx", "0");
    el.setAttribute("cy", "0");
    svg2.appendChild(g);
    let ocy = Math.random() * h;
    let ocx = Math.random() * w;
    let el2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el2.setAttribute("fill", "#111111");
    el2.setAttribute("stroke", "#ffdd00");
    el2.setAttribute("cx", Math.random() * 30 - 15);
    el2.setAttribute("cy", Math.random() * 30 - 15);
    el2.setAttribute("r", 2 + Math.random() * 3);
    g.appendChild(el);
    g.appendChild(el2);
    return {
      an: 0,
      av: Math.random() - 0.5,
      g,
      el,
      cx: ocx,
      cy: ocy,
      vx: Math.random() * 20 - 10,
      vy: Math.random() * 3 - 1.5,
      run: function() {
        this.cx += this.vx;
        this.cy += this.vy;
        if (this.cx > w) {
          this.cx = 0;
          this.vx = this.vx;
        }
        if (this.cx < 0) {
          this.cx = w;
          this.vx = this.vx;
        }
        if (this.cy > h) {
          this.cy = 0;
          this.vy = this.vy;
        }
        if (this.cy < 0) {
          this.cy = h;
          this.vy = this.vy;
        }
        this.g.setAttribute("transform", `translate(${this.cx},${this.cy}) rotate(${this.an})`);
        this.an += this.av * 2;
        if (this.an > 359)
          this.an = this.an - 360;
        if (this.an < 0)
          this.an = this.an + 360;
      }
    };
  }

  // src/lib/svgApps/apps/graphApp.js
  var svgNS = "http://www.w3.org/2000/svg";
  function graphApp() {
    return {
      name: "GRAPH_APP",
      circles: [],
      svg: null,
      start: function(svg2, args) {
        this.svg = svg2;
        console.log(this.name, "svgApp starts");
        try {
          this.circles.forEach((c) => {
            svg2.removeChild(c);
          });
        } catch (e) {
          console.log(e);
        }
        this.circles = [];
        let rn = Math.random() * 500 + 25;
        for (var i = 0; i < rn; i++) {
          this.circles.push(Circle(svg2, window.innerWidth, window.innerHeight));
        }
      },
      end: function() {
        console.log(this.name, "svgApp ends");
      },
      run: function() {
        this.circles.forEach((c) => c.run());
      }
    };
  }
  function Circle(svg2, w, h) {
    let g = document.createElementNS(svgNS, "g");
    let el = document.createElementNS(svgNS, "circle");
    let maxv = 5;
    el.setAttribute("r", Math.random() * 3 + 3);
    el.setAttribute("fill", "#ffffff");
    el.setAttribute("stroke", "none");
    el.setAttribute("cx", "0");
    el.setAttribute("cy", "0");
    svg2.appendChild(g);
    let ocy = Math.random() * h;
    let ocx = Math.random() * w;
    virus(g);
    g.appendChild(el);
    return {
      an: 0,
      av: Math.random() - 0.5,
      g,
      el,
      cx: ocx,
      cy: ocy,
      vx: Math.random() * 5 - 2.5,
      vy: Math.random() * 5 - 2.5,
      run: function() {
        if (Math.random() * 100 < 10) {
          this.vx += Math.random() < 0.5 ? 1 : -1;
          this.vy += Math.random() < 0.5 ? 1 : -1;
          if (this.vx > maxv)
            this.vx = maxv;
          if (this.vy > maxv)
            this.vy = maxv;
          if (this.vx < -maxv)
            this.vx = -maxv;
          if (this.vy < -maxv)
            this.vy = -maxv;
        }
        this.cx += this.vx;
        this.cy += this.vy;
        if (this.cx > w) {
          this.cx = w;
          this.vx = -this.vx;
        }
        if (this.cx < 0) {
          this.cx = 0;
          this.vx = -this.vx;
        }
        if (this.cy > h) {
          this.cy = h;
          this.vy = -this.vy;
        }
        if (this.cy < 0) {
          this.cy = 0;
          this.vy = -this.vy;
        }
        this.g.setAttribute("transform", `translate(${this.cx},${this.cy}) rotate(${this.an})`);
        this.an += (this.vx + this.vy) * 1.5;
        if (this.an > 359)
          this.an = this.an - 360;
        if (this.an < 0)
          this.an = this.an + 360;
      }
    };
  }
  function virus(g) {
    let nlines = parseInt(Math.random() * 15 + 7);
    let step = 360 / nlines;
    let a = 0;
    let x1 = 0;
    let y1 = 0;
    for (var i = 0; i < nlines; i++) {
      let line = document.createElementNS(svgNS, "line");
      let P = calculateScreenPosition(x1, y1, a);
      let x2 = P.x;
      let y2 = P.y;
      line.setAttribute("stroke", "#ffffffaa");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      g.appendChild(line);
      a += step;
    }
    function calculateScreenPosition(originX, originY, angle) {
      var radians = angle * Math.PI / 180;
      var distance = Math.random() * 15 + 6;
      var x = originX + distance * Math.cos(radians);
      var y = originY + distance * Math.sin(radians);
      return { x, y };
    }
  }

  // src/lib/svgApps/apps/sistemasApp.js
  var svgNS2 = "http://www.w3.org/2000/svg";
  function sistemasApp() {
    let name = "sistemasApp";
    let circles = [];
    let svg2 = null;
    function start(svg1, args) {
      svg2 = svg1;
      console.log(name, "svgApp starts");
      try {
        circles.forEach((c) => {
          svg2.removeChild(c);
        });
      } catch (e) {
        console.log(e);
      }
      circles = [];
      let rn = Math.random() * 50 + 100;
      for (var i = 0; i < rn; i++) {
        circles.push(CircleSist(svg2, window.innerWidth, window.innerHeight));
      }
    }
    function end() {
      console.log(this.name, "svgApp ends");
    }
    function run() {
      circles.forEach((c) => c.run());
    }
    return { start, end, run };
  }
  function CircleSist(svg2, w, h) {
    let col = randCol();
    let g = document.createElementNS(svgNS2, "g");
    let el = document.createElementNS(svgNS2, "circle");
    let maxv = 5;
    el.setAttribute("r", Math.random() * 10 + 5);
    el.setAttribute("fill", col);
    el.setAttribute("stroke", "none");
    el.setAttribute("cx", "0");
    el.setAttribute("cy", "0");
    svg2.appendChild(g);
    let ocy = Math.random() * h;
    let ocx = Math.random() * w;
    Virus(g, randCol());
    g.appendChild(el);
    return {
      an: 0,
      av: Math.random() - 0.5,
      g,
      el,
      cx: ocx,
      cy: ocy,
      vx: Math.random() * 5 - 2.5,
      vy: Math.random() * 5 - 2.5,
      run: function() {
        if (Math.random() * 100 < 10) {
          this.vx += Math.random() < 0.5 ? 1 : -1;
          this.vy += Math.random() < 0.5 ? 1 : -1;
          if (this.vx > maxv)
            this.vx = maxv;
          if (this.vy > maxv)
            this.vy = maxv;
          if (this.vx < -maxv)
            this.vx = -maxv;
          if (this.vy < -maxv)
            this.vy = -maxv;
        }
        this.cx += this.vx;
        this.cy += this.vy;
        if (this.cx > w) {
          this.cx = w;
          this.vx = -this.vx;
        }
        if (this.cx < 0) {
          this.cx = 0;
          this.vx = -this.vx;
        }
        if (this.cy > h) {
          this.cy = h;
          this.vy = -this.vy;
        }
        if (this.cy < 0) {
          this.cy = 0;
          this.vy = -this.vy;
        }
        this.g.setAttribute("transform", `translate(${this.cx},${this.cy}) rotate(${this.an})`);
        this.an += (this.vx + this.vy) * 1.5;
        if (this.an > 359)
          this.an = this.an - 360;
        if (this.an < 0)
          this.an = this.an + 360;
      }
    };
    function randCol() {
      let arr = "#111111 #440000 #004400 #ffffff".split(" ");
      return arr[parseInt(Math.random() * arr.length)];
    }
  }
  function Virus(g, col) {
    if (col) {
    } else
      col = "#000000";
    let nlines = parseInt(Math.random() * 15 + 7);
    let step = 360 / nlines;
    let a = 0;
    let x1 = 0;
    let y1 = 0;
    for (var i = 0; i < nlines; i++) {
      let line = document.createElementNS(svgNS2, "line");
      let P = calculateScreenPosition(x1, y1, a);
      let x2 = P.x;
      let y2 = P.y;
      line.setAttribute("stroke", col);
      line.setAttribute("stroke-width", "2");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      g.appendChild(line);
      a += step;
    }
    function calculateScreenPosition(originX, originY, angle) {
      var radians = angle * Math.PI / 180;
      var distance = Math.random() * 15 + 10;
      var x = originX + distance * Math.cos(radians);
      var y = originY + distance * Math.sin(radians);
      return { x, y };
    }
  }

  // src/lib/svgApps/apps/schoolApp.js
  function schoolApp() {
    let top = 0.6;
    let scolaW = 230;
    let ww = window.innerWidth;
    let hh = window.innerHeight;
    let schools = [];
    let svg2;
    function start(svga) {
      svg2 = svga;
      let n = ww / scolaW;
      let x = 0;
      for (var i = 0; i < n; i++) {
        let o = { x, y: hh * top - Math.random() * 10, v: 2 + Math.random() * 3, boys: [] };
        let gg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gg.innerHTML = school;
        svg2.appendChild(gg);
        gg.setAttribute("transform", `translate(${o.x},${o.y}) scale(0.5)`);
        schools.push({ g: gg, ...o });
        x += scolaW + 2;
      }
    }
    function end() {
    }
    function run() {
      if (svg2) {
      } else
        return;
      schools.forEach((o) => {
        o.boys.forEach((b) => b.run());
        o.v = 2 + Math.random() * 3;
        o.x += o.v;
        o.y += Math.random() < 0.5 ? 0.3 : -0.3;
        if (o.x > ww) {
          o.x -= ww + scolaW;
          o.y = hh * top - Math.random() * 10;
        }
        o.g.setAttribute("transform", `translate(${o.x},${o.y}) scale(1,1)`);
        if (Math.random() * 100 < 1 && o.boys.length < 20) {
          o.boys.push(Boy(svg2, { ...o, x: o.x + scolaW / 2 }));
        }
      });
    }
    return { start, end, run };
  }
  function Boy(svg2, o) {
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let x = o.x;
    let vy = 0;
    let grav = 0.1;
    let vx = o.v;
    let y = o.y + 100;
    let h = y + 100;
    let wv = (Math.random() + 0.1) * 0.4;
    let active2 = true, ended = false;
    b.setAttribute("fill", "#111111");
    b.setAttribute("cx", 0);
    b.setAttribute("cy", 0);
    b.setAttribute("r", 6);
    p.setAttribute("fill", "#222222");
    p.setAttribute("stroke", "#111111");
    p.setAttribute("d", `M -4,7 L4,7 2,20 -2,20 z`);
    g.appendChild(p);
    g.appendChild(b);
    g.setAttribute("transform", `translate(${x},${y})`);
    svg2.appendChild(g);
    function run() {
      if (!active2) {
        if (ended) {
          return;
        }
        y += wv;
        x += vx;
        vx *= 0.9;
        g.setAttribute("transform", `translate(${x},${y})`);
        if (y >= h + 200)
          ended = true;
        return;
      }
      x += vx;
      y += vy;
      vy += grav;
      vx *= 0.99;
      g.setAttribute("transform", `translate(${x},${y})`);
      if (y >= h)
        active2 = false;
    }
    return { run };
  }
  var school = ` 

<path style="stroke: rgb(0, 0, 0); fill: rgb(244, 244, 244); transform-box: fill-box; transform-origin: 50% 50%;" d="M 13.893 132.139 L 220.181 132.139 L 220.181 62.841 L 13.893 62.841 L 13.893 132.139 Z"></path>
<rect x="91.251" y="48.192" width="51.572" height="14.649" style="stroke: rgb(0, 0, 0); fill: rgb(199, 199, 199);"></rect>
<rect x="90.251" y="129.005" width="51.572" height="7.081" style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);"></rect>
<rect x="7.893" y="71.476" width="219.181" height="6.014" style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);"></rect>
<rect x="104.144" y="77.49" width="25.786" height="58.596" style="stroke: rgb(0, 0, 0); fill: rgb(44, 141, 171);" class="puerta" x="104.144"></rect>
<rect x="26.786" y="77.49" width="25.786" height="29.298" style="stroke: rgb(0, 0, 0); fill: rgb(153, 210, 250);"></rect>
<rect x="65.465" y="77.49" width="25.786" height="29.298" style="stroke: rgb(0, 0, 0); fill: rgb(153, 210, 250);"></rect>
<rect x="142.823" y="77.49" width="25.786" height="29.298" style="stroke: rgb(0, 0, 0); fill: rgb(153, 210, 250);"></rect>
<rect x="181.502" y="77.49" width="25.786" height="29.298" style="stroke: rgb(0, 0, 0); fill: rgb(153, 210, 250);"></rect>
<path style="stroke: rgb(0, 0, 0); fill: rgb(0, 183, 255); transform-box: fill-box; transform-origin: 50% 50%;" d="M 116.037 12.193 L 154.716 12.012 L 154.716 18.894 L 116.037 18.894 L 116.037 12.193 Z"></path>
<path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); transform-box: fill-box; transform-origin: 50% 50%;" d="M 116.037 18.894 L 116.037 25.749 L 154.716 25.873 L 154.716 18.894 L 116.037 18.894 Z"></path>
<path style="stroke: rgb(0, 0, 0); fill: rgb(0, 183, 255); transform-box: fill-box; transform-origin: 50% 50%;" d="M 116.037 25.822 L 116.037 33.543 L 154.716 33.543 L 154.716 25.904 L 116.037 25.822 Z"></path>
<path style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0);" d="M 116.037 9.987 L 116.037 47.617"></path>

<!--
    <path stroke='#aaaaaa' fill='white' stroke-width='2' 
    d='M 5,180 L5,295 295,295 295,180 200,180 200,140 100,140 100,180 z'
    ></path> 

<path stroke='#aaaaaa' fill='white' stroke-width='2' 
    d='M 120,220 L180,220 180,290 120,290 120,220 M150,220 150,290'
    ></path> 

<path stroke='#aaaaaa' fill='#cccccc' stroke-width='2' 
    d='M 20,220 L60,220 60,260 20,260 z'
    ></path> 

<path stroke='#aaaaaa' fill='#cccccc' stroke-width='2' 
    d='M 70,220 L110,220 110,260 70,260 z'
    >
    </path> 


<path stroke='#aaaaaa' fill='#cccccc' stroke-width='2' 
    d='M 190,220 L230,220 230,260 190,260 z'
    ></path> 
   

<path stroke='#aaaaaa' fill='#cccccc' stroke-width='2' 
    d='M 240,220 L280,220 280,260 240,260 z'
    ></path> 
<path stroke='#aaaaaa' fill='#cccccc' stroke-width='2' 
    d='M 240,220 L280,220 280,260 240,260 z'
    ></path> 
   

<path stroke='#aaaaaa' fill='#aabbff' stroke-width='2' 
    d='M 150,90 L190,90 190,100 150,100 z'
    ></path> 
   
<path stroke='#aaaaaa' fill='#ffffff' stroke-width='2' 
    d='M 150,100 L190,100 190,110 150,110 z'
    ></path> 
<path stroke='#aaaaaa' fill='#aabbff' stroke-width='2' 
    d='M 150,110 L190,110 190,120 150,120 z'
    ></path> 
      
<path stroke='#111111' fill='none' stroke-width='2' 
    d='M 150,88 L150,140'
    ></path> 
       -->
`;

  // src/lib/svgApps/apps/curves1App.js
  function curves1App() {
    return {
      name: "curves1App",
      svg: null,
      start: function(svg1, args) {
        svg = svg1;
        console.log(this.name, "svgApp starts");
        svg.innerHTML = `
    <path d="M0,100  L0,100  S198.16666666666666,65.39086647910054 396.3333333333333,94.13016371202521  S594.5,166.3380063651604 792.6666666666666,103.33776455691782  S990.8333333333334,67.27994029093432 1189,109.26604896139992  " stroke="#ff55bb" fill="none" transition="all 2s ease-in-out"></path><path d="M0,100  L0,100  S99.08333333333333,58.76327258067832 198.16666666666666,106.12738621712602  S297.25,137.48873453248422 396.3333333333333,93.90709518710906  S495.4166666666667,82.86303468864357 594.5,101.9109531109679  S693.5833333333333,153.55852783246718 792.6666666666666,93.11077351553585  S891.7499999999999,57.312012827971785 990.8333333333333,101.3034035804746  S1089.9166666666667,130.91581510383372 1189,104.42014380229027  " stroke="#77ff77" fill="none" transition="all 2s ease-in-out"></path><path d="M0,100  L0,100  S99.08333333333333,58.668280034745635 198.16666666666666,105.91985666192505  S297.25,143.46365141595905 396.3333333333333,93.16327185208628  S495.4166666666667,39.00011018363922 594.5,96.4820550600662  S693.5833333333333,92.02560489907896 792.6666666666666,104.77262342510645  S891.7499999999999,13.288579580431474 990.8333333333333,103.28528898026187  S1089.9166666666667,122.53321618083194 1189,97.30302033419103  " stroke="#77ff77" fill="none" transition="all 2s ease-in-out"></path>
    `;
      },
      end: function() {
        console.log(this.name, "svgApp ends");
      },
      run: function() {
      }
    };
  }

  // src/lib/svgApps/apps/palabrasApp.js
  function palabrasApp() {
    const svgNS3 = "http://www.w3.org/2000/svg";
    let sto;
    let st = `DESIGUAL:
Conectividad 
Tama\xF1o y composici\xF3n
Formas de organizaci\xF3n
Presupuesto para educaci\xF3n`;
    const arr = st.split("\n");
    const fontSize = 50;
    let bg = null;
    const lineHeight = fontSize * 1.5;
    const svgHeight = arr.length * lineHeight + 20;
    let name = "palabrasApp";
    let pals = [];
    let svg2 = null;
    let offset = 0;
    function start(svg1, args) {
      offset = window.innerHeight / 5;
      svg2 = svg1;
      console.log(name, "svgApp starts");
      try {
        pals.forEach((c) => {
          svg2.removeChild(c);
        });
      } catch (e) {
        console.log(e);
      }
      pals = [];
      for (let i = 0; i < arr.length; i++) {
        let txt = addPal(arr[i], i);
        pals.push(txt);
        svg2.appendChild(txt);
      }
      startAnim();
    }
    function startAnim() {
      let i = 0;
      showActual();
      function showActual() {
        pals[i].style.transition = "all 0.6s ease-in-out";
        pals[i].setAttribute("transform", "translate(0,0)");
        i++;
        if (i >= pals.length)
          return;
        sto = setTimeout(showActual, 600);
      }
    }
    function addPal(str, i) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", i == 0 ? "100" : 150 + i * 20);
      text.setAttribute("y", (i * lineHeight + lineHeight + offset).toString());
      text.setAttribute("font-size", fontSize.toString());
      text.setAttribute("fill", bg || "white");
      if (i == 0)
        text.setAttribute("fill", "#aaaaff");
      text.setAttribute("stroke", "#aaaaaa");
      text.setAttribute("style", "letter-spacing:1px;font-family: sans-serif; font-weight: bold;");
      text.setAttribute("transform", "translate(-1300,0)");
      text.textContent = str;
      return text;
    }
    function end() {
      console.log(name, "svgApp ends");
      clearTimeout(sto);
    }
    function run() {
    }
    return { start, end, run };
  }

  // src/lib/svgApps/apps/palabras2App.js
  function palabras2App() {
    const svgNS3 = "http://www.w3.org/2000/svg";
    let sto;
    let st = `HETEROGENEIDAD
En las pol\xEDticas previas
En los reg\xEDmenes acad\xE9micos
En los modos de apropiaci\xF3n 
de recursos`;
    const arr = st.split("\n");
    const fontSize = 50;
    let bg = null;
    const lineHeight = fontSize * 1.5;
    const svgHeight = arr.length * lineHeight + 20;
    let name = "palabrasApp";
    let pals = [];
    let svg2 = null;
    let offset = 0;
    function start(svg1, args) {
      offset = window.innerHeight / 5;
      svg2 = svg1;
      console.log(name, "svgApp starts");
      try {
        pals.forEach((c) => {
          svg2.removeChild(c);
        });
      } catch (e) {
        console.log(e);
      }
      pals = [];
      for (let i = 0; i < arr.length; i++) {
        let txt = addPal(arr[i], i);
        pals.push(txt);
        svg2.appendChild(txt);
      }
      startAnim();
    }
    function startAnim() {
      let i = 0;
      showActual();
      function showActual() {
        pals[i].style.transition = "all 0.6s ease-in-out";
        pals[i].setAttribute("transform", "translate(0,0)");
        i++;
        if (i >= pals.length)
          return;
        sto = setTimeout(showActual, 600);
      }
    }
    function addPal(str, i) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", i == 0 ? "100" : 150 + i * 20);
      text.setAttribute("y", (i * lineHeight + lineHeight + offset).toString());
      text.setAttribute("font-size", fontSize.toString());
      text.setAttribute("fill", bg || "white");
      if (i == 0)
        text.setAttribute("fill", "#ffdd00");
      text.setAttribute("stroke", "#111111");
      text.setAttribute("style", "letter-spacing:1px;font-family: sans-serif; font-weight: bold;");
      text.setAttribute("transform", "translate(-1000,0)");
      text.textContent = str;
      return text;
    }
    function end() {
      console.log(name, "svgApp ends");
      clearTimeout(sto);
    }
    function run() {
    }
    return { start, end, run };
  }

  // src/lib/svgApps/SVGapps.js
  var SVGapps = {
    curves1App,
    sistemasApp,
    defaultApp,
    graphApp,
    schemeApp: function() {
      return {
        name: "schemeApp",
        start: function(arg) {
          console.log(this.name, arg, "svgApp starts");
        },
        end: function() {
          console.log(this.name, "svgApp ends");
        },
        run: function() {
        }
      };
    },
    schoolApp,
    palabrasApp,
    palabras2App
  };

  // src/lib/svgApps/SvgApp.js
  function initSvgApp(obj, el) {
    let active2 = true;
    let ew = el.clientWidth;
    let eh = el.clientHeight;
    let app = SVGapps[obj.app]();
    let svg2 = el.querySelector("svg");
    svg2.setAttribute("width", ew);
    svg2.setAttribute("height", eh);
    svg2.setAttribute("viewBox", `0 0 ${ew} ${eh}`);
    svg2.innerHTML = ``;
    if (app)
      app.start(svg2);
    run();
    function run() {
      if (!active2)
        return;
      if (app)
        app.run();
      requestAnimationFrame(run);
    }
    function end() {
      active2 = false;
      if (app)
        app.end();
    }
    return { end };
  }

  // src/lib/SectionApp.js
  function SectionApp(obj, el) {
    let state = false;
    let currentApp;
    el.style.transition = "all 1s ease-in-out";
    el.style.opacity = 0;
    let sto;
    init2();
    function init2() {
      console.log("SectionApp init", obj.template);
      window.addEventListener("scroll", sc2);
      if (obj.template == "gallery") {
        Gallery(el);
      }
    }
    function end() {
      window.removeEventListener("scroll", sc2);
      console.log("SectionApp ended", obj.template);
    }
    function sc2() {
      let isv = isInViewport(el);
      if (isv && !state) {
        startSection();
      } else if (!isv && state) {
        endSection();
      }
    }
    function startSection() {
      state = true;
      clearTimeout(sto);
      console.log("start section app: " + obj.template);
      el.style.opacity = 1;
      if (obj.template == "staff") {
        initStaff();
      }
      if (obj.template == "svgApp") {
        currentApp = initSvgApp(obj, el);
      }
      if (obj.template == "fullImage") {
        el.querySelector("img").classList.add("opened");
      }
      if (obj.template == "boldText") {
        el.querySelector(".boldText").classList.add("opened");
      }
      if (obj.template == "mediumText") {
        el.querySelector(".mediumText").classList.add("opened");
      }
      if (obj.template == "fullVideo") {
        let lv = el.querySelector("video");
        if (lv)
          lv.pause();
        let vv = el.querySelector(".iframeCont");
        if (vv) {
          vv.classList.remove("visible");
          setTimeout(() => {
            vv.innerHTML = ``;
          }, 1e3);
        }
        el.querySelector(".playBut").style.display = "inline-block";
      }
    }
    function endSection() {
      state = false;
      console.log("end section app: " + obj.template);
      el.style.opacity = 0;
      if (obj.template == "fullImage") {
        el.querySelector("img").classList.remove("opened");
      }
      if (obj.template == "boldText") {
        el.querySelector(".boldText").classList.remove("opened");
      }
      if (obj.template == "mediumText") {
        el.querySelector(".mediumText").classList.remove("opened");
      }
      if (obj.template == "fullVideo") {
        let lv = el.querySelector("video");
        if (lv)
          lv.pause();
        let vv = el.querySelector(".iframeCont");
        if (vv) {
          vv.classList.remove("visible");
          setTimeout(() => {
            vv.innerHTML = ``;
          }, 1e3);
        }
        el.querySelector(".playBut").style.display = "inline-block";
      }
      clearTimeout(sto);
      if (currentApp) {
        currentApp.end();
        currentApp = null;
      }
      ;
    }
    function initStaff() {
      currentApp = Staff(el);
    }
    return { init: init2, end, startSection, endSection };
  }

  // src/Proyecto.js
  function Proyecto(div, obj, onRendered) {
    let scrollForMore2;
    let folder;
    render();
    function render() {
      let str = "";
      folder = obj.project.folder;
      obj.project.blocks.forEach(function(block, ii) {
        if (ii == 0 && block.background) {
          div.style.backgroundColor = block.background;
        }
        if (block.text) {
          block.text = formatText(block.text, block.highlightColor);
        }
        let template = templates[block.template];
        str += `
            <div class='section ${ii == 0 ? "firstSection" : ""} sect_${block.template}'   
            style="${block.background ? `background-color:${block.background};` : ``}   
                  ${block.color ? `color:${block.color};` : ``}  
                  ${block.backgroundImage ? `background-image:url(${imgLink(block.backgroundImage, folder)});` : ``}
                  ${block.height && block.template == "fullImage" ? `height:${block.height};font-size:0px;` : ``}

       " >
${setVars(template, block)}

</div>
`;
      });
      div.innerHTML = str;
      let sections = [...div.querySelectorAll(".section")];
      sections.forEach((s) => {
        let v = s.querySelector("video");
        if (v)
          initVideo(v);
        let vim = s.querySelector(".iframeCont");
        if (vim)
          initVimeo(vim, vim.parentNode);
      });
      obj.project.blocks = obj.project.blocks.map((bk, i) => {
        if (bk.height && bk.template == "fullImage") {
          sections[i].querySelector(".fullImage").classList.add("noFull");
        }
        return { ...bk, el: sections[i], app: SectionApp(bk, sections[i]) };
      });
      if (obj.project.blocks.length > 0)
        obj.project.blocks[0].app.startSection();
      requestAnimationFrame(() => {
        sections[0].style.transform = `translate(0px,0px)`;
        div.style.transition = `top 1s ease-in-out`;
        div.style.top = `0px`;
        onRendered();
      });
    }
    function setVars(tmp, ob) {
      if (ob.template == "fullVideo") {
        if (ob.vimeo) {
          tmp = templates["vimeo"];
          tmp = tmp.split("{videosrc}").join(ob.vimeo);
        } else
          tmp = tmp.split("{videosrc}").join(imgLink(ob.videos, folder));
      }
      if (ob.template == "boldText" || ob.template == "mediumText") {
        if (ob.title) {
          tmp = tmp.split("{title}").join(ob.title);
        } else {
          tmp = tmp.split("<p class='sectionTitle'>{title}</p>").join("");
        }
        tmp = tmp.split("{txt}").join(ob.text);
        if (ob.backgroundImage) {
          tmp = tmp.split("{imgsrc}").join(ob.backgroundImage);
        }
      }
      if (ob.template == "fullImage") {
        tmp = tmp.split("{imgsrc}").join(imgLink(ob.imgs, folder));
      }
      if (ob.template == "gallery") {
        let s = `${ob.imgs.map((ima) => {
          return `<div><img  loading="lazy"  src='${imgLink(ima, folder)}'></div>`;
        }).join("")}`;
        tmp = tmp.split("{imgs}").join(s);
      }
      if (ob.template == "staff") {
        let s = `<div ><p class='sectionTitle'>${ob.title ? ob.title : "credits"}</p>
                    ${ob.list.map((i) => {
          return `<div class='staffLine'  ${ob.color ? ` style="border-color:${ob.color};"` : ""} ><div>${i.title}<div class='sline'></div></div> <div>${i.names.map((n, ii) => {
            return `<span class='staffname' ${ob.color ? ` style="border-color:${ob.color};"` : ""}  >${n}${ii >= i.names.length - 1 || i.names.length < 1 ? "" : "<div class='sline'></div>"}</span>`;
          }).join("")}</div></div>`;
        }).join("")}
                    
                    </div>
                    `;
        tmp = tmp.split("{list}").join(s);
      }
      if (ob.template == "svgApp") {
        if (ob.title) {
          tmp = tmp.split("{title}").join(ob.title);
        } else {
          tmp = tmp.split("<p class='sectionTitle'>{title}</p>").join("");
        }
        if (ob.text) {
          tmp = tmp.split("{txt}").join(ob.text);
        } else {
          tmp = tmp.split("<h3>{txt}</h3>").join("");
        }
        if (ob.backgroundImage) {
          tmp = tmp.split("{imgsrc}").join(ob.backgroundImage);
        }
      }
      return tmp;
    }
    function end() {
      console.log("end project");
      if (obj.project)
        obj.project.blocks.forEach((b) => b.app.end());
    }
    return { end };
  }
  function formatText(str, col) {
    let nstr = str.split("\n").join(" <br> ");
    if (col) {
      let pals = nstr.split(" ");
      let strc = pals.map((p) => {
        if (p.startsWith("(color)")) {
          p = `<span style='color:${col}'>${p.slice(7)}</span>`;
        }
        return p;
      });
      nstr = strc.join(" ");
    }
    return nstr;
  }
  function imgLink(filename, folder) {
    if (filename.startsWith("http")) {
      return filename;
    }
    return `${folder}/${filename}`;
  }
  function initVideo(v) {
    console.log("init video", { v });
    let playing = false;
    let div = v.parentNode;
    let pbut = document.createElement("div");
    pbut.classList.add("playBut");
    pbut.innerText = "Play";
    div.appendChild(pbut);
    pbut.addEventListener("click", play);
    v.addEventListener("play", function() {
      console.log("play", v);
    });
    function pause(e) {
      if (e)
        e.preventDefault();
      v.pause();
      pbut.style.display = "inline-block";
      v.removeEventListener("click", pause);
      playing = false;
    }
    function play(e) {
      if (e)
        e.preventDefault();
      playing = true;
      v.addEventListener("click", pause);
      v.play();
      pbut.style.display = "none";
    }
    return { play, pause };
  }
  function initVimeo(vdiv, div) {
    console.log("init vimeo");
    let src = vdiv.getAttribute("data-src");
    ;
    let playing = false;
    let pbut = document.createElement("div");
    pbut.classList.add("playBut");
    pbut.innerText = "Play";
    div.appendChild(pbut);
    pbut.addEventListener("click", play);
    function pause(e) {
      if (e)
        e.preventDefault();
      pbut.style.display = "inline-block";
      vdiv.classList.remove("visible");
      setTimeout(() => {
        vdiv.innerHTML = ``;
      }, 1e3);
      playing = false;
    }
    function play(e) {
      if (e)
        e.preventDefault();
      playing = true;
      vdiv.innerHTML = `<iframe src='${src}?h=6e157b7eac&autoplay=1&loop=1&color=f5d907&title=0&byline=0&portrait=0' width="100%" height="100%" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""  allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
      requestAnimationFrame(() => {
        vdiv.classList.add("visible");
      });
      pbut.style.display = "none";
    }
    return { play, pause };
  }

  // src/lib/loading/Loading.js
  function Loading(obj = {}) {
    const player = document.querySelector("lottie-player");
    let loadingDiv = document.querySelector(".loading-component");
    function show() {
      loadingDiv.style.display = "flex";
      loadingDiv.classList.remove("closed");
      if (player)
        player.play();
    }
    function hide() {
      setTimeout(() => {
        loadingDiv.classList.add("closed");
        setTimeout(() => {
          if (player)
            player.pause();
          loadingDiv.style.transform = "translate(0px,100%)";
          loadingDiv.style.display = "none";
        }, 400);
      }, 400);
    }
    return { show, hide };
  }

  // src/ScrollForMore.js
  function ScrollForMore() {
    let sto;
    let opened = false;
    let sfm = document.querySelector(".scrollForMore");
    if (sfm) {
    } else {
      return { show: () => {
      }, hide: () => {
      } };
    }
    function show() {
      if (opened)
        return;
      opened = true;
      clearTimeout(sto);
      sfm.style.display = "block";
      sto = setTimeout(() => {
        sfm.classList.add("open");
      }, 500);
    }
    function hide() {
      if (!opened)
        return;
      clearTimeout(sto);
      opened = false;
      sfm.classList.remove("open");
      sto = setTimeout(() => {
        sfm.style.display = "none";
      }, 500);
    }
    return { show, hide };
  }

  // src/main.js
  document.addEventListener("DOMContentLoaded", init);
  var sc;
  var ball;
  var listApp;
  var projectApp;
  var projectDiv;
  var listDiv;
  var scrollForMore;
  var headerEl;
  var initiated = false;
  var inProject = false;
  function init() {
    headerEl = document.querySelector("header");
    scrollForMore = ScrollForMore();
    loader = Loading({});
    projectDiv = document.getElementById("proyecto");
    listDiv = document.getElementById("lista");
    ball = Ball();
    listApp = projectsList(showProject, () => {
      loader.hide();
      showNav();
    });
    document.querySelector(".logo img").removeEventListener("click", backToHome);
    document.querySelector(".logo img").addEventListener("click", backToHome);
  }
  function goToHashProject(tag) {
    console.log({ tag });
    let p = listApp.getProject(tag);
    initiated = true;
    if (p)
      showProject(p);
  }
  document.addEventListener("keydown", keyd);
  function keyd(event) {
    let ay;
    if (event.keyCode === 40) {
      if (event)
        event.preventDefault();
      console.log("Up arrow key pressed");
      if (sc) {
        ay = window.pageYOffset;
        console.log(ay);
        sc.goTo(ay + window.innerHeight);
      }
    } else if (event.keyCode === 38) {
      if (event)
        event.preventDefault();
      console.log("Down arrow key pressed");
      if (sc) {
        ay = window.pageYOffset;
        console.log(ay);
        sc.goTo(ay - window.innerHeight);
      }
    }
  }
  function showProject(obj) {
    let pnavs = [...document.querySelectorAll(".rightNav")];
    pnavs.forEach((pp) => {
      document.body.removeChild(pp);
    });
    inProject = true;
    loader.show();
    listApp.hide();
    ball.hide();
    projectDiv.style.display = "block";
    document.addEventListener("backbutton", back);
    projectApp = Proyecto(projectDiv, obj, () => {
      if (sc) {
        sc.end();
      }
      setTimeout(() => {
        listDiv.style.display = "none";
      }, 1e3);
      sc = easeScroll(updatePos, projectDiv);
      setTimeout(() => {
        loader.hide();
        scrollForMore.show();
      }, 1e3);
      initRightNav(projectDiv, rightNavClick);
    });
  }
  function rightNavClick(e) {
    if (e)
      e.preventDefault();
    let i = Number(this.getAttribute("data-i"));
    if (sc)
      sc.goTo(window.innerHeight * i);
  }
  function initRightNav(dv, clickFn) {
    const myArray = [...dv.querySelectorAll(".section")];
    createSVGImage(myArray);
    function createSVGImage(array) {
      const svgNS3 = "http://www.w3.org/2000/svg";
      const svg2 = document.createElementNS(svgNS3, "svg");
      svg2.setAttribute("width", "40");
      svg2.setAttribute("height", window.innerHeight.toString());
      svg2.style.position = "fixed";
      svg2.style.right = "0";
      svg2.style.top = "0";
      svg2.classList.add("rightNav");
      document.body.appendChild(svg2);
      const circleHeight = window.innerHeight / array.length;
      const line = document.createElementNS(svgNS3, "path");
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", "black");
      line.setAttribute("d", `M20,0 L20,${window.innerHeight}`);
      svg2.appendChild(line);
      for (let i = 0; i < array.length; i++) {
        const circle = document.createElementNS(svgNS3, "circle");
        circle.setAttribute("cx", "20");
        circle.setAttribute("cy", ((i + 0.5) * circleHeight).toString());
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", "#aaaaaaaa");
        circle.setAttribute("stroke", "black");
        circle.setAttribute("data-i", i);
        svg2.appendChild(circle);
        circle.style.cursor = "pointer";
        initEvents(circle);
      }
    }
    function initEvents(circle) {
      if (clickFn)
        circle.addEventListener("click", clickFn);
    }
  }
  function updatePos(ob) {
    if (ob.dy == 0) {
      scrollForMore.show();
    } else {
      scrollForMore.hide();
    }
  }
  function backToHome(e) {
    if (inProject) {
      window.location.href = window.location.href.split("#")[0];
      projectApp.end();
      backToList();
      return;
    }
    window.location.href = "index.html";
  }
  function backToList(e) {
    inProject = false;
    ball.show();
    scrollForMore.hide();
    showNav();
  }
  function showNav() {
    let AProject;
    let hsh = window.location.hash;
    if (initiated) {
      if (hsh)
        window.location.href = window.location.href.split("#")[0];
    } else {
      if (hsh) {
        AProject = hsh.split("#").join("");
      }
    }
    if (sc) {
      sc.end();
    }
    if (projectApp) {
      projectApp.end();
      projectApp = null;
    }
    listDiv.style.display = "block";
    projectDiv.style.display = "none";
    projectDiv.innerHTML = "";
    listApp.show();
    sc = easeScroll(updatePos, listDiv);
    if (AProject) {
      goToHashProject(AProject);
    }
  }
  function back(e) {
    console.log("back", e);
  }
})();
