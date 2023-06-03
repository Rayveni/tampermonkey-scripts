// ==UserScript==
// @name         test3
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://asust.test-01.station.tsft.stdev.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stdev.ru
// @run-at document-end
// ==/UserScript==

const _timeout=1000,_interval=200;
var prev_res=false;
function heart_beat(_f){

	let timerId = setInterval(function() {
    let res=check_selector();
	    if (res){
			if (!prev_res){
				let _element=document.querySelector('.tsft-modal__top'),
				ccs_params={ 'z-index': 3, backgroundColor: 'red'};
				addButton('favicons', addButton,ccs_params,_element);


			prev_res=true;
			}
		 clearInterval(timerId);
	}else
	{
		prev_res=false;
	}

}, _interval);

// остановить вывод через 5 секунд
setTimeout(() => { clearInterval(timerId);}, _timeout);
}

function check_selector(){
	let res=false,
        elems = document.querySelectorAll('.arrival-reg');
    if(elems.length > 0){
        //document.querySelector('.tsft-modal__win').style.backgroundColor='red'
        res=true;
    }
	return res
}

addEventListener("mousedown", (event) => {
heart_beat(check_selector);
});

    function addButton(text, onclick,ccs_params,_selector, cssObj) {
		let button = document.createElement('button'), btnStyle = button.style;
		   // ccs_params={position: 'absolute', top: '9%', left:'4%', 'z-index': 3, backgroundColor: 'red'};
        cssObj = cssObj || ccs_params;

        _selector.prepend(button);
        button.innerHTML = text;
        button.onclick = onclick;
        Object.keys(cssObj).forEach(key => btnStyle[key] = cssObj[key]);
    }

