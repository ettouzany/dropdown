var g_target = null;
var mapData={
    items:[]
  };
  
  var fontSizeRef=16;
  var workspaceSize=425;
  var scrollSpeed=4;
  var isThereAnyActiveMapItems = false;
  var doubleClickTimer = 0;
  var dblclickInterval;
  document.getElementById('map').onmousedown = function(e) { handleMapClick(e) };
  document.getElementById('map').ontouchstart = function(e) { handleMapClick(e) };
  window.onresize=function(){
    workspaceSize=window.innerWidth;
    initFontSize();
  }
  loadMapData();
  drawMap();
  workspaceSize=window.innerWidth;
  initFontSize();
  function initFontSize(){
    var fsize=document.getElementById("map-container").offsetWidth*fontSizeRef/workspaceSize;
    document.getElementsByTagName("html")[0].style="font-size:"+fsize+"px";
    if(document.getElementById("actions"))
      document.getElementById("actions").style="font-size:"+(fsize<=28 ? fsize : 28)+"px";
  }
  function handleMapClick(e) {
    var event = e;
    if (e.touches) {
      e = e.touches[0];
    }
    var parent = document.getElementById('map');
    var parentPosX = parent.getBoundingClientRect().x;
    var parentPosY = parent.getBoundingClientRect().y;
    if (e.target === document.getElementById('map') && (event.touches || e.which === 1)) {
      if (!isThereAnyActiveMapItems) {
        parent.onmouseup = function(e) {
            doubleClickTimer++;
            if(doubleClickTimer==2){
              try{
                clearTimeout(dblclickInterval);
              }catch(e){}
              doubleClickTimer=0;
              mouseUp();
            }else{
              dblclickInterval=setTimeout(function(){doubleClickTimer=0;},250);
            }
        };
        parent.ontouchmove=function(){
           parent.onmouseup =null;
           parent.ontouchmove=null;
        };
        parent.onmousemove = function() {
          parent.onmouseup = null;
          parent.onmousemove=null;
        };
      }

      function mouseUp() {
        const newmapItem = createNewElement(getXP(e.clientX - parentPosX + parent.scrollLeft), getYP(e.clientY - parentPosY + parent.scrollTop));
        parent.appendChild(newmapItem);
        newmapItem.focus();
        isThereAnyActiveMapItems = true;
        parent.onmouseup = null;
        parent.ontouchend = null;
      }
      //if(!mouseUp())
      document.getElementById("drop").style.display = "none";
    } else if (e.target.classList.contains("mapItem")) {
      mapItemMove(event, e.target);
    }
  }

  function createNewElement(xPos, yPos) {
    var mapItem = document.createElement('div');
    mapItem.style.position = 'absolute';
    mapItem.style.left = `${xPos}px`;//%`;
    mapItem.style.top = `${yPos}px`;//%`;
    mapItem.setAttribute('class', 'mapItem');
    mapItem.setAttribute('id', 'mapItem_'+document.getElementsByClassName('mapItem').length);
    mapItem.setAttribute('placeholder', 'Write');
    mapItem.setAttribute('isEmpty', '');
    mapItem.setAttribute('contentEditable', '');
    mapItem.setAttribute('onkeydown', 'mapItemOnInput(event)');
    mapItem.setAttribute('onblur', 'mapItemOnBlur(this)');
    mapItem.setAttribute('oncontextmenu','function(e) {if(!(e.target.hasAttribute("contentEditable"))) {e.preventDefault();}}');
    return mapItem;
  }

  function mapItemOnClick(element) {
    isThereAnyActiveMapItems=true;
    element.setAttribute('contentEditable', '');
    element.focus();
  }

  function mapItemOnBlur(element) {
    if (element.innerText.trim()) {
      element.removeAttribute('contentEditable');
      saveItemToMapData(element);
    } else {
      removeMapItem(element);
    }
    isThereAnyActiveMapItems = false;
  }

  function mapItemOnInput(event) {
    var target = event.target;
    target.removeAttribute("isEmpty");
    if (event.key === "Enter") {
      target.blur();
    } else {
      target.onkeyup = function(e) {
        if (target.textContent.length) {
          if (target.hasAttribute("isEmpty")) {
            target.removeAttribute("isEmpty");
          }
        } else {
          if (!(target.hasAttribute("isEmpty"))) {
            target.setAttribute("isEmpty", "");
          }
        }
        target.onkeyup = null;
      }
    }
  }

  function mapItemMove(event, target) {
    var initX = getXP(target.offsetLeft);
    var initY = getYP(target.offsetTop);
    var isItTouchScreen = event.touches
    var drop;
    drop = document.getElementById("drop");
    if (!(target.hasAttribute("contentEditable"))) {
      if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)))
      document.getElementById("drop").style.display = "none";
      if (event.which === 3) {
        document.body.oncontextmenu = function(e) { e.preventDefault(); };
        onmouseup = function(e) {
          //removeMapItem(target);
          //console.log(target);
         // console.log(target.style.top);
          drop.style.display = "flex";
          drop.style.left = getPosFromTarget(target)[0];
          drop.style.top = getPosFromTarget(target)[1];
          setTimeout(function() { document.body.oncontextmenu = null; }, 100);
          onmouseup = null;
        };
      } else {
        var mouseStartX, mouseStartY;
        if (isItTouchScreen) {
          mouseStartX = event.touches[0].clientX - target.getBoundingClientRect().x;
          mouseStartY = event.touches[0].clientY - target.getBoundingClientRect().y;
        } else {
          mouseStartX = event.clientX - target.getBoundingClientRect().x;
          mouseStartY = event.clientY - target.getBoundingClientRect().y;
        }
        var t = setTimeout(function() {
          try{
          if (window.getSelection) {
              if (window.getSelection().empty) {
                  window.getSelection().empty();
              } else if (window.getSelection().removeAllRanges) {
                  window.getSelection().removeAllRanges();
              }
          }}catch(e){}
          document.body.style = "cursor:grabbing;user-select: none;-moz-user-select: none;-webkit-user-select: none;";
          target.style.cursor = "grabbing";
          onmousemove = function(e) { onMouseMove(e) };
          ontouchmove = function(e) { onMouseMove(e.touches[0]) };

          function onMouseMove(e) {
            target.onmouseup = null;
            target.ontouchend = null;
            
            var parent = document.getElementById('map');
            var parentPosX = parent.getBoundingClientRect().x;
            var parentPosY = parent.getBoundingClientRect().y;
            if (e.clientX - parentPosX - mouseStartX > 0 ) {
              var newXPos=e.clientX-parentPosX+parent.scrollLeft-mouseStartX;
              target.style.left = `${getXP(newXPos>=0 ? newXPos : 0)}px`;//%`;
              if(e.clientX - parentPosX >= parent.offsetWidth - target.offsetWidth+mouseStartX){
                scrollToRight(e.clientX - parentPosX>0 ? scrollSpeed : 0);
              }
            } else {
              if(parent.scrollLeft===0){
                target.style.left = `${getXP(0)}px`;//%`;
              }else{
                scrollToRight(-scrollSpeed);
                target.style.left = `${getXP(target.offsetLeft-scrollSpeed)}px`;//%`;
                if(parent.scrollLeft<0){
                  parent.scrollTo(0,parent.scrollTop);
                }
              }
            }
            if (e.clientY - parentPosY > 0) {
              var newYPos=e.clientY-parentPosY+parent.scrollTop-mouseStartY;
              target.style.top = `${getYP(newYPos>=0 ? newYPos : 0)}px`;//%`;
              if(e.clientY - parentPosY >= parent.offsetHeight - target.offsetHeight){
                scrollToBottom(e.clientY - parentPosY>0 ? scrollSpeed : 0);
              }
            } else {
              if(parent.scrollTop===0){
                target.style.top = `${getYP(0)}px`;//%`;
              }else{
                scrollToBottom(-scrollSpeed);
                target.style.top = `${getYP(target.offsetTop-scrollSpeed)}px`;//%`;
                if(parent.scrollTop<0){
                  parent.scrollTo(parent.scrollLeft,0);
                }
              }
            }
          }
          onmouseup = function() { onMouseUp() };
          ontouchend = function() { 
            onMouseUp();
            var drop;
            drop = document.getElementById("drop");
            drop.style.display = "flex";
            console.log(event.touches[0].pageX);
            drop.style.left = getPosFromTarget(target)[0];
            drop.style.top = getPosFromTarget(target)[1];
           };

          function onMouseUp() {
            document.body.style = "";
            target.style.cursor = "";
            onmousemove = null;
            ontouchmove = null;
            saveItemToMapData(target);
            onmouseup = null;
            ontouchend = null;
          }
        }, isItTouchScreen ? 300 : 100);
        target.ontouchend = function() { clearTimeout(t);
          mapItemOnClick(target) };
        target.onmouseup = function() { clearTimeout(t);
          mapItemOnClick(target); };
      }
    }
  }
  function removeMapItem(item) {
    removeItemFroMapData(item);
    document.getElementById("map").removeChild(item);
  }
  function saveItemToMapData(item){
    var itemId=item.getAttribute("id");
    var n=0;
    for (var i in mapData.items) {
      if (mapData.items[i].id === itemId) {
        n++;
        updateItemOfMapData(item,i);
        break;
      }
    }
    if(n===0){
      var newItem={id:itemId,content:item.innerText,posX:getXP(item.offsetLeft),posY:getYP(item.offsetTop)};
      mapData.items.push(newItem);
      saveMapData();
    }
  }
  function removeItemFroMapData(item) {
    var itemId=item.getAttribute("id");
    for(var i in mapData.items){
      if(mapData.items[i].id===itemId){
        mapData.items.splice(i,1);
        saveMapData();
        break;
      }
    }
  }
  function updateItemOfMapData(item,i) {
    mapData.items[i].content=item.innerText;
    mapData.items[i].posX=getXP(item.offsetLeft);
    mapData.items[i].posY=getYP(item.offsetTop);
    saveMapData();
  }
  function loadMapData(){
    try{
      if(localStorage.getItem('pmMapData')){
        mapData=JSON.parse(localStorage.getItem('pmMapData'));
      }
    }catch(e){}
  }
  function saveMapData(){
    try {
      localStorage.setItem('pmMapData', JSON.stringify(mapData));
    } catch (e) {}
  }
  function drawMap(){
    var map=document.getElementById("map");
    for(var i in mapData.items){
      var item=createNewElement(mapData.items[i].posX,mapData.items[i].posY);
      item.append(mapData.items[i].content);
      item.removeAttribute("isEmpty");
      item.removeAttribute("contentEditable");
      item.setAttribute('id', mapData.items[i].id);
      map.appendChild(item);
    }
  }
  function getPosFromTarget(target)
  {
  
    var output = [0,0];
    var drop  = document.getElementById("drop");
    g_target = target;
    var map  = document.getElementById("map-container");
    var right = target.offsetLeft +target.offsetWidth/2+ drop.offsetWidth/2-map.offsetWidth;
    var left = target.offsetLeft +target.offsetWidth/2- drop.offsetWidth/2;
    // console.log(left);
    a = right<0?left<0?left:0:right;

    // console.log("this -",(target.offsetLeft +target.offsetWidth/2+ drop.offsetWidth/2)-map.offsetWidth);
    output[0] = target.offsetLeft+target.offsetWidth/2 - drop.offsetWidth/2-a + "px";
    if(target.offsetTop+target.offsetHeight + 4 + drop.offsetHeight < map.offsetHeight)
      output[1] = target.offsetTop+target.offsetHeight + 4 + "px";
    else
      output[1] = target.offsetTop-drop.offsetHeight - 8 + "px";

    return output;
  }
  function removeItem()
  {
    removeMapItem(g_target);
    document.getElementById("drop").style.display = "none";
  }
  function renameItem()
  {
    removeMapItem(g_target);
    document.getElementById("drop").style.display = "none";
  }
  function getXP(x){
    return Math.floor(x);//*100/document.getElementById("map-container").offsetWidth;
  }
  function getYP(y){
    return Math.floor(y);//*100/document.getElementById("map-container").offsetHeight;
  }
  function scrollToBottom(y){
    document.getElementById("map").scrollBy(0,y);
  }
  function scrollToRight(x){
    document.getElementById("map").scrollBy(x,0);
  }