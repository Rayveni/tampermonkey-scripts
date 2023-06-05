// ==UserScript==
// @name         autofill
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  add export form values and autofill
// @author       You
// @match        http://asust.test-01.station.tsft.stdev.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stdev.ru
// @run-at document-end
// ==/UserScript==

const _timeout = 1000,
  _interval = 200,
  _dropdown_timeout = 100;
csv_charset = 'utf-8';
var prev_res = false;

addEventListener('mousedown', (event) => {
  heart_beat(check_selector);
});

function heart_beat(_f) {
  let timerId = setInterval(function () {
    let res = check_selector();
    if (res) {
      if (!prev_res) {
        let _element = document.querySelector('.tsft-modal__top'),
          _modal_title =
            document.querySelector('.tsft-modal__title').textContent;
        addButton(
          'import',
          function () {
            readCSVFile();
          },
          _element
        );
        addButton(
          'export',
          function () {
            download_csv(
              parce_input_fields(),
              _modal_title + '.csv',
              (sep = ';')
            );
          },
          _element
        );
        prev_res = true;
      }
      clearInterval(timerId);
    } else {
      prev_res = false;
    }
  }, _interval);

  // остановить вывод через 5 секунд
  setTimeout(() => {
    clearInterval(timerId);
  }, _timeout);
}

function check_selector() {
  let res = false,
    elems = document.querySelectorAll('.arrival-reg');
  if (elems.length > 0) {
    res = true;
  }
  return res;
}

function addButton(text, onclick, _selector, ccs_params = {}, cssObj) {
  let button = document.createElement('button'),
    btnStyle = button.style,
    default_css_params = {
      backgroundColor: 'blue',
      'box-shadow': '0 4px 4px rgba(0, 0, 0, .2)',
      'border-radius': '8px',
      padding: '0 16px',
      margin: '0px 0px 0px 12px',
      cursor: 'pointer',
      color: '#fff',
    };

  cssObj = cssObj || Object.assign({}, default_css_params, ccs_params);
  _selector.prepend(button);
  button.innerHTML = text;
  button.onclick = onclick;
  Object.keys(cssObj).forEach((key) => (btnStyle[key] = cssObj[key]));
}

function download_csv(data, file_name, sep = ';') {
  let csvContent =
    'data:text/csv;charset=' +
    csv_charset +
    ',' +
    data.map((e) => e.join(sep)).join('\n');
  var encodedUri = encodeURI(csvContent),
    link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', file_name);
  document.body.appendChild(link); // Required for FF
  link.click(); // This will download the data file named "my_data.csv".
}

function parce_input_fields() {
  let list = document.getElementsByClassName('tsft-field'),
    _key,
    _type,
    _value,
    _res = [['input_name', 'input_value', 'input_type']];
  for (let item of list) {
    _type = 'text';
    try {
      _key = item.querySelectorAll(
        '.tsft-field__label,.tsft-datepicker-label'
      )[0].textContent;
      _value = item.getElementsByTagName('input')[0].value;
      if (_value === '') {
        _value = item.querySelectorAll('.tsft-field__body')[0].textContent;
        _type = 'dropdown';
      }
    } catch (e) {
      // инструкции для обработки ошибок
      let parent_n = item.parentNode.parentNode.parentNode.parentNode;
      _key = parent_n.querySelectorAll('.tsft-datepicker-label')[0].textContent;
      _value = item.querySelectorAll('input')[0].value;
      _type = 'datetime';
    }
    _res.push([_key, _value, _type]);
  }
  return _res;
}

function readCSVFile(sep = ';') {
  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = (_) => {
    // you can use this method to get file and perform respective operations
    let files = Array.from(input.files);
    if (files.length > 0) {
      // Selected file
      let file = files[0];
      // FileReader Object
      let reader = new FileReader();
      // Read file as string
      reader.readAsText(file);
      // Load event
      reader.onload = function (event) {
        // Read file data
        let csvdata = event.target.result;
        // Split by line break to gets rows Array

        let _data = csvdata.split('\n').map(function (line) {
          return line.split(sep);
        });
        populate_form(_data.slice(1));
      };
    } else {
      alert('Please select a file.');
    }
  };
  input.click();
}
//input[0].dispatchEvent(new Event('input'));
function populate_form(_array) {
  let _input_list = document.getElementsByClassName('tsft-field'),
    _input;
  for (let i = 0; i < _input_list.length; i++) {
    _input = _input_list[i].getElementsByTagName('input')[0];
    if (_array[i][2] === 'text') {
      _input.value = _array[i][1];
      _input.dispatchEvent(new Event('input'));
    } else if (_array[i][2] === 'dropdown') {
      _input = _input_list[i];
      _input.click();
      setTimeout(function () {
        [...document.querySelectorAll('.tsft-select__option-label')]
          .find((link) => link.textContent === _array[i][1].trim())
          .click();
      }, _dropdown_timeout);
    } else {
    }
  }
}

//document.querySelector('.tsft-info-grid__item')
