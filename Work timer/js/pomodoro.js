(function(global) {
    document.body.innerHTML = '';
    document.body.style.backgroundColor = '#fff';

    var wrapper = document.createElement('div');
    wrapper.style.width = '200px';
    wrapper.style.height = '220px';
    wrapper.style.textAlign = 'center';
    wrapper.style.position = 'absolute';
    wrapper.style.top = ((global.innerHeight / 2) - (parseInt(wrapper.style.width) / 2)) + 'px';
    wrapper.style.left = ((global.innerWidth / 2) - (parseInt(wrapper.style.height) / 2)) + 'px';

    var img = document.createElement('img');
    img.src = chrome.runtime.getURL('img/red/icon128.png');

    wrapper.appendChild(img);

    var h1 = document.createElement('h1');
    h1.textContent = 'Work time is now!';
    h1.style.margin = 0;
    h1.style.color = '#000';
    h1.style.lineHeight = '35px';
    h1.style.fontSize = '30px';
    h1.style.fontFamily = 'Arial, sans-serif';

    wrapper.appendChild(h1);

    document.body.appendChild(wrapper);

})(window);
