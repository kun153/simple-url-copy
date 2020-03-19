
const AMAZON_HOST = "www.amazon.co.jp";

let stores = {
  "excludeQuery": false
}
//テキストのコピー
const copyText = text => {
  let copyTextArea = document.querySelector("#copy-textarea");
  copyTextArea.textContent = text;
  copyTextArea.select();
  document.execCommand('copy');
}

const extractAmazonUrl = rawUrl => {
  const url = new URL(rawUrl);
  if (url.host == AMAZON_HOST && url.pathname.match(/\/dp\/[A-Za-z0-9]+\//)) {
    newUrl = url.origin + url.pathname.replace(/(^\S+)(\/dp\/[A-Za-z0-9]+\/)(.*)/, '$2');
    return newUrl;
  } else {
    return rawUrl;
  }
}

const excludeQuery = rawUrl => {
  const url = new URL(rawUrl);
  const newUrl = url.origin + url.pathname;
  return newUrl;
}

const showCopied = _ => {
  let copied = document.querySelector("#copied");
  copied.classList.remove("invisible");//invisibleを削除
  setTimeout(_ => copied.classList.add("invisible"), 500);//5秒？で追加
}

const copyUrl = menuType => {
  chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, function (tabs) {
    let url = tabs[0].url;//URLの取得
    const title = tabs[0].title;//titleの取得

    // Process AmazonURL
    url = extractAmazonUrl(url);

    // Process Query 
    if(stores.excludeQuery) {
      url = excludeQuery(url);
    }

    let text;
    switch (menuType) {//textの選択
      case "only":
        text = `${url}`
        break;
      case "markdown":
        text = `[${title}](${url})`
        break;
      case "html":
        text = `<a href="${url}">${title}</a>`
        break;
      case "simple":
        text = `${title} ${url}`
        break;
      case "with-newline":
        text = `${title}\n${url}`
        break;
      case "markdown-with-newline":
        text = `[${title}](${url})\n`
        break;
    }
    copyText(text);
    showCopied();
  })
}

const onInit = _ => {
  // First copy simple
  copyUrl("simple");
  document.querySelectorAll(".mdl-button").forEach(el => {
    el.addEventListener("click", onClickCopyMenu);
  });
  document.querySelector("#switchExcludeQuery")
          .addEventListener("click", onClickSwitchExcludeQuery);
}

const onClickSwitchExcludeQuery = evt => {
  stores.excludeQuery = evt.srcElement.checked;
  console.log(evt.srcElement.checked);
}

const onClickCopyMenu = function(evt){
  const menuType = this.id;
  copyUrl(menuType);
}

document.addEventListener("DOMContentLoaded", onInit);