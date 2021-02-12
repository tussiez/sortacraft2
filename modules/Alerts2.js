const Alert = {
  msg: function(content,timeout){
    let div = document.createElement('div');
    let inner = document.createElement('inner');
    div.appendChild(inner);
    inner.setAttribute('style','margin:8px;padding:8px;');
    inner.innerHTML = content;
    div.setAttribute('style','height:30%;width:30%;background-color:#333;color:white;position:absolute;left:35%;top:35%;opacity:0;border-radius:5px;transition:opacity 0.2s ease,transform 0.3s ease;');
    document.body.appendChild(div);
    div.addEventListener('mousedown',hideEle);
    function hideEle(){
      div.style.opacity = '0';
      div.style.transform ='translateY(-30%)';
      setTimeout(function(){
      document.body.removeChild(div);
      },500);
    }
    setTimeout(function(){
      div.style.opacity = '1'
    setTimeout(function(){
      div.style.opacity = '0';
      div.style.transform ='translateY(-30%)';
      setTimeout(function(){
      document.body.removeChild(div);
      },500);
    },timeout*1000)
    },500);
  }
}
export default Alert;