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
    if (event)
      event.preventDefault();
    let ay;
    if (event.keyCode === 40) {
      console.log("Up arrow key pressed");
      if (sc) {
        ay = window.pageYOffset;
        console.log(ay);
        sc.goTo(ay + window.innerHeight);
      }
    } else if (event.keyCode === 38) {
      console.log("Down arrow key pressed");
      if (sc) {
        ay = window.pageYOffset;
        console.log(ay);
        sc.goTo(ay - window.innerHeight);
      }
    }
  }
  function showProject(obj) {
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
    });
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
    setBrillance("dark");
    if (AProject) {
      goToHashProject(AProject);
    }
  }
  function back(e) {
    console.log("back", e);
  }
  function setBrillance(com, parent) {
    if (com == "dark") {
      headerEl.classList.remove("invert");
      return;
    }
    if (com == "bright" || com == "light") {
      headerEl.classList.add("invert");
      return;
    }
    const parentStyle = getComputedStyle(parent);
    let parentBgColor = parentStyle.backgroundColor;
    let parentColor = parseInt(parentBgColor.substring(1), 16);
    if (isNaN(parentColor)) {
      parentBgColor = rgbToHex(parentBgColor);
    }
    parentColor = parseInt(parentBgColor.substring(1), 16);
    if (isNaN(parentColor)) {
      return;
    }
    const r = parentColor >> 16 & 255;
    const g = parentColor >> 8 & 255;
    const b = parentColor & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1e3;
    const isLight = brightness > 180;
    if (isLight) {
      headerEl.classList.add("invert");
    } else {
      headerEl.classList.remove("invert");
    }
    function rgbToHex(rgb) {
      const [r2, g2, b2] = rgb.substring(4, rgb.length - 1).split(", ").map((x) => parseInt(x));
      const hexR = r2.toString(16).padStart(2, "0");
      const hexG = g2.toString(16).padStart(2, "0");
      const hexB = b2.toString(16).padStart(2, "0");
      return `#${hexR}${hexG}${hexB}`;
    }
  }
})();
